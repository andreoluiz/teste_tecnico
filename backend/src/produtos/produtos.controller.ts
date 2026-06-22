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
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@ApiTags('Produtos')
@ApiBearerAuth('JWT-auth')
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Produto criado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos (erro de validação do DTO).' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de produtos retornada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  findAll() {
    return this.produtosService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Produto retornado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Produto não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Produto atualizado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos para atualização.' })
  @ApiNotFoundResponse({ description: 'Produto não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  update(@Param('id') id: string, @Body() updateProdutoDto: UpdateProdutoDto) {
    return this.produtosService.update(id, updateProdutoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Produto excluído com sucesso.' })
  @ApiBadRequestResponse({ description: 'Erro ao excluir o produto (possui vendas vinculadas).' })
  @ApiNotFoundResponse({ description: 'Produto não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  remove(@Param('id') id: string) {
    return this.produtosService.remove(id);
  }
}