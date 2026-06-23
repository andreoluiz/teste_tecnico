import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendaDto } from './dto/create-venda.dto';

@Injectable()
export class VendasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVendaDto: CreateVendaDto) {
    const { cliente, data, itens } = createVendaDto;

    return this.prisma.$transaction(async (tx) => {
      let totalVenda = 0;
      const itensCriar: any[] = [];

      for (const item of itens) {
        const produto = await tx.itens.findFirst({
          where: { id: item.produtoId, is_produto: true },
        });

        if (!produto) {
          throw new NotFoundException(`Produto com ID ${item.produtoId} não encontrado`);
        }

        if (produto.quantidade < item.quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.quantidade}, Solicitado: ${item.quantidade}`
          );
        }

        // Decrementa estoque
        await tx.itens.update({
          where: { id: item.produtoId },
          data: {
            quantidade: produto.quantidade - item.quantidade,
          },
        });

        const subtotal = Number(produto.preco) * item.quantidade;
        totalVenda += subtotal;

        itensCriar.push({
          item_id: item.produtoId,
          quantidade: item.quantidade,
          precoUnit: produto.preco,
        });
      }

      const dataVenda = data ? new Date(`${data}T12:00:00Z`) : undefined;

      const venda = await tx.venda.create({
        data: {
          cliente,
          total: totalVenda,
          status: 'Concluída',
          data: dataVenda,
          itens: {
            create: itensCriar,
          },
        },
        include: {
          itens: {
            include: {
              itens: true,
            },
          },
        },
      });

      // Registrar as movimentações de saída para cada item vendido
      for (const item of itens) {
        await tx.movimentacoes_itens.create({
          data: {
            item_id: item.produtoId,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            motivo: `Baixa de estoque por venda realizada nº ${venda.numero} (Cliente: ${cliente})`,
          },
        });
      }

      return venda;
    });
  }

  async findAll() {
    return this.prisma.venda.findMany({
      include: {
        itens: {
          include: {
            itens: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const venda = await this.prisma.venda.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            itens: true,
          },
        },
      },
    });

    if (!venda) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada`);
    }

    return venda;
  }

  async cancelar(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({
        where: { id },
        include: { itens: true },
      });

      if (!venda) {
        throw new NotFoundException(`Venda com ID ${id} não encontrada`);
      }

      if (venda.status === 'Cancelada') {
        throw new BadRequestException('Esta venda já está cancelada');
      }

      // Devolve os itens ao estoque
      for (const item of venda.itens) {
        const produto = await tx.itens.findFirst({
          where: { id: item.item_id, is_produto: true },
        });

        if (produto) {
          await tx.itens.update({
            where: { id: item.item_id },
            data: {
              quantidade: produto.quantidade + item.quantidade,
            },
          });

          await tx.movimentacoes_itens.create({
            data: {
              item_id: item.item_id,
              tipo: 'ENTRADA',
              quantidade: item.quantidade,
              motivo: `Estorno de estoque por cancelamento de venda nº ${venda.numero} (Cliente: ${venda.cliente})`,
            },
          });
        }
      }

      // Atualiza o status para cancelada
      return tx.venda.update({
        where: { id },
        data: { status: 'Cancelada' },
        include: {
          itens: {
            include: {
              itens: true,
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const venda = await tx.venda.findUnique({
        where: { id },
        include: { itens: true },
      });

      if (!venda) {
        throw new NotFoundException(`Venda com ID ${id} não encontrada`);
      }

      // Se deletar e ainda for ativa, repõe estoque
      if (venda.status === 'Concluída') {
        for (const item of venda.itens) {
          const produto = await tx.itens.findFirst({
            where: { id: item.item_id, is_produto: true },
          });

          if (produto) {
            await tx.itens.update({
              where: { id: item.item_id },
              data: {
                quantidade: produto.quantidade + item.quantidade,
              },
            });

            await tx.movimentacoes_itens.create({
              data: {
                item_id: item.item_id,
                tipo: 'ENTRADA',
                quantidade: item.quantidade,
                motivo: `Estorno de estoque por exclusão de venda nº ${venda.numero} (Cliente: ${venda.cliente})`,
              },
            });
          }
        }
      }

      // Deleta a venda
      await tx.venda.delete({
        where: { id },
      });

      return { success: true };
    });
  }
}
