import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemVendaDto {
  @IsString()
  @IsNotEmpty()
  produtoId!: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantidade!: number;
}

export class CreateVendaDto {
  @IsString()
  @IsNotEmpty()
  cliente!: string;

  @IsString()
  @IsNotEmpty()
  data?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemVendaDto)
  itens!: CreateItemVendaDto[];
}
