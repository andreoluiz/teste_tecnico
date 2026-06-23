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
  async create(@Body() createProdutoDto: CreateProdutoDto) {
    const p = await this.produtosService.create(createProdutoDto);
    return {
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      material: p.material,
      preco: p.preco,
      quantidade: p.quantidade,
      alertaMinimo: p.alerta_minimo,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de produtos retornada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async findAll() {
    const list = await this.produtosService.findAll();
    return list.map(p => ({
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      material: p.material,
      preco: p.preco,
      quantidade: p.quantidade,
      alertaMinimo: p.alerta_minimo,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Produto retornado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Produto não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async findOne(@Param('id') id: string) {
    const p = await this.produtosService.findOne(id);
    return {
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      material: p.material,
      preco: p.preco,
      quantidade: p.quantidade,
      alertaMinimo: p.alerta_minimo,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Produto atualizado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos para atualização.' })
  @ApiNotFoundResponse({ description: 'Produto não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async update(@Param('id') id: string, @Body() updateProdutoDto: UpdateProdutoDto) {
    const p = await this.produtosService.update(id, updateProdutoDto);
    return {
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      material: p.material,
      preco: p.preco,
      quantidade: p.quantidade,
      alertaMinimo: p.alerta_minimo,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
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