import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  ShoppingCart,
  LogOut,
  User,
  Plus,
  Trash2,
  X,
  BookOpen,
} from "lucide-react";
import { getProdutos, Produto } from "../../services/produtos";
import { getVendas, createVenda, cancelarVenda, deleteVenda, Venda, ItemVenda } from "../../services/vendas";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

type NavItem = "dashboard" | "estoque" | "insumos" | "vendas" | "clientes";
type StatusVenda = "Concluída" | "Cancelada";

function formatarData(iso: string) {
  const [y, m, d] = iso.split("-");
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

function moeda(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

// ─── Modal Nova Venda ─────────────────────────────────────────────────────────

interface ItemRascunho {
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnit: number;
}

function NovaVendaModal({
  produtos,
  onClose,
  onFinalizar,
}: {
  produtos: Produto[];
  onClose: () => void;
  onFinalizar: (cliente: string, itens: { produtoId: string; quantidade: number }[], data: string) => Promise<void>;
}) {
  const hoje = new Date().toISOString().split("T")[0];
  const [cliente, setCliente] = useState("");
  const [data, setData] = useState(hoje);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [qtdSelecionada, setQtdSelecionada] = useState(1);
  const [itens, setItens] = useState<ItemRascunho[]>([]);
  const [erros, setErros] = useState<{ cliente?: string; itens?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adicionarItem = () => {
    if (!produtoSelecionado) return;
    const prod = produtos.find((p) => p.id === produtoSelecionado);
    if (!prod) return;

    if (prod.quantidade < qtdSelecionada) {
      toast.error(`Quantidade selecionada (${qtdSelecionada}) é maior do que a disponível em estoque (${prod.quantidade})!`);
      return;
    }

    setItens((prev) => {
      const existente = prev.find((i) => i.produtoId === prod.id);
      const novaQtd = existente ? existente.quantidade + qtdSelecionada : qtdSelecionada;
      if (prod.quantidade < novaQtd) {
        toast.error(`Quantidade total do item (${novaQtd}) excede o estoque disponível (${prod.quantidade})!`);
        return prev;
      }
      if (existente) {
        return prev.map((i) =>
          i.produtoId === prod.id ? { ...i, quantidade: novaQtd } : i
        );
      }
      return [...prev, { produtoId: prod.id, nomeProduto: prod.nome, quantidade: qtdSelecionada, precoUnit: prod.preco }];
    });
    setProdutoSelecionado("");
    setQtdSelecionada(1);
    setErros((e) => ({ ...e, itens: undefined }));
  };

  const removerItem = (produtoId: string) => {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId));
  };

  const total = itens.reduce((acc, i) => acc + i.quantidade * i.precoUnit, 0);

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const novosErros: typeof erros = {};
    if (!cliente.trim()) novosErros.cliente = "Obrigatório";
    if (itens.length === 0) novosErros.itens = "Adicione ao menos um produto";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setIsSubmitting(true);
    try {
      await onFinalizar(
        cliente.trim(),
        itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        data
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Nova Venda</h2>
            <p className="text-xs text-gray-500 mt-0.5">Selecione os produtos e quantidade para registrar a venda</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleFinalizar} className="px-6 py-5 space-y-5">
          {/* Nome do Cliente */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nome do Cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={cliente}
              onChange={(e) => { setCliente(e.target.value); setErros((er) => ({ ...er, cliente: undefined })); }}
              className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${erros.cliente ? "border-red-400" : "border-gray-200"}`}
            />
            {erros.cliente && <p className="text-xs text-red-500">{erros.cliente}</p>}
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Data da Venda <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Adicionar Produtos */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-800">Adicionar Produtos</p>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Produto</label>
                <select
                  value={produtoSelecionado}
                  onChange={(e) => setProdutoSelecionado(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.quantidade})</option>
                  ))}
                </select>
              </div>
              <div className="w-20 space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Qtd</label>
                <input
                  type="number"
                  min="1"
                  value={qtdSelecionada}
                  onChange={(e) => setQtdSelecionada(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center"
                />
              </div>
              <button
                type="button"
                onClick={adicionarItem}
                disabled={!produtoSelecionado}
                className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              >
                <Plus className="size-4 text-white disabled:text-gray-400" />
              </button>
            </div>

            {erros.itens && <p className="text-xs text-red-500">{erros.itens}</p>}

            {/* Lista de itens adicionados */}
            {itens.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Produto</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Qtd</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">Subtotal</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item) => (
                      <tr key={item.produtoId}>
                        <td className="px-3 py-2 text-gray-800">{item.nomeProduto}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{item.quantidade}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-800 tabular-nums">
                          {moeda(item.quantidade * item.precoUnit)}
                        </td>
                        <td className="px-2 py-2">
                          <button type="button" onClick={() => removerItem(item.produtoId)} className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center transition-colors group/r">
                            <X className="size-3 text-gray-400 group-hover/r:text-red-500 transition-colors" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td colSpan={2} className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Total:</td>
                      <td className="px-3 py-2 text-right font-bold text-green-600 tabular-nums">{moeda(total)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={16} className="text-white" />
                  <span>Finalizando...</span>
                </>
              ) : (
                "Finalizar Venda"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Card de Venda ────────────────────────────────────────────────────────────

function VendaCard({ venda, onCancelar, onExcluir }: { venda: Venda; onCancelar: (id: string) => void; onExcluir: (id: string) => void }) {
  const isCancelada = venda.status === "Cancelada";

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isCancelada ? "border-red-200 opacity-75" : "border-gray-200"}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="font-semibold text-gray-900">Venda #{venda.numero}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Cliente: {venda.cliente} • {formatarData(venda.data)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isCancelada
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}>
            {venda.status}
          </span>
          {!isCancelada && (
            <button
              onClick={() => onCancelar(venda.id)}
              title="Cancelar venda"
              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors group/btn"
            >
              <X className="size-3.5 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
            </button>
          )}
          <button
            onClick={() => onExcluir(venda.id)}
            title="Excluir venda"
            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors group/btn"
          >
            <Trash2 className="size-3.5 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Items table */}
      <div className="px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-xs font-semibold text-gray-500">Produto</th>
              <th className="text-center pb-2 text-xs font-semibold text-gray-500">Qtd</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500">Preço Unit.</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-500">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {venda.itens.map((item, i) => (
              <tr key={i}>
                <td className="py-2 text-gray-700">{item.nomeProduto}</td>
                <td className="py-2 text-center text-gray-500">{item.quantidade}</td>
                <td className="py-2 text-right text-gray-500 tabular-nums">{moeda(item.precoUnit)}</td>
                <td className="py-2 text-right text-gray-700 font-medium tabular-nums">
                  {moeda(item.quantidade * item.precoUnit)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td colSpan={3} className="pt-3 text-right text-sm font-semibold text-gray-600">Total:</td>
              <td className="pt-3 text-right font-bold text-green-600 tabular-nums">{moeda(venda.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function VendasPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("Gerente");
  const [isLoading, setIsLoading] = useState(true);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [ordenacao, setOrdenacao] = useState<"data" | "numero" | "total">("data");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [vendasData, produtosData] = await Promise.all([
        getVendas(),
        getProdutos()
      ]);
      setVendas(vendasData);
      setProdutos(produtosData);
    } catch (e) {
      console.error("Erro ao carregar dados de vendas:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const ordenarVendas = (lista: Venda[]) => {
    const copia = [...lista];
    if (ordenacao === "data") {
      // Ordenar por data decrescente (mais recente primeiro)
      return copia.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }
    if (ordenacao === "numero") {
      // Ordenar por número decrescente
      return copia.sort((a, b) => b.numero - a.numero);
    }
    if (ordenacao === "total") {
      // Ordenar por valor total decrescente
      return copia.sort((a, b) => b.total - a.total);
    }
    return copia;
  };

  const vendasOrdenadas = ordenarVendas(vendas);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { key: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { key: "insumos" as NavItem, label: "Insumos", icon: FlaskConical, path: "/insumos" },
    { key: "estoque" as NavItem, label: "Estoque", icon: Package, path: "/estoque" },
    { key: "vendas" as NavItem, label: "Vendas", icon: ShoppingCart, path: "/vendas" },
    { key: "clientes" as NavItem, label: "Clientes", icon: BookOpen, path: "/clientes" },
  ];

  const finalizar = async (cliente: string, itens: { produtoId: string; quantidade: number }[], data: string) => {
    try {
      await createVenda({ cliente, itens, data });
      setModalAberto(false);
      await carregarDados();
      toast.success("Venda registrada com sucesso!");
    } catch (e: any) {
      console.error("Erro ao finalizar venda:", e);
      toast.error(e.message || "Erro ao registrar a venda.");
    }
  };

  const proximoNumero = vendas.length > 0 ? Math.max(...vendas.map((v) => v.numero)) + 1 : 1;

  const handleCancelarVenda = async (id: string) => {
    const confirmar = window.confirm("Deseja realmente cancelar esta venda? O estoque será devolvido.");
    if (!confirmar) return;

    try {
      await cancelarVenda(id);
      await carregarDados();
      toast.success("Venda cancelada com sucesso!");
    } catch (e: any) {
      console.error("Erro ao cancelar venda:", e);
      toast.error(e.message || "Erro ao cancelar a venda.");
    }
  };

  const handleExcluirVenda = async (id: string) => {
    const confirmar = window.confirm("Deseja realmente excluir o registro desta venda?");
    if (!confirmar) return;

    try {
      await deleteVenda(id);
      setVendas((prev) => prev.filter((v) => v.id !== id));
      await carregarDados();
      toast.success("Registro de venda excluído com sucesso!");
    } catch (e: any) {
      console.error("Erro ao excluir venda:", e);
      toast.error(e.message || "Erro ao excluir a venda.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">S</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">SIGE</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map(({ key, label, icon: Icon, path }) => (
              <button
                key={key}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  key === "vendas" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="size-3.5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700 hidden sm:block">{userEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Controle de Vendas</h1>
            <p className="text-sm text-gray-500 mt-0.5">Registre e gerencie vendas de quimonos</p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="size-4" />
            Nova Venda
          </button>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-900">
                Histórico de Vendas ({vendas.length})
              </h2>
            </div>
            
            {/* Filtros de Ordenação */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-gray-500">Ordenar por:</span>
              <div className="flex bg-gray-55 border border-gray-200 rounded-lg p-0.5 shadow-sm">
                {(["data", "numero", "total"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setOrdenacao(opt)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      ordenacao === opt
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {opt === "data" ? "Data" : opt === "numero" ? "Número (#)" : "Valor (R$)"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
                <LoadingSpinner size={28} />
                <span>Carregando dados das vendas...</span>
              </div>
            ) : vendasOrdenadas.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">Nenhuma venda registrada.</p>
            ) : (
              vendasOrdenadas.map((venda) => (
                <VendaCard
                  key={venda.id}
                  venda={venda}
                  onCancelar={handleCancelarVenda}
                  onExcluir={handleExcluirVenda}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {modalAberto && (
        <NovaVendaModal
          produtos={produtos}
          onClose={() => setModalAberto(false)}
          onFinalizar={finalizar}
        />
      )}
    </div>
  );
}
