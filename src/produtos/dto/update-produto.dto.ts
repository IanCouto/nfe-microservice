/**
 * DTO para atualização parcial de Produto.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateProdutoDto } from './create-produto.dto';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {}
