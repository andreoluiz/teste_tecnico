import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemVendaDto {
  @ApiProperty({
    description: 'ID único do produto vendido (UUID)',
    example: 'd5f018fb-0e1b-47b8-9fbd-eae72f4f82ef',
  })
  @IsString()
  @IsNotEmpty()
  produtoId!: string;

  @ApiProperty({
    description: 'Quantidade de unidades vendidas do produto',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantidade!: number;
}

export class CreateVendaDto {
  @ApiProperty({
    description: 'Nome completo do cliente vinculado à venda',
    example: 'Marcus Silva',
  })
  @IsString()
  @IsNotEmpty()
  cliente!: string;

  @ApiProperty({
    description: 'Data da venda (formato YYYY-MM-DD)',
    example: '2026-06-22',
    required: false,
  })
  @IsString()
  @IsOptional()
  data?: string;

  @ApiProperty({
    description: 'Lista de itens que compõem a venda',
    type: [CreateItemVendaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemVendaDto)
  itens!: CreateItemVendaDto[];
}
