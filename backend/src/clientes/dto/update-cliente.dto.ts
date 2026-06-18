import { CreateClienteDto } from './create-cliente.dto';

export class UpdateClienteDto implements Partial<CreateClienteDto> {
  nome?: string;
  email?: string;
  telefone?: string;
}
