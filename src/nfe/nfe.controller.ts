/**
 * Controller NF-e: listar, criar, consultar, atualizar, excluir e obter XML.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NfeService } from './nfe.service';
import { CreateNFeDto } from './dto/create-nfe.dto';
import { UpdateNfeDto } from './dto/update-nfe.dto';
import { CreateNfeItemDto } from './dto/create-nfe-item.dto';
import { UpdateNfeItemDto } from './dto/update-nfe-item.dto';

@ApiTags('NF-e')
@Controller('nfe')
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  /** Lista todas as notas fiscais. */
  @Get()
  @ApiOperation({ summary: 'Listar todas as NF-e' })
  findAll() {
    return this.nfeService.findAll();
  }

  /** Recebe dados da NF-e e inicia o processo de emissão (validação, XML, envio SEFAZ em background). */
  @Post()
  @ApiOperation({ summary: 'Enviar NF-e para emissão' })
  @ApiResponse({ status: 201, description: 'NF-e recebida e em processamento' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() dto: CreateNFeDto) {
    return this.nfeService.emitir(dto);
  }

  /** Retorna o XML da NF-e autorizada (rota mais específica antes de :id). */
  @Get(':id/xml')
  @ApiOperation({ summary: 'Obter XML da NF-e autorizada' })
  @ApiResponse({ status: 200, description: 'XML da NF-e' })
  @ApiResponse({ status: 404, description: 'NF-e não encontrada ou não autorizada' })
  @Header('Content-Type', 'application/xml')
  async getXml(@Param('id', ParseUUIDPipe) id: string) {
    const { xml } = await this.nfeService.getXml(id);
    return xml;
  }

  /** Lista itens da NF-e. */
  @Get(':id/itens')
  @ApiOperation({ summary: 'Listar itens da NF-e' })
  listItens(@Param('id', ParseUUIDPipe) id: string) {
    return this.nfeService.listItens(id);
  }

  @Post(':id/itens')
  @ApiOperation({ summary: 'Adicionar item à NF-e' })
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateNfeItemDto,
  ) {
    return this.nfeService.addItem(id, dto);
  }

  @Get(':id/itens/:itemId')
  @ApiOperation({ summary: 'Buscar item da NF-e' })
  getItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.nfeService.getItem(id, itemId);
  }

  @Patch(':id/itens/:itemId')
  @ApiOperation({ summary: 'Atualizar item da NF-e' })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateNfeItemDto,
  ) {
    return this.nfeService.updateItem(id, itemId, dto);
  }

  @Delete(':id/itens/:itemId')
  @ApiOperation({ summary: 'Remover item da NF-e' })
  async removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    await this.nfeService.removeItem(id, itemId);
  }

  /** Retorna o status atual da nota: em_processamento, autorizada ou rejeitada. */
  @Get(':id')
  @ApiOperation({ summary: 'Consultar status da NF-e' })
  @ApiResponse({ status: 200, description: 'Status da nota (em_processamento, autorizada, rejeitada)' })
  @ApiResponse({ status: 404, description: 'NF-e não encontrada' })
  getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.nfeService.getStatus(id);
  }

  /** Atualiza NF-e (status, motivoRejeicao). */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar NF-e' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNfeDto) {
    return this.nfeService.update(id, dto);
  }

  /** Remove NF-e. */
  @Delete(':id')
  @ApiOperation({ summary: 'Remover NF-e' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.nfeService.remove(id);
  }
}
