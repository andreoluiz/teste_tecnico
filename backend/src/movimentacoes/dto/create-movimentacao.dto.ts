import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TipoMovimentacao } from '@prisma/client';

export class CreateMovimentacaoDto {
  @ApiProperty({ description: 'ID do item (insumo ou produto)' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ enum: TipoMovimentacao, description: 'Tipo da movimentação' })
  @IsEnum(TipoMovimentacao)
  tipo: TipoMovimentacao;

  @ApiProperty({ description: 'Quantidade movimentada', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantidade: number;

  @ApiProperty({ required: false, description: 'Motivo da movimentação' })
  @IsString()
  @IsOptional()
  motivo?: string;
}
