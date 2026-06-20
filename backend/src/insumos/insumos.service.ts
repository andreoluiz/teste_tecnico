import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';

@Injectable()
export class InsumosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInsumoDto: CreateInsumoDto) {
    return this.prisma.insumo.create({
      data: {
        nome: createInsumoDto.nome,
        tipo: createInsumoDto.tipo,
        unidade: createInsumoDto.unidade,
        descricao: createInsumoDto.descricao,
        quantidade: createInsumoDto.quantidade ?? 0,
        precoUnit: createInsumoDto.precoUnit,
        alertaMinimo: createInsumoDto.alertaMinimo ?? 0,
        fornecedor: createInsumoDto.fornecedor,
      },
    });
  }

  async findAll() {
    return this.prisma.insumo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id },
    });
    if (!insumo) {
      throw new NotFoundException(`Insumo com ID "${id}" não encontrado`);
    }
    return insumo;
  }

  async update(id: string, updateInsumoDto: UpdateInsumoDto) {
    await this.findOne(id);
    return this.prisma.insumo.update({
      where: { id },
      data: updateInsumoDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.insumo.delete({
      where: { id },
    });
  }
}
