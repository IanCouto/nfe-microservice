import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaFiscal } from '../entities';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let repo: jest.Mocked<Repository<NotaFiscal>>;

  const notaMock = {
    id: 'nfe-1',
    xmlEnviado: '<xml/>',
  };

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: getRepositoryToken(NotaFiscal), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<WebhookService>(WebhookService);
    repo = module.get(getRepositoryToken(NotaFiscal));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException when notaFiscalId is missing', async () => {
    await expect(service.processarRetorno({})).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when nota does not exist', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(
      service.processarRetorno({ notaFiscalId: 'inexistente' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update to autorizada when status, protocolo and chaveAcesso provided', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(notaMock);
    const result = await service.processarRetorno({
      notaFiscalId: 'nfe-1',
      status: 'autorizada',
      protocolo: 'proto-123',
      chaveAcesso: '1'.repeat(44),
    });
    expect(repo.update).toHaveBeenCalledWith(
      'nfe-1',
      expect.objectContaining({
        status: 'autorizada',
        protocoloAutorizacao: 'proto-123',
        chaveAcesso: '1'.repeat(44),
      }),
    );
    expect(result).toMatchObject({ message: 'NF-e atualizada para autorizada', notaFiscalId: 'nfe-1' });
  });

  it('should update to rejeitada when status rejeitada', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(notaMock);
    const result = await service.processarRetorno({
      notaFiscalId: 'nfe-1',
      status: 'rejeitada',
      motivoRejeicao: 'Motivo X',
    });
    expect(repo.update).toHaveBeenCalledWith(
      'nfe-1',
      expect.objectContaining({ status: 'rejeitada', motivoRejeicao: 'Motivo X' }),
    );
    expect(result).toMatchObject({ message: 'NF-e atualizada para rejeitada' });
  });

  it('should throw BadRequestException when autorizada without protocolo/chave', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(notaMock);
    await expect(
      service.processarRetorno({ notaFiscalId: 'nfe-1', status: 'autorizada' }),
    ).rejects.toThrow(BadRequestException);
  });
});
