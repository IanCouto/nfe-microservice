/**
 * Controller do webhook: simula retorno/callback da SEFAZ (autorizada ou rejeitada).
 */
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiPropertyOptional } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';

/** Payload para simular o retorno da SEFAZ (notaFiscalId, status, protocolo, chave, etc.). */
export class RetornoSefazDto {
  @ApiPropertyOptional({ description: 'ID da NF-e' })
  notaFiscalId?: string;
  @ApiPropertyOptional()
  protocolo?: string;
  @ApiPropertyOptional()
  chaveAcesso?: string;
  @ApiPropertyOptional({ enum: ['autorizada', 'rejeitada'] })
  status?: 'autorizada' | 'rejeitada';
  @ApiPropertyOptional()
  motivoRejeicao?: string;
  @ApiPropertyOptional()
  xmlAutorizado?: string;
}

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /** Recebe callback simulado da SEFAZ e atualiza a nota (autorizada ou rejeitada). */
  @Post('retorno-sefaz')
  @ApiOperation({
    summary: 'Simular retorno/callback da SEFAZ',
    description:
      'Endpoint para simular o retorno da SEFAZ (homologação). Envie notaFiscalId, status e protocolo/chave para atualizar a nota.',
  })
  async retornoSefaz(@Body() body: RetornoSefazDto) {
    return this.webhookService.processarRetorno(body);
  }
}
