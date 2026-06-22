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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Insumo criado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos (erro de validação do DTO).' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  create(@Body() createInsumoDto: CreateInsumoDto) {
    return this.insumosService.create(createInsumoDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de insumos retornada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  findAll() {
    return this.insumosService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Insumo retornado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  findOne(@Param('id') id: string) {
    return this.insumosService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Insumo atualizado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos para atualização.' })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  update(@Param('id') id: string, @Body() updateInsumoDto: UpdateInsumoDto) {
    return this.insumosService.update(id, updateInsumoDto);
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
