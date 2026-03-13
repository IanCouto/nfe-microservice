import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NfeRepository } from './nfe.repository';
import { NfeService } from './nfe.service';
import { NfeValidationService } from './nfe-validation.service';
import { SefazMockService } from './sefaz/sefaz-mock.service';
import { XmlValidatorService } from './sefaz/xml-validator.service';
import { CreateNFeDto } from './dto/create-nfe.dto';
import { UpdateNfeDto } from './dto/update-nfe.dto';

const notaMock = {
  id: 'nfe-uuid-1',
  numero: '1',
  serie: '1',
  status: 'autorizada' as const,
  protocoloAutorizacao: 'proto-123',
  motivoRejeicao: null,
  xmlAutorizado: '<nfeProc><NFe><infNFe/></NFe></nfeProc>',
  createdAt: new Date(),
};

describe('NfeService', () => {
  let service: NfeService;
  let repository: jest.Mocked<NfeRepository>;

  beforeEach(async () => {
    const mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findItensByNotaId: jest.fn(),
      findItemById: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      findProdutoById: jest.fn(),
      findOrCreateEmitente: jest.fn(),
      getNextNumero: jest.fn(),
      createNotaFiscal: jest.fn(),
      updateNotaAutorizada: jest.fn(),
      updateNotaRejeitada: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfeService,
        { provide: NfeRepository, useValue: mockRepo },
        { provide: NfeValidationService, useValue: { validateCreateDto: jest.fn() } },
        {
          provide: SefazMockService,
          useValue: { enviarNota: jest.fn().mockResolvedValue({ success: true, protocolo: 'p', chaveAcesso: '1'.repeat(44) }) },
        },
        {
          provide: XmlValidatorService,
          useValue: { buildNFeXml: jest.fn().mockReturnValue('<xml/>'), validateNFeXml: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<NfeService>(NfeService);
    repository = module.get(NfeRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return status when nota exists', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      const result = await service.getStatus('nfe-uuid-1');
      expect(result).toMatchObject({
        id: notaMock.id,
        numero: notaMock.numero,
        status: 'autorizada',
        protocoloAutorizacao: notaMock.protocoloAutorizacao,
      });
    });

    it('should throw NotFoundException when nota does not exist', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getStatus('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getXml', () => {
    it('should return xml when nota is autorizada', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      const result = await service.getXml('nfe-uuid-1');
      expect(result.xml).toBe(notaMock.xmlAutorizado);
    });

    it('should throw NotFoundException when nota does not exist', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getXml('inexistente')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when status is not autorizada', async () => {
      (repository.findById as jest.Mock).mockResolvedValue({
        ...notaMock,
        status: 'em_processamento',
        xmlAutorizado: null,
      });
      await expect(service.getXml('nfe-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return list from repository', async () => {
      (repository.findAll as jest.Mock).mockResolvedValue([notaMock]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return nota', async () => {
      const updated = { ...notaMock, status: 'rejeitada' as const };
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.update as jest.Mock).mockResolvedValue(updated);
      const dto: UpdateNfeDto = { status: 'rejeitada' };
      const result = await service.update('nfe-uuid-1', dto);
      expect(repository.update).toHaveBeenCalledWith('nfe-uuid-1', {
        status: dto.status,
        motivoRejeicao: undefined,
      });
      expect(result).toBeDefined();
      expect(result!.status).toBe('rejeitada');
    });

    it('should throw NotFoundException when nota does not exist', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.update('inexistente', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call repository.remove', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.remove as jest.Mock).mockResolvedValue(undefined);
      await service.remove('nfe-uuid-1');
      expect(repository.remove).toHaveBeenCalledWith('nfe-uuid-1');
    });

    it('should throw NotFoundException when nota does not exist', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listItens', () => {
    it('should return itens from repository', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.findItensByNotaId as jest.Mock).mockResolvedValue([]);
      const result = await service.listItens('nfe-uuid-1');
      expect(result).toEqual([]);
      expect(repository.findItensByNotaId).toHaveBeenCalledWith('nfe-uuid-1');
    });
  });

  describe('getItem', () => {
    it('should return item when found', async () => {
      const itemMock = { id: 'item-1', descricao: 'Item', quantidade: 1 };
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.findItemById as jest.Mock).mockResolvedValue(itemMock);
      const result = await service.getItem('nfe-uuid-1', 'item-1');
      expect(result).toEqual(itemMock);
    });

    it('should throw NotFoundException when item not found', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.findItemById as jest.Mock).mockResolvedValue(null);
      await expect(service.getItem('nfe-uuid-1', 'item-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addItem', () => {
    it('should throw BadRequestException when produtoId does not exist', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.findProdutoById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.addItem('nfe-uuid-1', {
          descricao: 'Item',
          quantidade: 1,
          valorUnitario: 10,
          produtoId: 'prod-inexistente',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call repository.addItem when produto exists', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.findProdutoById as jest.Mock).mockResolvedValue({ id: 'prod-1' });
      (repository.addItem as jest.Mock).mockResolvedValue({ id: 'item-1' });
      const dto = { descricao: 'Item', quantidade: 1, valorUnitario: 10 };
      await service.addItem('nfe-uuid-1', dto);
      expect(repository.addItem).toHaveBeenCalledWith('nfe-uuid-1', expect.objectContaining(dto));
    });
  });

  describe('removeItem', () => {
    it('should call repository.removeItem when item exists', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.findItemById as jest.Mock).mockResolvedValue({ id: 'item-1' });
      (repository.removeItem as jest.Mock).mockResolvedValue(undefined);
      await service.removeItem('nfe-uuid-1', 'item-1');
      expect(repository.removeItem).toHaveBeenCalledWith('item-1');
    });
  });

  describe('emitir', () => {
    const validDto: CreateNFeDto = {
      emitenteCnpj: '11222333000181',
      emitenteRazaoSocial: 'Emitente LTDA',
      destinatarioCnpj: '06990590000123',
      destinatarioRazaoSocial: 'Destinatario SA',
      itens: [{ descricao: 'Item 1', quantidade: 2, valorUnitario: 10 }],
    };

    it('should create nota and return id, numero, status', async () => {
      const emitente = { id: 'cli-1', cnpj: validDto.emitenteCnpj } as any;
      (repository.findOrCreateEmitente as jest.Mock).mockResolvedValue(emitente);
      (repository.getNextNumero as jest.Mock).mockResolvedValue('1');
      (repository.createNotaFiscal as jest.Mock).mockResolvedValue({
        id: 'nfe-new',
        numero: '1',
        status: 'em_processamento',
      });
      const result = await service.emitir(validDto);
      expect(result).toMatchObject({
        id: 'nfe-new',
        numero: '1',
        status: 'em_processamento',
      });
      expect(repository.findOrCreateEmitente).toHaveBeenCalledWith(validDto);
      expect(repository.createNotaFiscal).toHaveBeenCalled();
    });

    it('should throw BadRequestException when produtoId does not exist', async () => {
      const dtoWithProd = {
        ...validDto,
        itens: [{ ...validDto.itens[0], produtoId: 'prod-inexistente' }],
      };
      (repository.findProdutoById as jest.Mock).mockResolvedValue(null);
      await expect(service.emitir(dtoWithProd)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateItem', () => {
    it('should call repository.updateItem after getItem', async () => {
      (repository.findById as jest.Mock).mockResolvedValue(notaMock);
      (repository.findItemById as jest.Mock).mockResolvedValue({ id: 'item-1' });
      (repository.updateItem as jest.Mock).mockResolvedValue({ id: 'item-1', descricao: 'X' });
      const result = await service.updateItem('nfe-uuid-1', 'item-1', { descricao: 'X' });
      expect(repository.updateItem).toHaveBeenCalledWith('item-1', { descricao: 'X' });
      expect(result).toBeDefined();
    });
  });
});
