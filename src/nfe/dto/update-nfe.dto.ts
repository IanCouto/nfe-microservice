/**
 * DTO para atualização parcial de NF-e (status, motivo de rejeição).
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateNfeDto {
  @ApiPropertyOptional({ description: 'Status: em_processamento, autorizada, rejeitada' })
  @IsOptional()
  @IsString()
  @IsIn(['em_processamento', 'autorizada', 'rejeitada'])
  status?: 'em_processamento' | 'autorizada' | 'rejeitada';

  @ApiPropertyOptional({ description: 'Motivo de rejeição (quando status = rejeitada)' })
  @IsOptional()
  @IsString()
  motivoRejeicao?: string;
}
