import { apiFetch } from "./api";

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  anotacao?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClienteForm {
  nome: string;
  email?: string;
  telefone?: string;
  anotacao?: string;
}

export async function getClientes(): Promise<Cliente[]> {
  return apiFetch("/clientes");
}

export async function getClienteById(id: string): Promise<Cliente> {
  return apiFetch(`/clientes/${id}`);
}

export async function createCliente(form: ClienteForm): Promise<Cliente> {
  const payload = {
    nome: form.nome,
    email: form.email?.trim() || null,
    telefone: form.telefone?.trim() || null,
    anotacao: form.anotacao?.trim() || null,
  };

  return apiFetch("/clientes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCliente(id: string, form: Partial<ClienteForm | Cliente>): Promise<Cliente> {
  const payload: any = {};
  if (form.nome !== undefined) payload.nome = form.nome;
  if (form.email !== undefined) payload.email = form.email?.trim() || null;
  if (form.telefone !== undefined) payload.telefone = form.telefone?.trim() || null;
  if (form.anotacao !== undefined) payload.anotacao = form.anotacao?.trim() || null;

  return apiFetch(`/clientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCliente(id: string): Promise<void> {
  await apiFetch(`/clientes/${id}`, {
    method: "DELETE",
  });
}
