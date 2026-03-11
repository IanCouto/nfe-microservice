import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiPropertyOptional } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';

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
