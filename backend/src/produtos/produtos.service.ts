import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) {}

  async create(createProdutoDto: CreateProdutoDto) {
    try {
      return await this.prisma.produto.create({
        data: createProdutoDto,
      });
    } catch (error) {
      throw new BadRequestException(`Erro ao criar o produto: ${(error as Error).message}`);
    }
  }

  async findAll() {
    return this.prisma.produto.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
    });
    if (!produto) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado.`);
    }
    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto) {
    await this.findOne(id);
    try {
      return await this.prisma.produto.update({
        where: { id },
        data: updateProdutoDto,
      });
    } catch (error) {
      throw new BadRequestException(`Erro ao atualizar o produto: ${(error as Error).message}`);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.produto.delete({
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