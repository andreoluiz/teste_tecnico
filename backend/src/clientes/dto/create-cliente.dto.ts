import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({
    description: 'Nome completo do contato',
    example: 'Marcus Silva',
  })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({
    description: 'Endereço de e-mail do cliente',
    example: 'marcus@email.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Telefone de contato no padrão nacional',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsString()
  @IsOptional()
  telefone?: string;

  @ApiProperty({
    description: 'Anotações gerais sobre preferências ou medidas do cliente',
    example: 'Prefere quimonos trançados tamanho A2',
    required: false,
  })
  @IsString()
  @IsOptional()
  anotacao?: string;
}
