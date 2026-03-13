/**
 * DTO para atualização parcial de item da NF-e.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateNfeItemDto } from './create-nfe-item.dto';

export class UpdateNfeItemDto extends PartialType(CreateNfeItemDto) {}
