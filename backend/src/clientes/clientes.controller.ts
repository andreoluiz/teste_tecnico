import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@ApiTags('Clientes')
@ApiBearerAuth('JWT-auth')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Cliente criado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos (erro de validação do DTO).' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de contatos da agenda retornada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Contato retornado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Contato não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Contato atualizado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos para atualização.' })
  @ApiNotFoundResponse({ description: 'Contato não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Contato excluído com sucesso.' })
  @ApiNotFoundResponse({ description: 'Contato não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }
}
