import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  preco!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantidade?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  alertaMinimo?: number;
}
