import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { XmlValidatorService } from './xml-validator.service';

describe('XmlValidatorService', () => {
  let service: XmlValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XmlValidatorService],
    }).compile();
    service = module.get<XmlValidatorService>(XmlValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const validXml = `<?xml version="1.0"?>
<nfeProc>
  <NFe>
    <infNFe>
      <ide><nNF>1</nNF></ide>
      <emit><CNPJ>12345678000195</CNPJ></emit>
      <dest><CNPJ>98765432000100</CNPJ></dest>
      <det nItem="1"><prod><xProd>Item</xProd></prod></det>
    </infNFe>
  </NFe>
</nfeProc>`;

  describe('validateNFeXml', () => {
    it('should accept valid XML with nfeProc > NFe > infNFe', () => {
      expect(() => service.validateNFeXml(validXml)).not.toThrow();
    });

    it('should throw on empty or null XML', () => {
      expect(() => service.validateNFeXml('')).toThrow(BadRequestException);
      expect(() => service.validateNFeXml((null as unknown) as string)).toThrow(
        BadRequestException,
      );
    });

    it('should throw on malformed XML', () => {
      expect(() => service.validateNFeXml('<root>')).toThrow(BadRequestException);
    });

    it('should throw when XML does not contain infNFe', () => {
      expect(() =>
        service.validateNFeXml('<?xml?><nfeProc><NFe><other/></NFe></nfeProc>'),
      ).toThrow(BadRequestException);
    });

    it('should throw when XML has no det (itens)', () => {
      const xmlSemDet = `<?xml?><nfeProc><NFe><infNFe>
        <ide/><emit><CNPJ>12</CNPJ></emit><dest><CNPJ>98</CNPJ></dest>
      </infNFe></NFe></nfeProc>`;
      expect(() => service.validateNFeXml(xmlSemDet)).toThrow(BadRequestException);
    });
  });

  describe('buildNFeXml', () => {
    it('should build XML with infNFe, emit, dest and det', () => {
      const xml = service.buildNFeXml({
        numero: '1',
        serie: '1',
        emitenteCnpj: '12345678000195',
        emitenteRazaoSocial: 'Empresa',
        destinatarioCnpj: '98765432000100',
        destinatarioRazaoSocial: 'Cliente',
        itens: [
          { descricao: 'Prod A', quantidade: 2, valorUnitario: 10 },
        ],
        valorTotal: 20,
      });
      expect(xml).toContain('<infNFe>');
      expect(xml).toContain('<emit>');
      expect(xml).toContain('<dest>');
      expect(xml).toContain('<det ');
      expect(xml).toContain('12345678000195');
      expect(xml).toContain('Prod A');
      expect(xml).toContain('<vNF>20</vNF>');
    });

    it('should escape special XML characters in description', () => {
      const xml = service.buildNFeXml({
        numero: '1',
        serie: '1',
        emitenteCnpj: '12345678000195',
        emitenteRazaoSocial: 'Empresa & Co',
        destinatarioCnpj: '98765432000100',
        destinatarioRazaoSocial: 'Cliente',
        itens: [{ descricao: 'Prod <test>', quantidade: 1, valorUnitario: 5 }],
        valorTotal: 5,
      });
      expect(xml).toContain('&amp;');
      expect(xml).toContain('&lt;');
      expect(xml).toContain('&gt;');
    });
  });
});
