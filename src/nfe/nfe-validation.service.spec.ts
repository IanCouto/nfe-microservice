import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NfeValidationService } from './nfe-validation.service';
import { CreateNFeDto } from './dto/create-nfe.dto';

describe('NfeValidationService', () => {
  let service: NfeValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfeValidationService],
    }).compile();
    service = module.get<NfeValidationService>(NfeValidationService);
  });

  const validDto: CreateNFeDto = {
    emitenteCnpj: '11222333000181',
    emitenteRazaoSocial: 'Emitente LTDA',
    destinatarioCnpj: '06990590000123',
    destinatarioRazaoSocial: 'Destinatario SA',
    itens: [{ descricao: 'Item 1', quantidade: 1, valorUnitario: 100 }],
  };

  it('should accept valid DTO', () => {
    expect(() => service.validateCreateDto(validDto)).not.toThrow();
  });

  it('should reject same CNPJ for emitente and destinatario', () => {
    const dto = { ...validDto, destinatarioCnpj: validDto.emitenteCnpj };
    expect(() => service.validateCreateDto(dto)).toThrow(BadRequestException);
  });

  it('should reject invalid emitente CNPJ', () => {
    const dto = { ...validDto, emitenteCnpj: '00000000000000' };
    expect(() => service.validateCreateDto(dto)).toThrow(BadRequestException);
  });

  it('should reject empty itens', () => {
    const dto = { ...validDto, itens: [] };
    expect(() => service.validateCreateDto(dto)).toThrow(BadRequestException);
  });

  it('should reject invalid destinatario CNPJ', () => {
    const dto = { ...validDto, destinatarioCnpj: '11111111111111' };
    expect(() => service.validateCreateDto(dto)).toThrow(BadRequestException);
  });

  it('should reject item with invalid CFOP (not 4 digits)', () => {
    const dto = {
      ...validDto,
      itens: [{ ...validDto.itens[0], cfop: '123' }],
    };
    expect(() => service.validateCreateDto(dto)).toThrow(BadRequestException);
  });

  it('should reject item with invalid CST (empty or > 3 chars)', () => {
    const dto = {
      ...validDto,
      itens: [{ ...validDto.itens[0], cst: '' }],
    };
    expect(() => service.validateCreateDto(dto)).toThrow(BadRequestException);
  });

  it('should accept valid CFOP and CST', () => {
    const dto = {
      ...validDto,
      itens: [{ ...validDto.itens[0], cfop: '5102', cst: '00' }],
    };
    expect(() => service.validateCreateDto(dto)).not.toThrow();
  });
});
