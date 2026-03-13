/**
 * DTOs para criação de NF-e: emitente, destinatário e itens com validação (CNPJ, CFOP, CST, NCM).
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
  Length,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/** Item da nota: descrição, quantidade, valor unitário, CFOP, CST, NCM (opcionais). */
export class NFeItemDto {
  @ApiProperty({ description: 'Descrição do item' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({ description: 'Quantidade' })
  @IsNumber()
  @Min(0.0001)
  quantidade: number;

  @ApiProperty({ description: 'Valor unitário' })
  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @ApiPropertyOptional({ description: 'CFOP (Código Fiscal de Operações e Prestações)' })
  @IsOptional()
  @IsString()
  @Length(4, 4, { message: 'CFOP deve ter 4 dígitos' })
  @Matches(/^\d{4}$/, { message: 'CFOP deve conter apenas números' })
  cfop?: string;

  @ApiPropertyOptional({ description: 'CST (Código de Situação Tributária)' })
  @IsOptional()
  @IsString()
  @Length(1, 3)
  cst?: string;

  @ApiPropertyOptional({ description: 'NCM (Nomenclatura Comum do Mercosul)' })
  @IsOptional()
  @IsString()
  @Length(4, 10)
  ncm?: string;

  @ApiPropertyOptional({ description: 'ID do produto (UUID, se cadastrado)' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID('4', { message: 'produtoId deve ser um UUID válido quando informado' })
  produtoId?: string;
}

/** Payload para emissão de NF-e: emitente, destinatário e lista de itens. */
export class CreateNFeDto {
  @ApiProperty({ description: 'CNPJ do emitente', example: '12345678000195' })
  @IsString()
  @IsNotEmpty()
  @Length(14, 14, { message: 'CNPJ deve ter 14 dígitos' })
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter apenas números' })
  emitenteCnpj: string;

  @ApiPropertyOptional({ description: 'Inscrição Estadual do emitente' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  emitenteIe?: string;

  @ApiProperty({ description: 'Razão social do emitente' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  emitenteRazaoSocial: string;

  @ApiProperty({ description: 'CNPJ do destinatário', example: '98765432000100' })
  @IsString()
  @IsNotEmpty()
  @Length(14, 14, { message: 'CNPJ do destinatário deve ter 14 dígitos' })
  @Matches(/^\d{14}$/, { message: 'CNPJ do destinatário deve conter apenas números' })
  destinatarioCnpj: string;

  @ApiPropertyOptional({ description: 'Inscrição Estadual do destinatário' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  destinatarioIe?: string;

  @ApiProperty({ description: 'Razão social do destinatário' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  destinatarioRazaoSocial: string;

  @ApiProperty({ type: [NFeItemDto], description: 'Itens da nota fiscal' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NFeItemDto)
  itens: NFeItemDto[];
}
