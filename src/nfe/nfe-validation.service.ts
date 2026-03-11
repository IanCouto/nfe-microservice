import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateNFeDto } from './dto/create-nfe.dto';

/**
 * Validação de campos obrigatórios da NF-e conforme regras fiscais básicas.
 * CNPJ, IE (quando aplicável), CFOP, CST, etc.
 */
@Injectable()
export class NfeValidationService {
  validateCreateDto(dto: CreateNFeDto): void {
    const errors: string[] = [];

    if (!this.isCnpjValid(dto.emitenteCnpj)) {
      errors.push('CNPJ do emitente inválido');
    }
    if (!this.isCnpjValid(dto.destinatarioCnpj)) {
      errors.push('CNPJ do destinatário inválido');
    }
    if (dto.emitenteCnpj === dto.destinatarioCnpj) {
      errors.push('Emitente e destinatário não podem ser o mesmo CNPJ');
    }
    if (!dto.itens?.length) {
      errors.push('A nota deve possuir pelo menos um item');
    }

    dto.itens?.forEach((item, index) => {
      if (item.cfop && !/^\d{4}$/.test(item.cfop)) {
        errors.push(`Item ${index + 1}: CFOP deve ter 4 dígitos numéricos`);
      }
      if (item.cst !== undefined && (item.cst.length < 1 || item.cst.length > 3)) {
        errors.push(`Item ${index + 1}: CST deve ter entre 1 e 3 caracteres`);
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Erro de validação da NF-e',
        errors,
      });
    }
  }

  /**
   * Validação básica de CNPJ (dígitos verificadores).
   */
  private isCnpjValid(cnpj: string): boolean {
    if (!cnpj || cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false; // rejeita todos iguais

    let sum = 0;
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i], 10) * weights1[i];
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cnpj[12], 10)) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj[i], 10) * weights2[i];
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return digit === parseInt(cnpj[13], 10);
  }
}
