import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  anotacao?: string;
}
