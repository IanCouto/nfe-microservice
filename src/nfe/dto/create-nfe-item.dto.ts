/**
 * DTO para adicionar item a uma NF-e existente.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Length, Matches, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNfeItemDto {
  @ApiProperty()
  @IsString()
  @Length(1, 255)
  descricao: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(0.0001)
  quantidade: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  valorUnitario: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  cfop?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 3)
  cst?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(4, 10)
  ncm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  produtoId?: string;
}
