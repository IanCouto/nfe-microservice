import { Injectable, BadRequestException } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

/**
 * Validação de XML da NF-e conforme estrutura esperada (simulação de validação via XSD).
 * Em produção, usar libxmljs2 ou similar com XSD real.
 */
@Injectable()
export class XmlValidatorService {
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
  });

  validateNFeXml(xml: string): void {
    if (!xml || typeof xml !== 'string') {
      throw new BadRequestException('XML inválido ou vazio');
    }

    let parsed: unknown;
    try {
      parsed = this.parser.parse(xml);
    } catch {
      throw new BadRequestException('XML malformado');
    }

    const obj = parsed as Record<string, unknown>;
    const nfe = obj.nfeProc ?? obj.NFe ?? obj.nfe;
    if (!nfe) {
      throw new BadRequestException('XML não contém elemento raiz NFe/nfeProc');
    }

    const infNFe = (nfe as Record<string, unknown>).infNFe ?? (nfe as Record<string, unknown>).infNfe;
    if (!infNFe) {
      throw new BadRequestException('XML não contém infNFe');
    }

    const ide = (infNFe as Record<string, unknown>).ide;
    const emit = (infNFe as Record<string, unknown>).emit;
    const dest = (infNFe as Record<string, unknown>).dest;
    const det = (infNFe as Record<string, unknown>).det;

    if (!ide || !emit || !dest) {
      throw new BadRequestException('XML da NF-e deve conter ide, emit e dest');
    }

    const emitCnpj = (emit as Record<string, unknown>).CNPJ ?? (emit as Record<string, unknown>).cnpj;
    const destCnpj = (dest as Record<string, unknown>).CNPJ ?? (dest as Record<string, unknown>).cnpj;
    if (!emitCnpj || !destCnpj) {
      throw new BadRequestException('Emitente e destinatário devem ter CNPJ');
    }

    const detArray = Array.isArray(det) ? det : det ? [det] : [];
    if (detArray.length === 0) {
      throw new BadRequestException('NF-e deve conter pelo menos um item (det)');
    }
  }

  /**
   * Gera XML simplificado da NF-e para envio ao mock SEFAZ.
   */
  buildNFeXml(data: {
    numero: string;
    serie: string;
    emitenteCnpj: string;
    emitenteRazaoSocial: string;
    emitenteIe?: string;
    destinatarioCnpj: string;
    destinatarioRazaoSocial: string;
    destinatarioIe?: string;
    itens: Array<{
      descricao: string;
      quantidade: number;
      valorUnitario: number;
      cfop?: string;
      cst?: string;
      ncm?: string;
    }>;
    valorTotal: number;
  }): string {
    const itensXml = data.itens
      .map(
        (item, i) => `
    <det nItem="${i + 1}">
      <prod>
        <cProd>${i + 1}</cProd>
        <xProd>${this.escapeXml(item.descricao)}</xProd>
        <CFOP>${item.cfop || '5102'}</CFOP>
        <uCom>UN</uCom>
        <qCom>${item.quantidade}</qCom>
        <vUnCom>${item.valorUnitario}</vUnCom>
        <vProd>${item.quantidade * item.valorUnitario}</vProd>
        <NCM>${item.ncm || '00000000'}</NCM>
        <CST>${item.cst || '00'}</CST>
      </prod>
      <imposto>
        <ICMS><ICMS00><CST>00</CST><vBC>0</vBC><pICMS>0</pICMS><vICMS>0</vICMS></ICMS00></ICMS></imposto>
    </det>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe>
      <ide>
        <cUF>35</cUF>
        <nNF>${data.numero}</nNF>
        <serie>${data.serie}</serie>
        <dhEmi>${new Date().toISOString()}</dhEmi>
        <tpNF>1</tpNF>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>0</cDV>
        <finNFe>1</finNFe>
        <procEmi>0</procEmi>
        <verProc>1.0.0</verProc>
      </ide>
      <emit>
        <CNPJ>${data.emitenteCnpj}</CNPJ>
        <xNome>${this.escapeXml(data.emitenteRazaoSocial)}</xNome>
        <IE>${data.emitenteIe || ''}</IE>
      </emit>
      <dest>
        <CNPJ>${data.destinatarioCnpj}</CNPJ>
        <xNome>${this.escapeXml(data.destinatarioRazaoSocial)}</xNome>
        <IE>${data.destinatarioIe || ''}</IE>
      </dest>
      ${itensXml}
      <total>
        <ICMSTot><vNF>${data.valorTotal}</vNF></ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;
  }

  private escapeXml(str: string): string {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
