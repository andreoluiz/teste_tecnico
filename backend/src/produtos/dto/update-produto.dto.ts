import { IsString, IsOptional, IsNumber, IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProdutoDto } from './create-produto.dto';

export class UpdateProdutoDto implements Partial<CreateProdutoDto> {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  preco?: number;

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
