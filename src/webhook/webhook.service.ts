/**
 * Serviço do webhook: processa retorno simulado da SEFAZ e atualiza status da NF-e (autorizada/rejeitada).
 */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaFiscal } from '../entities';
import { RetornoSefazDto } from './webhook.controller';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(NotaFiscal)
    private readonly notaFiscalRepo: Repository<NotaFiscal>,
  ) {}

  /** Atualiza a nota conforme status (autorizada com protocolo/chave ou rejeitada com motivo). */
  async processarRetorno(dto: RetornoSefazDto) {
    if (!dto.notaFiscalId) {
      throw new BadRequestException('notaFiscalId é obrigatório');
    }

    const nota = await this.notaFiscalRepo.findOne({
      where: { id: dto.notaFiscalId },
    });
    if (!nota) {
      throw new NotFoundException('NF-e não encontrada');
    }

    if (dto.status === 'autorizada' && dto.protocolo && dto.chaveAcesso) {
      await this.notaFiscalRepo.update(dto.notaFiscalId, {
        status: 'autorizada',
        protocoloAutorizacao: dto.protocolo,
        chaveAcesso: dto.chaveAcesso,
        xmlAutorizado: dto.xmlAutorizado ?? nota.xmlEnviado,
      });
      return {
        message: 'NF-e atualizada para autorizada',
        notaFiscalId: dto.notaFiscalId,
        protocolo: dto.protocolo,
      };
    }

    if (dto.status === 'rejeitada') {
      await this.notaFiscalRepo.update(dto.notaFiscalId, {
        status: 'rejeitada',
        motivoRejeicao: dto.motivoRejeicao ?? 'Rejeitada via webhook',
      });
      return {
        message: 'NF-e atualizada para rejeitada',
        notaFiscalId: dto.notaFiscalId,
      };
    }

    throw new BadRequestException(
      'Para status autorizada informe protocolo e chaveAcesso. Para rejeitada informe status e opcionalmente motivoRejeicao.',
    );
  }
}
