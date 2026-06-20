import { apiFetch } from "./api";

export interface Insumo {
  id: string;
  nome: string;
  tipo: string;
  unidade: string;
  descricao: string;
  quantidade: number;
  precoUnit: number;
  alertaMinimo: number;
  fornecedor: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsumoForm {
  nome: string;
  tipo: string;
  unidade: string;
  descricao: string;
  quantidadeInicial: string;
  precoUnit: string;
  alertaMinimo: string;
  fornecedor: string;
}

export async function getInsumos(): Promise<Insumo[]> {
  const data = await apiFetch("/insumos");
  return data.map((i: any) => ({
    ...i,
    precoUnit: parseFloat(i.precoUnit) || 0,
  }));
}

export async function getInsumoById(id: string): Promise<Insumo> {
  const i = await apiFetch(`/insumos/${id}`);
  return {
    ...i,
    precoUnit: parseFloat(i.precoUnit) || 0,
  };
}

export async function createInsumo(form: InsumoForm): Promise<Insumo> {
  const payload = {
    nome: form.nome.trim(),
    tipo: form.tipo,
    unidade: form.unidade,
    descricao: form.descricao.trim(),
    quantidade: Math.max(0, parseInt(form.quantidadeInicial) || 0),
    precoUnit: parseFloat(form.precoUnit) || 0,
    alertaMinimo: Math.max(0, parseInt(form.alertaMinimo) || 0),
    fornecedor: form.fornecedor.trim(),
  };

  const i = await apiFetch("/insumos", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...i,
    precoUnit: parseFloat(i.precoUnit) || 0,
  };
}

export async function updateInsumo(id: string, form: Partial<InsumoForm | Insumo>): Promise<Insumo> {
  const payload: any = {};
  if (form.nome !== undefined) payload.nome = form.nome.trim();
  if (form.tipo !== undefined) payload.tipo = form.tipo;
  if (form.unidade !== undefined) payload.unidade = form.unidade;
  if (form.descricao !== undefined) payload.descricao = form.descricao.trim();
  if (form.fornecedor !== undefined) payload.fornecedor = form.fornecedor.trim();
  
  if ('quantidadeInicial' in form && form.quantidadeInicial !== undefined) {
    payload.quantidade = Math.max(0, parseInt(form.quantidadeInicial) || 0);
  } else if ('quantidade' in form && form.quantidade !== undefined) {
    payload.quantidade = form.quantidade;
  }

  if ('precoUnit' in form && form.precoUnit !== undefined) {
    payload.precoUnit = typeof form.precoUnit === 'string' ? parseFloat(form.precoUnit) || 0 : form.precoUnit;
  }

  if ('alertaMinimo' in form && form.alertaMinimo !== undefined) {
    payload.alertaMinimo = typeof form.alertaMinimo === 'string' ? Math.max(0, parseInt(form.alertaMinimo) || 0) : form.alertaMinimo;
  }

  const i = await apiFetch(`/insumos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return {
    ...i,
    precoUnit: parseFloat(i.precoUnit) || 0,
  };
}

export async function deleteInsumo(id: string): Promise<void> {
  await apiFetch(`/insumos/${id}`, {
    method: "DELETE",
  });
}
