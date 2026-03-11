import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface SefazEnvioResult {
  success: boolean;
  protocolo?: string;
  motivoRejeicao?: string;
  chaveAcesso?: string;
}

/**
 * Mock do webservice SEFAZ para homologação.
 * Simula envio da nota e retorno do protocolo de autorização.
 */
@Injectable()
export class SefazMockService {
  async enviarNota(xmlEnviado: string): Promise<SefazEnvioResult> {
    // Simula validação e resposta da SEFAZ (homologação: sempre autoriza após pequeno delay)
    await this.delay(300);

    const chaveAcesso = this.gerarChaveAcesso();
    const protocolo = `${Date.now()}${uuidv4().replace(/-/g, '').slice(0, 15)}`;

    return {
      success: true,
      protocolo,
      chaveAcesso,
    };
  }

  private gerarChaveAcesso(): string {
    // Chave NF-e 44 dígitos (simplificado para mock)
    const uf = '35'; // SP
    const aamm = new Date().toISOString().slice(2, 7).replace('-', '');
    const cnpj = '12345678000195';
    const mod = '55';
    const serie = '001';
    const num = String(Math.floor(Math.random() * 999999999)).padStart(9, '0');
    const tpEmis = '1';
    const cNF = String(Math.floor(Math.random() * 99999999)).padStart(8, '0');
    const dv = String(Math.floor(Math.random() * 10));
    return `${uf}${aamm}${cnpj}${mod}${serie}${num}${tpEmis}${cNF}${dv}`.slice(0, 44);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
