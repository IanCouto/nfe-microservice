import { Test, TestingModule } from '@nestjs/testing';
import { SefazMockService } from './sefaz-mock.service';

describe('SefazMockService', () => {
  let service: SefazMockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SefazMockService],
    }).compile();
    service = module.get<SefazMockService>(SefazMockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enviarNota', () => {
    it('should return success with protocolo and chaveAcesso', async () => {
      const result = await service.enviarNota('<xml/>');
      expect(result.success).toBe(true);
      expect(result.protocolo).toBeDefined();
      expect(typeof result.protocolo).toBe('string');
      expect(result.chaveAcesso).toBeDefined();
      expect(result.chaveAcesso).toHaveLength(44);
      expect(/^\d+$/.test(result.chaveAcesso!)).toBe(true);
    });

    it('should return different protocolo on each call', async () => {
      const [r1, r2] = await Promise.all([
        service.enviarNota('<xml/>'),
        service.enviarNota('<xml/>'),
      ]);
      expect(r1.protocolo).not.toBe(r2.protocolo);
    });
  });
});
