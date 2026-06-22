import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProdutoDto {
  @ApiProperty({
    description: 'Nome completo do produto para comercialização',
    example: 'Quimono Trançado Reforçado A2',
  })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({
    description: 'Tipo/Categoria do produto',
    example: 'Quimono Completo',
  })
  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @ApiProperty({
    description: 'Tipo de material de fabricação do produto',
    example: 'Algodão Trançado 450g',
    required: false,
    default: '—',
  })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiProperty({
    description: 'Preço unitário de venda do produto acabado',
    example: 320.00,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  preco!: number;

  @ApiProperty({
    description: 'Quantidade disponível no estoque físico de produtos',
    example: 10,
    default: 0,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantidade?: number;

  @ApiProperty({
    description: 'Quantidade mínima no estoque para alerta de estoque baixo',
    example: 3,
    default: 0,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  alertaMinimo?: number;
}
