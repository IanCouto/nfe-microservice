import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { Produto } from '../entities';

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

describe('ProdutosController', () => {
  let controller: ProdutosController;
  let service: ProdutosService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn().mockResolvedValue(produtoMock),
      findAll: jest.fn().mockResolvedValue([produtoMock]),
      findOne: jest.fn().mockResolvedValue(produtoMock),
      update: jest.fn().mockResolvedValue(produtoMock),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutosController],
      providers: [{ provide: ProdutosService, useValue: mockService }],
    }).compile();
    controller = module.get<ProdutosController>(ProdutosController);
    service = module.get<ProdutosService>(ProdutosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create', async () => {
    const dto = { descricao: 'P', valorUnitario: 10 };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll should return array', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([produtoMock]);
  });

  it('findOne should call service.findOne', async () => {
    await controller.findOne('uuid-1');
    expect(service.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('update and remove should call service', async () => {
    await controller.update('uuid-1', { descricao: 'X' });
    expect(service.update).toHaveBeenCalledWith('uuid-1', { descricao: 'X' });
    await controller.remove('uuid-1');
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
