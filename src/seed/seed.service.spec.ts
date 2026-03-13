import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente, NotaFiscal, NotaFiscalItem, Produto } from '../entities';
import { SeedService } from './seed.service';

describe('SeedService', () => {
  let service: SeedService;
  let clienteRepo: jest.Mocked<Repository<Cliente>>;
  let produtoRepo: jest.Mocked<Repository<Produto>>;
  let notaFiscalRepo: jest.Mocked<Repository<NotaFiscal>>;
  let itemRepo: jest.Mocked<Repository<NotaFiscalItem>>;

  const originalEnv = process.env;

  beforeEach(async () => {
    const mockClienteRepo = {
      count: jest.fn(),
      create: jest.fn((d: any) => ({ ...d, id: undefined })),
      save: jest.fn((e: any) => Promise.resolve({ ...e, id: e.id || 'id-' + Math.random() })),
    };
    const mockProdutoRepo = {
      create: jest.fn((d: any) => ({ ...d })),
      save: jest.fn((e: any) => Promise.resolve({ ...e, id: e.id || 'prod-id' })),
    };
    const mockNotaRepo = {
      create: jest.fn((d: any) => ({ ...d, id: undefined })),
      save: jest.fn((e: any) => Promise.resolve({ ...e, id: 'nfe-id' })),
    };
    const mockItemRepo = {
      create: jest.fn((d: any) => ({ ...d })),
      save: jest.fn((e: any) => Promise.resolve({ ...e, id: 'item-id' })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getRepositoryToken(Cliente), useValue: mockClienteRepo },
        { provide: getRepositoryToken(Produto), useValue: mockProdutoRepo },
        { provide: getRepositoryToken(NotaFiscal), useValue: mockNotaRepo },
        { provide: getRepositoryToken(NotaFiscalItem), useValue: mockItemRepo },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    clienteRepo = module.get(getRepositoryToken(Cliente));
    produtoRepo = module.get(getRepositoryToken(Produto));
    notaFiscalRepo = module.get(getRepositoryToken(NotaFiscal));
    itemRepo = module.get(getRepositoryToken(NotaFiscalItem));
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('onModuleInit should do nothing when SEED_DB is not true', async () => {
    process.env.SEED_DB = 'false';
    await service.onModuleInit();
    expect(clienteRepo.count).not.toHaveBeenCalled();
  });

  it('onModuleInit should do nothing when clientes already exist', async () => {
    process.env.SEED_DB = 'true';
    (clienteRepo.count as jest.Mock).mockResolvedValue(1);
    await service.onModuleInit();
    expect(clienteRepo.count).toHaveBeenCalled();
    expect(clienteRepo.save).not.toHaveBeenCalled();
  });

  it('onModuleInit should seed when SEED_DB is true and no clientes', async () => {
    process.env.SEED_DB = 'true';
    (clienteRepo.count as jest.Mock).mockResolvedValue(0);
    (clienteRepo.save as jest.Mock).mockImplementation((e: any) =>
      Promise.resolve({ ...e, id: 'c-' + (e.cnpj || '').slice(-4) }),
    );
    await service.onModuleInit();
    expect(clienteRepo.count).toHaveBeenCalled();
    expect(clienteRepo.save).toHaveBeenCalled();
    expect(produtoRepo.save).toHaveBeenCalled();
    expect(notaFiscalRepo.save).toHaveBeenCalled();
    expect(itemRepo.save).toHaveBeenCalled();
  });
});
