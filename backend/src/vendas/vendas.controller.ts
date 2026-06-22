import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';

@ApiTags('Vendas')
@ApiBearerAuth('JWT-auth')
@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Venda criada com sucesso. Efetua a baixa de estoque correspondente dos produtos vendidos.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos (erro de validação do DTO ou saldo insuficiente no estoque).' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  create(@Body() createVendaDto: CreateVendaDto) {
    return this.vendasService.create(createVendaDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Histórico de todas as vendas retornado com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  findAll() {
    return this.vendasService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Dados da venda retornados com sucesso.' })
  @ApiNotFoundResponse({ description: 'Venda não encontrada.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  findOne(@Param('id') id: string) {
    return this.vendasService.findOne(id);
  }

  @Patch(':id/cancelar')
  @ApiOkResponse({ description: 'Venda cancelada com sucesso. Devolve os produtos para o estoque.' })
  @ApiBadRequestResponse({ description: 'Venda já cancelada ou ID de venda inválido.' })
  @ApiNotFoundResponse({ description: 'Venda não encontrada.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  cancelar(@Param('id') id: string) {
    return this.vendasService.cancelar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Registro da venda e itens de venda excluídos com sucesso em cascata.' })
  @ApiNotFoundResponse({ description: 'Venda não encontrada.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  remove(@Param('id') id: string) {
    return this.vendasService.remove(id);
  }
}
