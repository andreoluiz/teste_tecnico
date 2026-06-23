import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) {}

  async create(createProdutoDto: CreateProdutoDto) {
    try {
      return await this.prisma.itens.create({
        data: {
          nome: createProdutoDto.nome,
          tipo: createProdutoDto.tipo,
          material: createProdutoDto.material || '—',
          preco: createProdutoDto.preco,
          quantidade: createProdutoDto.quantidade ?? 0,
          alerta_minimo: createProdutoDto.alertaMinimo ?? 0,
          is_produto: true,
          is_insumo: false,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Erro ao criar o produto: ${(error as Error).message}`);
    }
  }

  async findAll() {
    return this.prisma.itens.findMany({
      where: {
        is_produto: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const produto = await this.prisma.itens.findFirst({
      where: {
        id,
        is_produto: true,
      },
    });
    if (!produto) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado.`);
    }
    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto) {
    await this.findOne(id);
    try {
      const data: any = {};
      if (updateProdutoDto.nome !== undefined) data.nome = updateProdutoDto.nome;
      if (updateProdutoDto.tipo !== undefined) data.tipo = updateProdutoDto.tipo;
      if (updateProdutoDto.material !== undefined) data.material = updateProdutoDto.material;
      if (updateProdutoDto.preco !== undefined) data.preco = updateProdutoDto.preco;
      if (updateProdutoDto.quantidade !== undefined) data.quantidade = updateProdutoDto.quantidade;
      if (updateProdutoDto.alertaMinimo !== undefined) data.alerta_minimo = updateProdutoDto.alertaMinimo;

      return await this.prisma.itens.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(`Erro ao atualizar o produto: ${(error as Error).message}`);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.itens.delete({
        where: { id },
      });
    } catch (error) {
      const err = error as any;
      if (err.code === 'P2003' || (err.message && err.message.includes('foreign key'))) {
        throw new BadRequestException('Não é possível excluir este produto pois ele possui vendas associadas.');
      }
      throw new BadRequestException(`Erro ao excluir o produto: ${err.message}`);
    }
  }
}