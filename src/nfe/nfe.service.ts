import { Injectable, NotFoundException } from '@nestjs/common';
import { NfeRepository } from './nfe.repository';
import { NfeValidationService } from './nfe-validation.service';
import { SefazMockService } from './sefaz/sefaz-mock.service';
import { XmlValidatorService } from './sefaz/xml-validator.service';
import { CreateNFeDto } from './dto/create-nfe.dto';

@Injectable()
export class NfeService {
  constructor(
    private readonly repository: NfeRepository,
    private readonly validation: NfeValidationService,
    private readonly sefaz: SefazMockService,
    private readonly xmlValidator: XmlValidatorService,
  ) {}

  async emitir(dto: CreateNFeDto) {
    this.validation.validateCreateDto(dto);

    const emitente = await this.repository.findOrCreateEmitente(dto);
    const numero = await this.repository.getNextNumero();
    const valorTotal = dto.itens.reduce(
      (sum, i) => sum + i.quantidade * i.valorUnitario,
      0,
    );

    const xmlEnviado = this.xmlValidator.buildNFeXml({
      numero,
      serie: '1',
      emitenteCnpj: dto.emitenteCnpj,
      emitenteRazaoSocial: dto.emitenteRazaoSocial,
      emitenteIe: dto.emitenteIe,
      destinatarioCnpj: dto.destinatarioCnpj,
      destinatarioRazaoSocial: dto.destinatarioRazaoSocial,
      destinatarioIe: dto.destinatarioIe,
      itens: dto.itens.map((i) => ({
        descricao: i.descricao,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
        cfop: i.cfop,
        cst: i.cst,
        ncm: i.ncm,
      })),
      valorTotal,
    });

    this.xmlValidator.validateNFeXml(xmlEnviado);

    const nota = await this.repository.createNotaFiscal(
      emitente,
      dto,
      xmlEnviado,
      null,
      null,
      'em_processamento',
    );

    // Processamento assíncrono com SEFAZ (mock)
    this.processarSefaz(nota.id, xmlEnviado).catch(() => {});

    return {
      id: nota.id,
      numero: nota.numero,
      status: nota.status,
      message: 'NF-e recebida e em processamento. Consulte GET /nfe/:id para o status.',
    };
  }

  private async processarSefaz(notaId: string, xmlEnviado: string): Promise<void> {
    const result = await this.sefaz.enviarNota(xmlEnviado);
    if (result.success && result.protocolo && result.chaveAcesso) {
      await this.repository.updateNotaAutorizada(
        notaId,
        result.protocolo,
        result.chaveAcesso,
        xmlEnviado,
      );
    } else {
      await this.repository.updateNotaRejeitada(
        notaId,
        result.motivoRejeicao ?? 'Rejeição SEFAZ (mock)',
      );
    }
  }

  async getStatus(id: string) {
    const nota = await this.repository.findById(id);
    if (!nota) throw new NotFoundException('NF-e não encontrada');
    return {
      id: nota.id,
      numero: nota.numero,
      serie: nota.serie,
      status: nota.status,
      protocoloAutorizacao: nota.protocoloAutorizacao,
      motivoRejeicao: nota.motivoRejeicao,
      createdAt: nota.createdAt,
    };
  }

  async getXml(id: string): Promise<{ xml: string }> {
    const nota = await this.repository.findById(id);
    if (!nota) throw new NotFoundException('NF-e não encontrada');
    if (nota.status !== 'autorizada' || !nota.xmlAutorizado) {
      throw new NotFoundException(
        'XML disponível apenas para NF-e autorizada. Status atual: ' + nota.status,
      );
    }
    return { xml: nota.xmlAutorizado };
  }
}
