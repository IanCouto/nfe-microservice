/**
 * DTO para criação de Cliente (emitente/destinatário).
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ description: 'Razão social' })
  @IsString()
  @Length(1, 255)
  razaoSocial: string;

  @ApiPropertyOptional({ description: 'Nome fantasia' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  nomeFantasia?: string;

  @ApiProperty({ description: 'CNPJ (14 dígitos)', example: '12345678000195' })
  @IsString()
  @Length(14, 14)
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas 14 dígitos' })
  cnpj: string;

  @ApiPropertyOptional({ description: 'Inscrição estadual' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  inscricaoEstadual?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 255)
  endereco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 10)
  municipio?: string;

  @ApiPropertyOptional({ description: 'UF (2 caracteres)' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 10)
  cep?: string;
}
