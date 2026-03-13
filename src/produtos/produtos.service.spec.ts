import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from '../entities';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

describe('ProdutosService', () => {
  let service: ProdutosService;
  let repo: jest.Mocked<Repository<Produto>>;

  const produtoMock: Produto = {
    id: 'uuid-1',
    descricao: 'Produto A',
    codigo: null,
    valorUnitario: 10,
    unidade: 'UN',
    ncm: null,
    cst: null,
    cfop: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createDto: CreateProdutoDto = {
    descricao: 'Produto Novo',
    valorUnitario: 25.5,
  };

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ ...produtoMock, ...dto, unidade: dto.unidade ?? 'UN' })),
      save: jest.fn((entity) => Promise.resolve({ ...produtoMock, ...entity })),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        {
          provide: getRepositoryToken(Produto),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ProdutosService>(ProdutosService);
    repo = module.get(getRepositoryToken(Produto));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create produto with default unidade UN', async () => {
      (repo.save as jest.Mock).mockResolvedValue(produtoMock);
      const result = await service.create(createDto);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ...createDto, unidade: 'UN' }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return array of produtos', async () => {
      (repo.find as jest.Mock).mockResolvedValue([produtoMock]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith({ order: { descricao: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('should return produto by id', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(produtoMock);
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(produtoMock);
    });

    it('should throw NotFoundException when not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return produto', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(produtoMock);
      (repo.save as jest.Mock).mockResolvedValue({ ...produtoMock, descricao: 'Atualizado' });
      const dto: UpdateProdutoDto = { descricao: 'Atualizado' };
      const result = await service.update('uuid-1', dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result.descricao).toBe('Atualizado');
    });
  });

  describe('remove', () => {
    it('should remove produto', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(produtoMock);
      (repo.remove as jest.Mock).mockResolvedValue(undefined);
      await service.remove('uuid-1');
      expect(repo.remove).toHaveBeenCalledWith(produtoMock);
    });
  });
});
