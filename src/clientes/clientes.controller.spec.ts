import { Test, TestingModule } from '@nestjs/testing';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { Cliente } from '../entities';

const clienteMock: Cliente = {
  id: 'uuid-1',
  razaoSocial: 'Razao',
  nomeFantasia: null,
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

describe('ClientesController', () => {
  let controller: ClientesController;
  let service: ClientesService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn().mockResolvedValue(clienteMock),
      findAll: jest.fn().mockResolvedValue([clienteMock]),
      findOne: jest.fn().mockResolvedValue(clienteMock),
      update: jest.fn().mockResolvedValue(clienteMock),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [{ provide: ClientesService, useValue: mockService }],
    }).compile();
    controller = module.get<ClientesController>(ClientesController);
    service = module.get<ClientesService>(ClientesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create', async () => {
    const dto = { razaoSocial: 'R', cnpj: '11222333000181' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll should return array', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([clienteMock]);
  });

  it('findOne should call service.findOne with id', async () => {
    await controller.findOne('uuid-1');
    expect(service.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('update should call service.update', async () => {
    await controller.update('uuid-1', { razaoSocial: 'Novo' });
    expect(service.update).toHaveBeenCalledWith('uuid-1', { razaoSocial: 'Novo' });
  });

  it('remove should call service.remove', async () => {
    await controller.remove('uuid-1');
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
