import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInsumoDto {
  @ApiProperty({
    description: 'Nome da matéria-prima/insumo',
    example: 'Linha de Poliéster 5000m',
  })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({
    description: 'Tipo/Categoria do insumo',
    example: 'Linha',
  })
  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'Unidade',
  })
  @IsString()
  @IsNotEmpty()
  unidade!: string;

  @ApiProperty({
    description: 'Descrição detalhada do insumo',
    example: 'Linha resistente para fechamento de quimono',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Quantidade disponível no estoque de insumos',
    example: 15,
    default: 0,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  quantidade?: number;

  @ApiProperty({
    description: 'Preço unitário de custo do insumo',
    example: 22.90,
  })
  @IsNumber()
  @Min(0)
  precoUnit!: number;

  @ApiProperty({
    description: 'Quantidade mínima no estoque de insumos para alerta de reposição',
    example: 5,
    default: 0,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  alertaMinimo?: number;

  @ApiProperty({
    description: 'Nome ou identificação do fornecedor principal',
    example: 'Linhas Corrente Ltda.',
    required: false,
  })
  @IsString()
  @IsOptional()
  fornecedor?: string;
}
