import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../entities';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

describe('ClientesService', () => {
  let service: ClientesService;
  let repo: jest.Mocked<Repository<Cliente>>;

  const clienteMock: Cliente = {
    id: 'uuid-1',
    razaoSocial: 'Razao',
    nomeFantasia: 'Fantasia',
    cnpj: '11222333000181',
    inscricaoEstadual: null,
    endereco: null,
    municipio: null,
    uf: null,
    cep: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    notasFiscais: [],
  };

  const createDto: CreateClienteDto = {
    razaoSocial: 'Razao Social',
    cnpj: '11222333000181',
  };

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ ...clienteMock, ...dto })),
      save: jest.fn((entity) => Promise.resolve({ ...clienteMock, ...entity })),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: getRepositoryToken(Cliente),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    repo = module.get(getRepositoryToken(Cliente));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create cliente when CNPJ does not exist', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.save as jest.Mock).mockResolvedValue(clienteMock);
      const result = await service.create(createDto);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { cnpj: createDto.cnpj } });
      expect(repo.create).toHaveBeenCalledWith(createDto);
      expect(result).toBeDefined();
    });

    it('should throw ConflictException when CNPJ already exists', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(clienteMock);
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of clientes', async () => {
      (repo.find as jest.Mock).mockResolvedValue([clienteMock]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith({ order: { razaoSocial: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('should return cliente by id', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(clienteMock);
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(clienteMock);
    });

    it('should throw NotFoundException when not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCnpj', () => {
    it('should return cliente or null', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(clienteMock);
      const result = await service.findByCnpj('11222333000181');
      expect(result).toEqual(clienteMock);
    });
  });

  describe('update', () => {
    it('should update and return cliente', async () => {
      (repo.findOne as jest.Mock)
        .mockResolvedValueOnce(clienteMock)
        .mockResolvedValueOnce(null);
      (repo.save as jest.Mock).mockResolvedValue({ ...clienteMock, razaoSocial: 'Novo' });
      const dto: UpdateClienteDto = { razaoSocial: 'Novo' };
      const result = await service.update('uuid-1', dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result.razaoSocial).toBe('Novo');
    });

    it('should throw ConflictException when updating to existing CNPJ', async () => {
      (repo.findOne as jest.Mock)
        .mockResolvedValueOnce(clienteMock)
        .mockResolvedValueOnce({ id: 'outro', cnpj: '99999999000199' });
      await expect(
        service.update('uuid-1', { cnpj: '99999999000199' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove cliente', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(clienteMock);
      (repo.remove as jest.Mock).mockResolvedValue(undefined);
      await service.remove('uuid-1');
      expect(repo.remove).toHaveBeenCalledWith(clienteMock);
    });
  });
});
