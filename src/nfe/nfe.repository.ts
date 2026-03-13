/**
 * Repositório NF-e: persistência de clientes, notas fiscais e itens; próximo número e atualização de status.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente, NotaFiscal, NotaFiscalItem, Produto } from '../entities';
import { CreateNFeDto } from './dto/create-nfe.dto';

@Injectable()
export class NfeRepository {
  constructor(
    @InjectRepository(NotaFiscal)
    private readonly notaFiscalRepo: Repository<NotaFiscal>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(NotaFiscalItem)
    private readonly itemRepo: Repository<NotaFiscalItem>,
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,
  ) {}

  /** Busca ou cria o cliente emitente pelo CNPJ. */
  async findOrCreateEmitente(dto: CreateNFeDto): Promise<Cliente> {
    let emitente = await this.clienteRepo.findOne({ where: { cnpj: dto.emitenteCnpj } });
    if (!emitente) {
      emitente = this.clienteRepo.create({
        cnpj: dto.emitenteCnpj,
        razaoSocial: dto.emitenteRazaoSocial,
        inscricaoEstadual: dto.emitenteIe ?? undefined,
      });
      await this.clienteRepo.save(emitente);
    }
    return emitente;
  }

  /** Retorna o próximo número de NF-e (MAX(numero)+1). */
  async getNextNumero(): Promise<string> {
    const result = await this.notaFiscalRepo
      .createQueryBuilder('n')
      .select('COALESCE(MAX(CAST(n.numero AS INTEGER)), 0) + 1', 'next')
      .getRawOne<{ next: string }>();
    return String(result?.next ?? 1);
  }

  /**
   * Cria a nota fiscal no banco usando o número já reservado (evita race entre XML e registro).
   */
  async createNotaFiscal(
    emitente: Cliente,
    dto: CreateNFeDto,
    xmlEnviado: string,
    numero: string,
    protocolo: string | null,
    chaveAcesso: string | null,
    status: 'em_processamento' | 'autorizada' | 'rejeitada',
    motivoRejeicao?: string,
  ): Promise<NotaFiscal> {
    const valorTotal = dto.itens.reduce(
      (sum, i) => sum + i.quantidade * i.valorUnitario,
      0,
    );

    const nfe = this.notaFiscalRepo.create({
      numero,
      serie: '1',
      emitenteId: emitente.id,
      status,
      protocoloAutorizacao: protocolo,
      chaveAcesso,
      xmlEnviado,
      xmlAutorizado: status === 'autorizada' ? xmlEnviado : null,
      motivoRejeicao: motivoRejeicao ?? null,
      destinatarioCnpj: dto.destinatarioCnpj,
      destinatarioIe: dto.destinatarioIe ?? null,
      destinatarioRazaoSocial: dto.destinatarioRazaoSocial,
      valorTotal,
    });
    await this.notaFiscalRepo.save(nfe);

    for (const item of dto.itens) {
      const valorTotalItem = item.quantidade * item.valorUnitario;
      const itemEntity = new NotaFiscalItem();
      itemEntity.notaFiscalId = nfe.id;
      itemEntity.produtoId = item.produtoId || null;
      itemEntity.descricao = item.descricao;
      itemEntity.quantidade = item.quantidade;
      itemEntity.valorUnitario = item.valorUnitario;
      itemEntity.valorTotal = valorTotalItem;
      itemEntity.cfop = item.cfop ?? null;
      itemEntity.cst = item.cst ?? null;
      itemEntity.ncm = item.ncm ?? null;
      await this.itemRepo.save(itemEntity);
    }

    return this.notaFiscalRepo.findOne({
      where: { id: nfe.id },
      relations: ['itens', 'emitente'],
    }) as Promise<NotaFiscal>;
  }

  /** Atualiza a nota para status autorizada com protocolo, chave e XML. */
  async updateNotaAutorizada(
    id: string,
    protocolo: string,
    chaveAcesso: string,
    xmlAutorizado: string,
  ): Promise<void> {
    await this.notaFiscalRepo.update(id, {
      status: 'autorizada',
      protocoloAutorizacao: protocolo,
      chaveAcesso,
      xmlAutorizado,
    });
  }

  /** Atualiza a nota para status rejeitada e grava o motivo. */
  async updateNotaRejeitada(id: string, motivoRejeicao: string): Promise<void> {
    await this.notaFiscalRepo.update(id, {
      status: 'rejeitada',
      motivoRejeicao,
    });
  }

  /** Busca nota fiscal por ID com itens e emitente. */
  async findById(id: string): Promise<NotaFiscal | null> {
    return this.notaFiscalRepo.findOne({
      where: { id },
      relations: ['itens', 'emitente'],
    });
  }

  /** Lista todas as notas fiscais com itens e emitente. */
  async findAll(): Promise<NotaFiscal[]> {
    return this.notaFiscalRepo.find({
      relations: ['itens', 'emitente'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Atualiza campos da nota (ex.: status, motivoRejeicao). */
  async update(
    id: string,
    data: { status?: string; motivoRejeicao?: string },
  ): Promise<NotaFiscal | null> {
    await this.notaFiscalRepo.update(id, data as Record<string, unknown>);
    return this.findById(id);
  }

  /** Remove nota fiscal (cascade remove itens). */
  async remove(id: string): Promise<void> {
    await this.notaFiscalRepo.delete(id);
  }

  /** Lista itens de uma nota. */
  async findItensByNotaId(notaId: string): Promise<NotaFiscalItem[]> {
    return this.itemRepo.find({
      where: { notaFiscalId: notaId },
      relations: ['produto'],
    });
  }

  /** Verifica se produto existe (para validação ao adicionar item). */
  async findProdutoById(id: string): Promise<Produto | null> {
    return this.produtoRepo.findOne({ where: { id } });
  }

  /** Busca um item por ID e nota. */
  async findItemById(notaId: string, itemId: string): Promise<NotaFiscalItem | null> {
    return this.itemRepo.findOne({
      where: { id: itemId, notaFiscalId: notaId },
      relations: ['produto'],
    });
  }

  /** Adiciona item à nota. */
  async addItem(
    notaId: string,
    data: {
      descricao: string;
      quantidade: number;
      valorUnitario: number;
      cfop?: string | null;
      cst?: string | null;
      ncm?: string | null;
      produtoId?: string | null;
    },
  ): Promise<NotaFiscalItem> {
    const valorTotal = data.quantidade * data.valorUnitario;
    const item = this.itemRepo.create({
      notaFiscalId: notaId,
      descricao: data.descricao,
      quantidade: data.quantidade,
      valorUnitario: data.valorUnitario,
      valorTotal,
      cfop: data.cfop ?? null,
      cst: data.cst ?? null,
      ncm: data.ncm ?? null,
      produtoId: data.produtoId ?? null,
    });
    return this.itemRepo.save(item);
  }

  /** Atualiza item. */
  async updateItem(
    itemId: string,
    data: Partial<{
      descricao: string;
      quantidade: number;
      valorUnitario: number;
      cfop: string;
      cst: string;
      ncm: string;
      produtoId: string | null;
    }>,
  ): Promise<NotaFiscalItem> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) return null as unknown as NotaFiscalItem;
    const update: Record<string, unknown> = { ...data };
    if (data.quantidade != null || data.valorUnitario != null) {
      const q = data.quantidade ?? Number(item.quantidade);
      const v = data.valorUnitario ?? Number(item.valorUnitario);
      update.valorTotal = q * v;
    }
    await this.itemRepo.update(itemId, update);
    return this.itemRepo.findOne({ where: { id: itemId }, relations: ['produto'] }) as Promise<NotaFiscalItem>;
  }

  /** Remove item. */
  async removeItem(itemId: string): Promise<void> {
    await this.itemRepo.delete(itemId);
  }
}
