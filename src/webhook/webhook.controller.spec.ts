import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

describe('WebhookController', () => {
  let controller: WebhookController;

  beforeEach(async () => {
    const mockService = {
      processarRetorno: jest.fn().mockResolvedValue({ message: 'OK' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [{ provide: WebhookService, useValue: mockService }],
    }).compile();
    controller = module.get<WebhookController>(WebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('retornoSefaz should call service.processarRetorno', async () => {
    const body = { notaFiscalId: 'nfe-1', status: 'autorizada' as const, protocolo: 'p', chaveAcesso: '1'.repeat(44) };
    const result = await controller.retornoSefaz(body);
    expect(result).toEqual({ message: 'OK' });
  });
});
