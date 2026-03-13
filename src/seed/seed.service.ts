/**
 * Serviço de seed: popula o banco com dados de exemplo quando SEED_DB=true.
 * Cria clientes, produtos e uma nota fiscal de exemplo.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente, NotaFiscal, NotaFiscalItem, Produto } from '../entities';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,
    @InjectRepository(NotaFiscal)
    private readonly notaFiscalRepo: Repository<NotaFiscal>,
    @InjectRepository(NotaFiscalItem)
    private readonly itemRepo: Repository<NotaFiscalItem>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SEED_DB !== 'true') return;
    await this.run();
  }

  private async run(): Promise<void> {
    const countClientes = await this.clienteRepo.count();
    if (countClientes > 0) {
      return; // já possui dados
    }

    const clientes = await this.seedClientes();
    const produtos = await this.seedProdutos();
    await this.seedNotaFiscal(clientes, produtos);
  }

  private async seedClientes(): Promise<Cliente[]> {
    const dados = [
      {
        razaoSocial: 'Empresa Emitente Exemplo Ltda',
        nomeFantasia: 'Emitente Exemplo',
        cnpj: '44983453000150',
        inscricaoEstadual: '123456789',
        endereco: 'Rua Exemplo, 100',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01310100',
      },
      {
        razaoSocial: 'Destinatário Exemplo S.A.',
        nomeFantasia: 'Dest Exemplo',
        cnpj: '52751984000146',
        inscricaoEstadual: '987654321',
        endereco: 'Av. Destino, 200',
        municipio: 'Campinas',
        uf: 'SP',
        cep: '13010000',
      },
      {
        razaoSocial: 'Comércio Teste Ltda',
        nomeFantasia: 'Comércio Teste',
        cnpj: '11222333000181',
        inscricaoEstadual: '111222333',
        endereco: 'Rua Teste, 50',
        municipio: 'Curitiba',
        uf: 'PR',
        cep: '80010000',
      },
    ];

    const saved: Cliente[] = [];
    for (const d of dados) {
      const c = this.clienteRepo.create(d);
      saved.push(await this.clienteRepo.save(c));
    }
    return saved;
  }

  private async seedProdutos(): Promise<Produto[]> {
    const dados = [
      { descricao: 'Produto A - Exemplo', codigo: 'PA001', valorUnitario: 10.5, unidade: 'UN', ncm: '12345678', cst: '00', cfop: '5102' },
      { descricao: 'Produto B - Exemplo', codigo: 'PB002', valorUnitario: 25.0, unidade: 'UN', ncm: '87654321', cst: '00', cfop: '5102' },
      { descricao: 'Produto C - Exemplo', codigo: 'PC003', valorUnitario: 100.0, unidade: 'PC', ncm: '11111111', cst: '00', cfop: '5102' },
    ];

    const saved: Produto[] = [];
    for (const d of dados) {
      const p = this.produtoRepo.create(d);
      saved.push(await this.produtoRepo.save(p));
    }
    return saved;
  }

  private async seedNotaFiscal(clientes: Cliente[], produtos: Produto[]): Promise<void> {
    const emitente = clientes[0];
    const destinatario = clientes[1];
    const produto = produtos[0];
    const quantidade = 2;
    const valorUnitario = Number(produto.valorUnitario);
    const valorTotalItem = quantidade * valorUnitario;
    const valorTotalNota = valorTotalItem;

    const nfe = this.notaFiscalRepo.create({
      numero: '1',
      serie: '1',
      emitenteId: emitente.id,
      status: 'autorizada',
      protocoloAutorizacao: '999999999999999',
      chaveAcesso: '35240344983453000146550010000000019999999999',
      xmlEnviado: '<nfeProc><NFe><infNFe/></NFe></nfeProc>',
      xmlAutorizado: '<nfeProc><NFe><infNFe/></NFe></nfeProc>',
      destinatarioCnpj: destinatario.cnpj,
      destinatarioIe: destinatario.inscricaoEstadual,
      destinatarioRazaoSocial: destinatario.razaoSocial,
      valorTotal: valorTotalNota,
    });
    await this.notaFiscalRepo.save(nfe);

    const item = this.itemRepo.create({
      notaFiscalId: nfe.id,
      produtoId: produto.id,
      descricao: produto.descricao,
      quantidade,
      valorUnitario,
      valorTotal: valorTotalItem,
      cfop: produto.cfop,
      cst: produto.cst,
      ncm: produto.ncm,
    });
    await this.itemRepo.save(item);
  }
}
