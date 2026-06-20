import { apiFetch } from "./api";

export interface Produto {
  id: string;
  nome: string;
  tipo: string;
  material: string;
  preco: number;
  quantidade: number;
  alertaMinimo: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProdutoForm {
  nome: string;
  categoria: string;
  tamanho: string;
  preco: string;
  estoqueInicial: string;
  alertaMinimo: string;
  material?: string;
}

export async function getProdutos(): Promise<Produto[]> {
  const data = await apiFetch("/produtos");
  return data.map((p: any) => ({
    ...p,
    preco: parseFloat(p.preco) || 0,
  }));
}

export async function getProdutoById(id: string): Promise<Produto> {
  const p = await apiFetch(`/produtos/${id}`);
  return {
    ...p,
    preco: parseFloat(p.preco) || 0,
  };
}

export async function createProduto(form: ProdutoForm): Promise<Produto> {
  const nomeCompleto = `${form.categoria} ${form.tamanho ? form.tamanho + " " : ""}— ${form.nome}`.trim();
  
  const payload = {
    nome: nomeCompleto,
    tipo: form.categoria,
    material: form.material?.trim() || "—",
    preco: parseFloat(form.preco) || 0,
    quantidade: Math.max(0, parseInt(form.estoqueInicial) || 0),
    alertaMinimo: Math.max(0, parseInt(form.alertaMinimo) || 0),
  };

  const p = await apiFetch("/produtos", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...p,
    preco: parseFloat(p.preco) || 0,
  };
}

export async function updateProduto(id: string, form: Partial<ProdutoForm | Produto>): Promise<Produto> {
  const payload: any = {};
  
  if (form.nome !== undefined) payload.nome = form.nome;
  if (form.tipo !== undefined) payload.tipo = form.tipo;
  if ('categoria' in form && form.categoria !== undefined) payload.tipo = form.categoria;
  if (form.material !== undefined) payload.material = form.material.trim() || "—";
  
  if ('quantidade' in form && form.quantidade !== undefined) {
    payload.quantidade = form.quantidade;
  } else if ('estoqueInicial' in form && form.estoqueInicial !== undefined) {
    payload.quantidade = Math.max(0, parseInt(form.estoqueInicial) || 0);
  }

  if ('preco' in form && form.preco !== undefined) {
    payload.preco = typeof form.preco === 'string' ? parseFloat(form.preco) || 0 : form.preco;
  }

  if ('alertaMinimo' in form && form.alertaMinimo !== undefined) {
    payload.alertaMinimo = typeof form.alertaMinimo === 'string' ? Math.max(0, parseInt(form.alertaMinimo) || 0) : form.alertaMinimo;
  }

  const p = await apiFetch(`/produtos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return {
    ...p,
    preco: parseFloat(p.preco) || 0,
  };
}

export async function deleteProduto(id: string): Promise<void> {
  await apiFetch(`/produtos/${id}`, {
    method: "DELETE",
  });
}
