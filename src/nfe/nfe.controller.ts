import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NfeService } from './nfe.service';
import { CreateNFeDto } from './dto/create-nfe.dto';

@ApiTags('NF-e')
@Controller('nfe')
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar NF-e para emissão' })
  @ApiResponse({ status: 201, description: 'NF-e recebida e em processamento' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() dto: CreateNFeDto) {
    return this.nfeService.emitir(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar status da NF-e' })
  @ApiResponse({ status: 200, description: 'Status da nota (em_processamento, autorizada, rejeitada)' })
  @ApiResponse({ status: 404, description: 'NF-e não encontrada' })
  getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.nfeService.getStatus(id);
  }

  @Get(':id/xml')
  @ApiOperation({ summary: 'Obter XML da NF-e autorizada' })
  @ApiResponse({ status: 200, description: 'XML da NF-e' })
  @ApiResponse({ status: 404, description: 'NF-e não encontrada ou não autorizada' })
  @Header('Content-Type', 'application/xml')
  async getXml(@Param('id', ParseUUIDPipe) id: string) {
    const { xml } = await this.nfeService.getXml(id);
    return xml;
  }
}
