/**
 * Serviço CRUD de Clientes.
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../entities';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
  ) {}

  /** Cria um cliente. Falha se CNPJ já existir. */
  async create(dto: CreateClienteDto): Promise<Cliente> {
    const existente = await this.repo.findOne({ where: { cnpj: dto.cnpj } });
    if (existente) {
      throw new ConflictException('Já existe cliente com este CNPJ');
    }
    const cliente = this.repo.create(dto);
    return this.repo.save(cliente);
  }

  /** Lista todos os clientes. */
  async findAll(): Promise<Cliente[]> {
    return this.repo.find({ order: { razaoSocial: 'ASC' } });
  }

  /** Busca cliente por ID. */
  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.repo.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    return cliente;
  }

  /** Busca cliente por CNPJ. */
  async findByCnpj(cnpj: string): Promise<Cliente | null> {
    return this.repo.findOne({ where: { cnpj } });
  }

  /** Atualiza cliente. */
  async update(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);
    if (dto.cnpj && dto.cnpj !== cliente.cnpj) {
      const existente = await this.repo.findOne({ where: { cnpj: dto.cnpj } });
      if (existente) throw new ConflictException('Já existe cliente com este CNPJ');
    }
    Object.assign(cliente, dto);
    return this.repo.save(cliente);
  }

  /** Remove cliente. */
  async remove(id: string): Promise<void> {
    const cliente = await this.findOne(id);
    await this.repo.remove(cliente);
  }
}
