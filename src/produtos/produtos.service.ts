/**
 * Serviço CRUD de Produtos.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from '../entities';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly repo: Repository<Produto>,
  ) {}

  /** Cria um produto. */
  async create(dto: CreateProdutoDto): Promise<Produto> {
    const produto = this.repo.create({
      ...dto,
      unidade: dto.unidade ?? 'UN',
    });
    return this.repo.save(produto);
  }

  /** Lista todos os produtos. */
  async findAll(): Promise<Produto[]> {
    return this.repo.find({ order: { descricao: 'ASC' } });
  }

  /** Busca produto por ID. */
  async findOne(id: string): Promise<Produto> {
    const produto = await this.repo.findOne({ where: { id } });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return produto;
  }

  /** Atualiza produto. */
  async update(id: string, dto: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.findOne(id);
    Object.assign(produto, dto);
    return this.repo.save(produto);
  }

  /** Remove produto. */
  async remove(id: string): Promise<void> {
    const produto = await this.findOne(id);
    await this.repo.remove(produto);
  }
}
