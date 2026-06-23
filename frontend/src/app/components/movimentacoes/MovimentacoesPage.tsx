import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../Header";
import { supabase } from "../../services/supabaseClient";
import {
  getMovimentacoes,
  createMovimentacao,
  getItens,
  Movimentacao,
  Item,
  MovimentacaoForm,
} from "../../services/movimentacoes";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  ShoppingCart,
  BookOpen,
  Plus,
  Search,
  X,
  History,
} from "lucide-react";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

type NavItem = "dashboard" | "estoque" | "insumos" | "vendas" | "clientes" | "movimentacoes";

const formVazio: MovimentacaoForm = {
  itemId: "",
  tipo: "ENTRADA",
  quantidade: "1",
  motivo: "",
};

export function MovimentacoesPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [busca, setBusca] = useState("");
  const [modalNovo, setModalNovo] = useState(false);
  const [form, setForm] = useState<MovimentacaoForm>(formVazio);
  const [errors, setErrors] = useState<Partial<Record<keyof MovimentacaoForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [movsData, itensData] = await Promise.all([
        getMovimentacoes(),
        getItens(),
      ]);
      setMovimentacoes(movsData);
      setItens(itensData);
    } catch (error) {
      console.error("Erro ao carregar dados de movimentações:", error);
      toast.error("Erro ao carregar os dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field: keyof MovimentacaoForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof MovimentacaoForm, string>> = {};
    if (!form.itemId) e.itemId = "Obrigatório";
    
    const qtd = parseInt(form.quantidade) || 0;
    if (qtd <= 0) {
      e.quantidade = "Deve ser maior que 0";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (validate()) {
      setIsSubmitting(true);
      try {
        await createMovimentacao(form);
        toast.success("Movimentação registrada com sucesso!");
        setForm(formVazio);
        setModalNovo(false);
        carregarDados(); // Recarregar histórico e saldos
      } catch (error: any) {
        console.error("Erro ao registrar movimentação:", error);
        toast.error(error.message || "Erro ao registrar a movimentação.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const movimentacoesFiltradas = movimentacoes.filter((m) => {
    const q = busca.toLowerCase();
    const itemNome = m.itens?.nome?.toLowerCase() || "";
    const motivoText = m.motivo?.toLowerCase() || "";
    return itemNome.includes(q) || motivoText.includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <History className="size-6 text-blue-600" />
              Movimentações de Estoque
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Histórico e registro de entradas e saídas do estoque</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar movimentações por item ou motivo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Lista/Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
              <LoadingSpinner size={28} />
              <span>Carregando histórico...</span>
            </div>
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">Nenhuma movimentação registrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Item</th>
                    <th className="px-4 py-3">Tipo do Item</th>
                    <th className="px-4 py-3">Data e Hora</th>
                    <th className="px-4 py-3 text-center">Tipo</th>
                    <th className="px-4 py-3 text-right">Quantidade</th>
                    <th className="px-6 py-3">Motivo / Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {movimentacoesFiltradas.map((m) => {
                    const dataHora = new Date(m.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const badgeColor =
                      m.tipo === "ENTRADA"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200";

                    const itemTipo = m.itens?.is_produto ? "Produto" : "Insumo";

                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{m.itens?.nome || "—"}</td>
                        <td className="px-4 py-4 text-gray-600">{m.itens?.tipo ? `${itemTipo} (${m.itens.tipo})` : itemTipo}</td>
                        <td className="px-4 py-4 text-gray-500">{dataHora}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-gray-900 tabular-nums">
                          {m.tipo === "ENTRADA" ? `+${m.quantidade}` : `-${m.quantidade}`}
                        </td>
                        <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate" title={m.motivo || ""}>
                          {m.motivo || "Sem observações"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
