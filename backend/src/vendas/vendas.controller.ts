import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';

@ApiTags('Vendas')
@ApiBearerAuth('JWT-auth')
@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVendaDto: CreateVendaDto) {
    return this.vendasService.create(createVendaDto);
  }

  @Get()
  findAll() {
    return this.vendasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendasService.findOne(id);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.vendasService.cancelar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.vendasService.remove(id);
  }
}
