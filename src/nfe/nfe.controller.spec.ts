import { Test, TestingModule } from '@nestjs/testing';
import { NfeController } from './nfe.controller';
import { NfeService } from './nfe.service';

const notaMock = { id: 'nfe-1', numero: '1', status: 'autorizada' };

describe('NfeController', () => {
  let controller: NfeController;
  let service: NfeService;

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn().mockResolvedValue([notaMock]),
      emitir: jest.fn().mockResolvedValue({ id: 'nfe-1', numero: '1', status: 'em_processamento' }),
      getStatus: jest.fn().mockResolvedValue(notaMock),
      getXml: jest.fn().mockResolvedValue({ xml: '<nfe/>' }),
      listItens: jest.fn().mockResolvedValue([]),
      addItem: jest.fn().mockResolvedValue({ id: 'item-1' }),
      getItem: jest.fn().mockResolvedValue({ id: 'item-1' }),
      updateItem: jest.fn().mockResolvedValue({ id: 'item-1' }),
      removeItem: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(notaMock),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NfeController],
      providers: [{ provide: NfeService, useValue: mockService }],
    }).compile();
    controller = module.get<NfeController>(NfeController);
    service = module.get<NfeService>(NfeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return list', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([notaMock]);
  });

  it('create should call emitir', async () => {
    const dto = {
      emitenteCnpj: '11222333000181',
      emitenteRazaoSocial: 'E',
      destinatarioCnpj: '06990590000123',
      destinatarioRazaoSocial: 'D',
      itens: [{ descricao: 'I', quantidade: 1, valorUnitario: 10 }],
    };
    await controller.create(dto);
    expect(service.emitir).toHaveBeenCalledWith(dto);
  });

  it('getStatus should call service.getStatus', async () => {
    await controller.getStatus('nfe-1');
    expect(service.getStatus).toHaveBeenCalledWith('nfe-1');
  });

  it('getXml should return xml string', async () => {
    const result = await controller.getXml('nfe-1');
    expect(result).toBe('<nfe/>');
    expect(service.getXml).toHaveBeenCalledWith('nfe-1');
  });

  it('listItens, addItem, getItem, updateItem, removeItem should call service', async () => {
    await controller.listItens('nfe-1');
    expect(service.listItens).toHaveBeenCalledWith('nfe-1');
    await controller.addItem('nfe-1', { descricao: 'I', quantidade: 1, valorUnitario: 10 });
    expect(service.addItem).toHaveBeenCalledWith('nfe-1', expect.any(Object));
    await controller.getItem('nfe-1', 'item-1');
    expect(service.getItem).toHaveBeenCalledWith('nfe-1', 'item-1');
    await controller.updateItem('nfe-1', 'item-1', { descricao: 'X' });
    expect(service.updateItem).toHaveBeenCalledWith('nfe-1', 'item-1', { descricao: 'X' });
    await controller.removeItem('nfe-1', 'item-1');
    expect(service.removeItem).toHaveBeenCalledWith('nfe-1', 'item-1');
  });

  it('update and remove should call service', async () => {
    await controller.update('nfe-1', { status: 'rejeitada' });
    expect(service.update).toHaveBeenCalledWith('nfe-1', { status: 'rejeitada' });
    await controller.remove('nfe-1');
    expect(service.remove).toHaveBeenCalledWith('nfe-1');
  });
});
