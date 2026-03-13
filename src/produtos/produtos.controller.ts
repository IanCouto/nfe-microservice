/**
 * Controller CRUD de Produtos.
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@ApiTags('Produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar produto' })
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  findAll() {
    return this.produtosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.produtosService.remove(id);
  }
}
