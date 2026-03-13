/**
 * DTO para criação de Produto.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProdutoDto {
  @ApiProperty({ description: 'Descrição do produto' })
  @IsString()
  @Length(1, 255)
  descricao: string;

  @ApiPropertyOptional({ description: 'Código interno' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  codigo?: string;

  @ApiProperty({ description: 'Valor unitário', example: 10.5 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  valorUnitario: number;

  @ApiPropertyOptional({ description: 'Unidade (UN, PC, etc)', default: 'UN' })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  unidade?: string;

  @ApiPropertyOptional({ description: 'NCM' })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  ncm?: string;

  @ApiPropertyOptional({ description: 'CST' })
  @IsOptional()
  @IsString()
  @Length(1, 3)
  cst?: string;

  @ApiPropertyOptional({ description: 'CFOP' })
  @IsOptional()
  @IsString()
  @Length(1, 4)
  cfop?: string;
}
