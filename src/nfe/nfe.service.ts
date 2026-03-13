/**
 * Serviço de negócio da NF-e: orquestra validação, geração de XML, persistência e envio ao SEFAZ (mock).
 */
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { NfeRepository } from './nfe.repository';
import { NfeValidationService } from './nfe-validation.service';
import { SefazMockService } from './sefaz/sefaz-mock.service';
import { XmlValidatorService } from './sefaz/xml-validator.service';
import { CreateNFeDto } from './dto/create-nfe.dto';
import { UpdateNfeDto } from './dto/update-nfe.dto';
import { CreateNfeItemDto } from './dto/create-nfe-item.dto';
import { UpdateNfeItemDto } from './dto/update-nfe-item.dto';

@Injectable()
export class NfeService {
  private readonly logger = new Logger(NfeService.name);

  constructor(
    private readonly repository: NfeRepository,
    private readonly validation: NfeValidationService,
    private readonly sefaz: SefazMockService,
    private readonly xmlValidator: XmlValidatorService,
  ) {}

  /** Valida DTO, gera XML, persiste a nota e dispara processamento assíncrono com a SEFAZ. */
  async emitir(dto: CreateNFeDto) {
    this.validation.validateCreateDto(dto);
    for (const item of dto.itens) {
      if (item.produtoId) {
        const prod = await this.repository.findProdutoById(item.produtoId);
        if (!prod) throw new BadRequestException(`Produto não encontrado: ${item.produtoId}`);
      }
    }

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
      numero,
      null,
      null,
      'em_processamento',
    );

    // Processamento assíncrono com SEFAZ (mock) — simula fila de emissão
    this.processarSefaz(nota.id, xmlEnviado).catch((err) => {
      this.logger.error(`Falha ao processar SEFAZ para nota ${nota.id}: ${err?.message ?? err}`);
    });

    return {
      id: nota.id,
      numero: nota.numero,
      status: nota.status,
      message: 'NF-e recebida e em processamento. Consulte GET /nfe/:id para o status.',
    };
  }

  /** Envia XML ao SEFAZ (mock) e atualiza status da nota para autorizada ou rejeitada. */
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

  /** Retorna status, protocolo e motivo de rejeição (se houver) da NF-e. */
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

  /** Retorna o XML da NF-e autorizada; falha se não existir ou não estiver autorizada. */
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

  /** Lista todas as notas fiscais. */
  async findAll() {
    return this.repository.findAll();
  }

  /** Atualiza NF-e (status, motivoRejeicao). */
  async update(id: string, dto: UpdateNfeDto) {
    const nota = await this.repository.findById(id);
    if (!nota) throw new NotFoundException('NF-e não encontrada');
    const updated = await this.repository.update(id, {
      status: dto.status,
      motivoRejeicao: dto.motivoRejeicao,
    });
    return updated;
  }

  /** Remove NF-e (e itens em cascade). */
  async remove(id: string): Promise<void> {
    const nota = await this.repository.findById(id);
    if (!nota) throw new NotFoundException('NF-e não encontrada');
    await this.repository.remove(id);
  }

  /** Lista itens de uma NF-e. */
  async listItens(notaId: string) {
    await this.getStatus(notaId);
    return this.repository.findItensByNotaId(notaId);
  }

  /** Retorna um item da NF-e. */
  async getItem(notaId: string, itemId: string) {
    await this.getStatus(notaId);
    const item = await this.repository.findItemById(notaId, itemId);
    if (!item) throw new NotFoundException('Item não encontrado');
    return item;
  }

  /** Adiciona item à NF-e. */
  async addItem(notaId: string, dto: CreateNfeItemDto) {
    const nota = await this.repository.findById(notaId);
    if (!nota) throw new NotFoundException('NF-e não encontrada');
    if (dto.produtoId) {
      const prod = await this.repository.findProdutoById(dto.produtoId);
      if (!prod) throw new BadRequestException('Produto não encontrado');
    }
    return this.repository.addItem(notaId, {
      descricao: dto.descricao,
      quantidade: dto.quantidade,
      valorUnitario: dto.valorUnitario,
      cfop: dto.cfop,
      cst: dto.cst,
      ncm: dto.ncm,
      produtoId: dto.produtoId,
    });
  }

  /** Atualiza item da NF-e. */
  async updateItem(notaId: string, itemId: string, dto: UpdateNfeItemDto) {
    await this.getItem(notaId, itemId);
    return this.repository.updateItem(itemId, dto as Record<string, unknown>);
  }

  /** Remove item da NF-e. */
  async removeItem(notaId: string, itemId: string): Promise<void> {
    await this.getItem(notaId, itemId);
    await this.repository.removeItem(itemId);
  }
}
