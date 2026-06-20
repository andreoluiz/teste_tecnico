import { IsString, IsOptional, IsEmail } from 'class-validator';
import { CreateClienteDto } from './create-cliente.dto';

export class UpdateClienteDto implements Partial<CreateClienteDto> {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;
}
