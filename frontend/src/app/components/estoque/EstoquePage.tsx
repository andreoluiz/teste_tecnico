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
  Minus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  getProdutos,
  createProduto,
  updateProduto,
  deleteProduto,
  Produto,
  ProdutoForm as NovoProdutoForm
} from "../../services/produtos";

type NavItem = "dashboard" | "estoque" | "insumos" | "vendas";
type Status = "Normal" | "Baixo" | "Sem estoque";

const formVazio: NovoProdutoForm = {
  nome: "",
  categoria: "",
  tamanho: "",
  preco: "0.00",
  estoqueInicial: "0",
  alertaMinimo: "0",
};

const categorias = ["Quimono Completo", "Calça", "Camisa", "Faixa"];
const tamanhos = ["PP", "P", "M", "G", "GG", "XGG"];

function deriveStatus(qtd: number, alerta: number): Status {
  if (qtd === 0) return "Sem estoque";
  if (qtd <= alerta) return "Baixo";
  return "Normal";
}

const statusConfig: Record<Status, string> = {
  Normal: "bg-green-100 text-green-700 border border-green-200",
  Baixo: "bg-amber-100 text-amber-700 border border-amber-200",
  "Sem estoque": "bg-red-100 text-red-700 border border-red-200",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status]}`}>
      {status}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function NovoProdutoModal({
  onClose,
  onCadastrar,
}: {
  onClose: () => void;
  onCadastrar: (form: NovoProdutoForm) => void;
}) {
  const [form, setForm] = useState<NovoProdutoForm>(formVazio);
  const [errors, setErrors] = useState<Partial<Record<keyof NovoProdutoForm, string>>>({});

  const set = (field: keyof NovoProdutoForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof NovoProdutoForm, string>> = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.categoria) e.categoria = "Selecione uma categoria";
    if (!form.tamanho) e.tamanho = "Selecione um tamanho";
    if (!form.preco || parseFloat(form.preco) < 0) e.preco = "Valor inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onCadastrar(form);
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Novo Produto</h2>
            <p className="text-xs text-gray-500 mt-0.5">Insira as informações comerciais e físicas do produto.</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nome do Produto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Quimono Judô Branco M"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.nome ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          {/* Categoria + Tamanho */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none ${errors.categoria ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Selecione</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.categoria && <p className="text-xs text-red-500">{errors.categoria}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Tamanho <span className="text-red-500">*</span>
              </label>
              <select
                value={form.tamanho}
                onChange={(e) => set("tamanho", e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none ${errors.tamanho ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Tam</option>
                {tamanhos.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tamanho && <p className="text-xs text-red-500">{errors.tamanho}</p>}
            </div>
          </div>

          {/* Preço */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Preço de Venda (R$) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.preco}
              onChange={(e) => set("preco", e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.preco ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.preco && <p className="text-xs text-red-500">{errors.preco}</p>}
          </div>

          {/* Estoque Inicial + Alerta Mínimo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Estoque Inicial <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.estoqueInicial}
                onChange={(e) => set("estoqueInicial", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Alerta Mínimo</label>
              <input
                type="number"
                min="0"
                value={form.alertaMinimo}
                onChange={(e) => set("alertaMinimo", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Editar ─────────────────────────────────────────────────────────────

function EditarProdutoModal({
  produto,
  onClose,
  onSalvar,
}: {
  produto: Produto;
  onClose: () => void;
  onSalvar: (atualizado: Produto) => void;
}) {
  const [form, setForm] = useState({
    nome: produto.nome,
    categoria: produto.tipo,
    tamanho: "",
    preco: produto.preco.toFixed(2),
    quantidade: String(produto.quantidade),
    alertaMinimo: String(produto.alertaMinimo),
    material: produto.material,
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.categoria) e.categoria = "Selecione uma categoria";
    if (parseFloat(form.preco) < 0 || isNaN(parseFloat(form.preco))) e.preco = "Valor inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const qtd = Math.max(0, parseInt(form.quantidade) || 0);
    const alerta = Math.max(0, parseInt(form.alertaMinimo) || 0);
    onSalvar({
      ...produto,
      nome: form.nome.trim(),
      tipo: form.categoria,
      material: form.material.trim() || "—",
      preco: parseFloat(form.preco) || 0,
      quantidade: qtd,
      alertaMinimo: alerta,
      status: deriveStatus(qtd, alerta),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Editar Produto</h2>
            <p className="text-xs text-gray-500 mt-0.5">Atualize as informações do produto.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Nome do Produto <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.nome ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          {/* Categoria + Material */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Categoria <span className="text-red-500">*</span></label>
              <select
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none ${errors.categoria ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Selecione</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.categoria && <p className="text-xs text-red-500">{errors.categoria}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Material</label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => set("material", e.target.value)}
                placeholder="Ex: Algodão 100%"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Preço */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Preço de Venda (R$) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.preco}
              onChange={(e) => set("preco", e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.preco ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.preco && <p className="text-xs text-red-500">{errors.preco}</p>}
          </div>

          {/* Quantidade + Alerta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Quantidade</label>
              <input
                type="number"
                min="0"
                value={form.quantidade}
                onChange={(e) => set("quantidade", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Alerta Mínimo</label>
              <input
                type="number"
                min="0"
                value={form.alertaMinimo}
                onChange={(e) => set("alertaMinimo", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button type="button" onClick={onClose} className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EstoquePage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("Gerente");
  const [isLoading, setIsLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setIsLoading(true);
    try {
      const data = await getProdutos();
      const dataComStatus = data.map((p) => ({
        ...p,
        status: deriveStatus(p.quantidade, p.alertaMinimo),
      }));
      setProdutos(dataComStatus);
    } catch (e: any) {
      console.error("Erro ao carregar produtos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const [activeNav, setActiveNav] = useState<NavItem>("estoque");

  const navItems = [
    { key: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { key: "estoque" as NavItem, label: "Estoque", icon: Package, path: "/estoque" },
    { key: "insumos" as NavItem, label: "Insumos", icon: FlaskConical, path: "/insumos" },
    { key: "vendas" as NavItem, label: "Vendas", icon: ShoppingCart, path: "/vendas" },
  ];

  const handleNav = (item: typeof navItems[0]) => {
    setActiveNav(item.key);
    navigate(item.path);
  };

  const alterarQuantidade = async (id: string, delta: number) => {
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return;

    const novaQtd = Math.max(0, produto.quantidade + delta);
    
    setProdutos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, quantidade: novaQtd, status: deriveStatus(novaQtd, p.alertaMinimo) };
      })
    );

    try {
      await updateProduto(id, { quantidade: novaQtd });
    } catch (e) {
      console.error("Erro ao alterar quantidade:", e);
      carregarProdutos();
    }
  };

  const excluir = async (id: string) => {
    const confirmar = window.confirm("Deseja realmente excluir este produto?");
    if (!confirmar) return;

    try {
      await deleteProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Erro ao excluir produto:", e);
      alert("Erro ao excluir o produto. Tente novamente.");
    }
  };

  const salvar = async (atualizado: Produto) => {
    try {
      const p = await updateProduto(atualizado.id, atualizado);
      setProdutos((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...p, status: deriveStatus(p.quantidade, p.alertaMinimo) } : item
        )
      );
      setProdutoEditando(null);
    } catch (e) {
      console.error("Erro ao salvar produto:", e);
      alert("Erro ao salvar o produto. Verifique as informações.");
    }
  };

  const cadastrar = async (form: NovoProdutoForm) => {
    try {
      const p = await createProduto(form);
      const novoComStatus = {
        ...p,
        status: deriveStatus(p.quantidade, p.alertaMinimo),
      };
      setProdutos((prev) => [novoComStatus, ...prev]);
      setModalAberto(false);
    } catch (e) {
      console.error("Erro ao cadastrar produto:", e);
      alert("Erro ao cadastrar o produto. Verifique as informações.");
    }
  };

  const produtosFiltrados = produtos.filter((p) => {
    const q = busca.toLowerCase();
    return p.nome.toLowerCase().includes(q) || p.tipo.toLowerCase().includes(q) || p.material.toLowerCase().includes(q);
  });

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
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeNav === item.key
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </button>
              );
            })}
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
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Controle de Estoque</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gerencie quimonos, faixas, calças e camisas</p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="size-4" />
            Novo Produto
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por tipo, tamanho, cor ou modalidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package className="size-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              Produtos em Estoque ({produtosFiltrados.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Material</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preço</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantidade</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500 text-sm">
                      Carregando dados dos produtos...
                    </td>
                  </tr>
                ) : produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{produto.nome}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{produto.tipo}</p>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{produto.material}</td>
                      <td className="px-4 py-4 text-gray-700 font-medium tabular-nums">
                        R$ {produto.preco.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => alterarQuantidade(produto.id, -1)}
                            disabled={produto.quantidade === 0}
                            className="w-7 h-7 rounded-md border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Minus className="size-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900 tabular-nums">
                            {produto.quantidade}
                          </span>
                          <button
                            onClick={() => alterarQuantidade(produto.id, 1)}
                            className="w-7 h-7 rounded-md border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
                          >
                            <Plus className="size-3 text-gray-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={produto.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setProdutoEditando(produto)}
                            className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors group/btn"
                          >
                            <Pencil className="size-3.5 text-gray-400 group-hover/btn:text-blue-600 transition-colors" />
                          </button>
                          <button
                            onClick={() => excluir(produto.id)}
                            className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors group/btn"
                          >
                            <Trash2 className="size-3.5 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Novo */}
      {modalAberto && (
        <NovoProdutoModal
          onClose={() => setModalAberto(false)}
          onCadastrar={cadastrar}
        />
      )}

      {/* Modal Editar */}
      {produtoEditando && (
        <EditarProdutoModal
          produto={produtoEditando}
          onClose={() => setProdutoEditando(null)}
          onSalvar={salvar}
        />
      )}
    </div>
  );
}

