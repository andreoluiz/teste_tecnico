import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';

@Injectable()
export class InsumosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInsumoDto: CreateInsumoDto) {
    try {
      return await this.prisma.itens.create({
        data: {
          nome: createInsumoDto.nome,
          tipo: createInsumoDto.tipo,
          unidade: createInsumoDto.unidade,
          descricao: createInsumoDto.descricao,
          quantidade: createInsumoDto.quantidade ?? 0,
          preco_custo: createInsumoDto.precoUnit,
          alerta_minimo: createInsumoDto.alertaMinimo ?? 0,
          fornecedor: createInsumoDto.fornecedor,
          is_produto: false,
          is_insumo: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Erro ao criar o insumo: ${(error as Error).message}`);
    }
  }

  async findAll() {
    return this.prisma.itens.findMany({
      where: {
        is_insumo: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const insumo = await this.prisma.itens.findFirst({
      where: { 
        id,
        is_insumo: true,
      },
    });
    if (!insumo) {
      throw new NotFoundException(`Insumo com ID "${id}" não encontrado`);
    }
    return insumo;
  }

  async update(id: string, updateInsumoDto: UpdateInsumoDto) {
    await this.findOne(id);
    try {
      const data: any = {};
      if (updateInsumoDto.nome !== undefined) data.nome = updateInsumoDto.nome;
      if (updateInsumoDto.tipo !== undefined) data.tipo = updateInsumoDto.tipo;
      if (updateInsumoDto.unidade !== undefined) data.unidade = updateInsumoDto.unidade;
      if (updateInsumoDto.descricao !== undefined) data.descricao = updateInsumoDto.descricao;
      if (updateInsumoDto.quantidade !== undefined) data.quantidade = updateInsumoDto.quantidade;
      if (updateInsumoDto.precoUnit !== undefined) data.preco_custo = updateInsumoDto.precoUnit;
      if (updateInsumoDto.alertaMinimo !== undefined) data.alerta_minimo = updateInsumoDto.alertaMinimo;
      if (updateInsumoDto.fornecedor !== undefined) data.fornecedor = updateInsumoDto.fornecedor;

      return await this.prisma.itens.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(`Erro ao atualizar o insumo: ${(error as Error).message}`);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.itens.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(`Erro ao excluir o insumo: ${(error as Error).message}`);
    }
  }
}
