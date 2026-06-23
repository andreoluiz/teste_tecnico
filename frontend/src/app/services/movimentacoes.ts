import { apiFetch } from "./api";

export interface Item {
  id: string;
  nome: string;
  tipo: string;
  quantidade: number;
  is_produto: boolean;
  is_insumo: boolean;
}

export interface Movimentacao {
  id: string;
  item_id: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  motivo?: string;
  created_at: string;
  itens?: {
    nome: string;
    tipo: string;
    is_produto: boolean;
    is_insumo: boolean;
  };
}

export interface MovimentacaoForm {
  itemId: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: string;
  motivo?: string;
}

export async function getMovimentacoes(): Promise<Movimentacao[]> {
  return apiFetch("/movimentacoes");
}

export async function createMovimentacao(form: MovimentacaoForm): Promise<Movimentacao> {
  const payload = {
    itemId: form.itemId,
    tipo: form.tipo,
    quantidade: Math.max(1, parseInt(form.quantidade) || 0),
    motivo: form.motivo?.trim() || undefined,
  };

  return apiFetch("/movimentacoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getItens(): Promise<Item[]> {
  return apiFetch("/movimentacoes/itens");
}
