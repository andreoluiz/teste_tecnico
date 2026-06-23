import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MovimentacoesService } from './movimentacoes.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

@ApiTags('movimentacoes')
@ApiBearerAuth()
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova movimentação de estoque' })
  @ApiResponse({ status: 201, description: 'Movimentação registrada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou parâmetros inválidos.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  create(@Body() createMovimentacaoDto: CreateMovimentacaoDto) {
    return this.movimentacoesService.create(createMovimentacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obter o histórico de todas as movimentações de estoque' })
  @ApiResponse({ status: 200, description: 'Lista de movimentações retornada com sucesso.' })
  findAll() {
    return this.movimentacoesService.findAll();
  }

  @Get('itens')
  @ApiOperation({ summary: 'Obter todos os itens (produtos e insumos) para registro de movimentação' })
  @ApiResponse({ status: 200, description: 'Lista de itens retornada com sucesso.' })
  findItens() {
    return this.movimentacoesService.findItens();
  }
}
