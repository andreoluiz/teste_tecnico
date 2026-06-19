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
} from "lucide-react";

type NavItem = "dashboard" | "estoque" | "insumos" | "vendas";
type StatusVenda = "Concluída" | "Cancelada";

interface ItemVenda {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnit: number;
}

interface Venda {
  id: number;
  numero: number;
  cliente: string;
  data: string;
  itens: ItemVenda[];
  total: number;
  status: StatusVenda;
}

// Produtos disponíveis para selecionar na venda (espelha o estoque)
const produtosDisponiveis = [
  { id: 1, nome: "Quimono Judô Branco M", preco: 180.0 },
  { id: 2, nome: "Calça Preto M", preco: 90.0 },
  { id: 3, nome: "Camisa Azul G", preco: 110.0 },
  { id: 4, nome: "Camisa Preto P", preco: 105.0 },
  { id: 5, nome: "Faixa Branca M", preco: 25.0 },
  { id: 6, nome: "Faixa Marrom M", preco: 30.0 },
  { id: 7, nome: "Faixa Preta M", preco: 35.0 },
];

const vendasIniciais: Venda[] = [
  {
    id: 1,
    numero: 1,
    cliente: "João Silva",
    data: "2026-06-10",
    itens: [
      { produtoId: 1, nomeProduto: "Quimono Judô Branco M", quantidade: 2, precoUnit: 180.0 },
      { produtoId: 5, nomeProduto: "Faixa Branca M", quantidade: 2, precoUnit: 25.0 },
    ],
    total: 410.0,
    status: "Concluída",
  },
  {
    id: 2,
    numero: 2,
    cliente: "Venda teste 1",
    data: "2026-06-17",
    itens: [
      { produtoId: 3, nomeProduto: "Camisa Azul G", quantidade: 3, precoUnit: 110.0 },
    ],
    total: 330.0,
    status: "Concluída",
  },
  {
    id: 3,
    numero: 3,
    cliente: "Patrick",
    data: "2026-06-18",
    itens: [
      { produtoId: 7, nomeProduto: "Faixa Preta M", quantidade: 1, precoUnit: 35.0 },
      { produtoId: 2, nomeProduto: "Calça Preto M", quantidade: 1, precoUnit: 90.0 },
    ],
    total: 125.0,
    status: "Concluída",
  },
];

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
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnit: number;
}

function NovaVendaModal({
  proximoNumero,
  onClose,
  onFinalizar,
}: {
  proximoNumero: number;
  onClose: () => void;
  onFinalizar: (venda: Omit<Venda, "id">) => void;
}) {
  const hoje = new Date().toISOString().split("T")[0];
  const [cliente, setCliente] = useState("");
  const [data, setData] = useState(hoje);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [qtdSelecionada, setQtdSelecionada] = useState(1);
  const [itens, setItens] = useState<ItemRascunho[]>([]);
  const [erros, setErros] = useState<{ cliente?: string; itens?: string }>({});

  const adicionarItem = () => {
    if (!produtoSelecionado) return;
    const prod = produtosDisponiveis.find((p) => p.id === parseInt(produtoSelecionado));
    if (!prod) return;

    setItens((prev) => {
      const existente = prev.find((i) => i.produtoId === prod.id);
      if (existente) {
        return prev.map((i) =>
          i.produtoId === prod.id ? { ...i, quantidade: i.quantidade + qtdSelecionada } : i
        );
      }
      return [...prev, { produtoId: prod.id, nomeProduto: prod.nome, quantidade: qtdSelecionada, precoUnit: prod.preco }];
    });
    setProdutoSelecionado("");
    setQtdSelecionada(1);
    setErros((e) => ({ ...e, itens: undefined }));
  };

  const removerItem = (produtoId: number) => {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId));
  };

  const total = itens.reduce((acc, i) => acc + i.quantidade * i.precoUnit, 0);

  const handleFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros: typeof erros = {};
    if (!cliente.trim()) novosErros.cliente = "Obrigatório";
    if (itens.length === 0) novosErros.itens = "Adicione ao menos um produto";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    onFinalizar({
      numero: proximoNumero,
      cliente: cliente.trim(),
      data,
      itens,
      total,
      status: "Concluída",
    });
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
                  {produtosDisponiveis.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
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
            <button type="button" onClick={onClose} className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="w-full py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              Finalizar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Card de Venda ────────────────────────────────────────────────────────────

function VendaCard({ venda, onCancelar, onExcluir }: { venda: Venda; onCancelar: (id: number) => void; onExcluir: (id: number) => void }) {
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const [vendas, setVendas] = useState<Venda[]>(vendasIniciais);
  const [modalAberto, setModalAberto] = useState(false);

  const proximoNumero = Math.max(0, ...vendas.map((v) => v.numero)) + 1;

  const navItems = [
    { key: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { key: "estoque" as NavItem, label: "Estoque", icon: Package, path: "/estoque" },
    { key: "insumos" as NavItem, label: "Insumos", icon: FlaskConical, path: "/insumos" },
    { key: "vendas" as NavItem, label: "Vendas", icon: ShoppingCart, path: "/vendas" },
  ];

  const finalizar = (novaVenda: Omit<Venda, "id">) => {
    setVendas((prev) => [{ id: Date.now(), ...novaVenda }, ...prev]);
    setModalAberto(false);
  };

  const cancelarVenda = (id: number) => {
    setVendas((prev) => prev.map((v) => v.id === id ? { ...v, status: "Cancelada" } : v));
  };

  const excluirVenda = (id: number) => {
    setVendas((prev) => prev.filter((v) => v.id !== id));
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
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <ShoppingCart className="size-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              Histórico de Vendas ({vendas.length})
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {vendas.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">Nenhuma venda registrada.</p>
            ) : (
              vendas.map((venda) => (
                <VendaCard
                  key={venda.id}
                  venda={venda}
                  onCancelar={cancelarVenda}
                  onExcluir={excluirVenda}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {modalAberto && (
        <NovaVendaModal
          proximoNumero={proximoNumero}
          onClose={() => setModalAberto(false)}
          onFinalizar={finalizar}
        />
      )}
    </div>
  );
}
