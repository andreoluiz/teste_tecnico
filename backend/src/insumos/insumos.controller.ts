import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';

@ApiTags('Insumos')
@ApiBearerAuth('JWT-auth')
@Controller('insumos')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}



  @Get()
  @ApiOkResponse({ description: 'Lista de insumos retornada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async findAll() {
    const list = await this.insumosService.findAll();
    return list.map(i => ({
      id: i.id,
      nome: i.nome,
      tipo: i.tipo,
      unidade: i.unidade,
      descricao: i.descricao,
      quantidade: i.quantidade,
      precoUnit: i.preco_custo,
      alertaMinimo: i.alerta_minimo,
      fornecedor: i.fornecedor,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Insumo criado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos (erro de validação do DTO).' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async create(@Body() createInsumoDto: CreateInsumoDto) {
    const i = await this.insumosService.create(createInsumoDto);
    return {
      id: i.id,
      nome: i.nome,
      tipo: i.tipo,
      unidade: i.unidade,
      descricao: i.descricao,
      quantidade: i.quantidade,
      precoUnit: i.preco_custo,
      alertaMinimo: i.alerta_minimo,
      fornecedor: i.fornecedor,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    };
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Insumo retornado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async findOne(@Param('id') id: string) {
    const i = await this.insumosService.findOne(id);
    return {
      id: i.id,
      nome: i.nome,
      tipo: i.tipo,
      unidade: i.unidade,
      descricao: i.descricao,
      quantidade: i.quantidade,
      precoUnit: i.preco_custo,
      alertaMinimo: i.alerta_minimo,
      fornecedor: i.fornecedor,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    };
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Insumo atualizado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos para atualização.' })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async update(@Param('id') id: string, @Body() updateInsumoDto: UpdateInsumoDto) {
    const i = await this.insumosService.update(id, updateInsumoDto);
    return {
      id: i.id,
      nome: i.nome,
      tipo: i.tipo,
      unidade: i.unidade,
      descricao: i.descricao,
      quantidade: i.quantidade,
      precoUnit: i.preco_custo,
      alertaMinimo: i.alerta_minimo,
      fornecedor: i.fornecedor,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Insumo excluído com sucesso.' })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  remove(@Param('id') id: string) {
    return this.insumosService.remove(id);
  }
}
