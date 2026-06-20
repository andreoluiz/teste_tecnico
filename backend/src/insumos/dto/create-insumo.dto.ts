import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class CreateInsumoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsNotEmpty()
  unidade!: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantidade?: number;

  @IsNumber()
  @Min(0)
  precoUnit!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  alertaMinimo?: number;

  @IsString()
  @IsOptional()
  fornecedor?: string;
}
