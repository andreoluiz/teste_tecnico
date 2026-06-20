import { apiFetch } from "./api";

export interface ItemVenda {
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnit: number;
}

export interface Venda {
  id: string;
  numero: number;
  cliente: string;
  data: string;
  itens: ItemVenda[];
  total: number;
  status: "Concluída" | "Cancelada";
  createdAt?: string;
}

export interface VendaForm {
  cliente: string;
  data?: string;
  itens: { produtoId: string; quantidade: number }[];
}

export async function getVendas(): Promise<Venda[]> {
  const data = await apiFetch("/vendas");
  return data.map((v: any) => ({
    id: v.id,
    numero: v.numero,
    cliente: v.cliente,
    data: v.data.split("T")[0],
    total: parseFloat(v.total) || 0,
    status: v.status,
    itens: v.itens.map((item: any) => ({
      produtoId: item.produtoId,
      nomeProduto: item.produto?.nome || "Produto removido",
      quantidade: item.quantidade,
      precoUnit: parseFloat(item.precoUnit) || 0,
    })),
  }));
}

export async function createVenda(form: VendaForm): Promise<Venda> {
  const v = await apiFetch("/vendas", {
    method: "POST",
    body: JSON.stringify(form),
  });

  return {
    id: v.id,
    numero: v.numero,
    cliente: v.cliente,
    data: v.data.split("T")[0],
    total: parseFloat(v.total) || 0,
    status: v.status,
    itens: v.itens.map((item: any) => ({
      produtoId: item.produtoId,
      nomeProduto: item.produto?.nome || "Produto",
      quantidade: item.quantidade,
      precoUnit: parseFloat(item.precoUnit) || 0,
    })),
  };
}

export async function cancelarVenda(id: string): Promise<Venda> {
  const v = await apiFetch(`/vendas/${id}/cancelar`, {
    method: "PATCH",
  });

  return {
    id: v.id,
    numero: v.numero,
    cliente: v.cliente,
    data: v.data.split("T")[0],
    total: parseFloat(v.total) || 0,
    status: v.status,
    itens: v.itens.map((item: any) => ({
      produtoId: item.produtoId,
      nomeProduto: item.produto?.nome || "Produto",
      quantidade: item.quantidade,
      precoUnit: parseFloat(item.precoUnit) || 0,
    })),
  };
}

export async function deleteVenda(id: string): Promise<void> {
  await apiFetch(`/vendas/${id}`, {
    method: "DELETE",
  });
}
