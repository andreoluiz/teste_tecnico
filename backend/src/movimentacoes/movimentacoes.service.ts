import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { TipoMovimentacao } from '@prisma/client';

@Injectable()
export class MovimentacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMovimentacaoDto: CreateMovimentacaoDto) {
    const { itemId, tipo, quantidade, motivo } = createMovimentacaoDto;

    // Verificar se o item existe na tabela 'itens'
    const item = await this.prisma.itens.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item com ID "${itemId}" não encontrado.`);
    }

    // Se for SAÍDA, verificar se há saldo suficiente em estoque
    if (tipo === TipoMovimentacao.SAIDA && item.quantidade < quantidade) {
      throw new BadRequestException(
        `Saldo insuficiente para realizar a saída. Saldo atual: ${item.quantidade}, quantidade solicitada: ${quantidade}.`
      );
    }

    // Executar a movimentação em uma transação para garantir consistência
    const [movimentacao] = await this.prisma.$transaction([
      this.prisma.movimentacoes_itens.create({
        data: {
          item_id: itemId,
          tipo,
          quantidade,
          motivo: motivo?.trim() || null,
        },
        include: {
          itens: true,
        },
      }),
      this.prisma.itens.update({
        where: { id: itemId },
        data: {
          quantidade:
            tipo === TipoMovimentacao.ENTRADA
              ? item.quantidade + quantidade
              : item.quantidade - quantidade,
        },
      }),
    ]);

    return movimentacao;
  }

  async findAll() {
    return this.prisma.movimentacoes_itens.findMany({
      include: {
        itens: {
          select: {
            nome: true,
            tipo: true,
            is_produto: true,
            is_insumo: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findItens() {
    return this.prisma.itens.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
  }
}
