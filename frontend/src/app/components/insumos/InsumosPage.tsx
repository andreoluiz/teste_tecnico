import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

type NavItem = "dashboard" | "estoque" | "insumos" | "vendas";
type Status = "Normal" | "Baixo" | "Sem estoque";

interface Insumo {
  id: number;
  nome: string;
  tipo: string;
  unidade: string;
  descricao: string;
  quantidade: number;
  precoUnit: number;
  alertaMinimo: number;
  fornecedor: string;
  status: Status;
}

interface InsumoForm {
  nome: string;
  tipo: string;
  unidade: string;
  descricao: string;
  quantidadeInicial: string;
  precoUnit: string;
  alertaMinimo: string;
  fornecedor: string;
}

const formVazio: InsumoForm = {
  nome: "",
  tipo: "",
  unidade: "",
  descricao: "",
  quantidadeInicial: "0",
  precoUnit: "0.00",
  alertaMinimo: "0",
  fornecedor: "",
};

const tiposInsumo = ["Tecido", "Linha", "Agulha", "Botão", "Zíper", "Elástico", "Entretela", "Viés", "Ribana", "Outro"];
const unidades = ["Unidade", "Pacote", "Metro", "Rolo", "Caixa", "Kg", "Par"];

const insumosIniciais: Insumo[] = [
  { id: 1, nome: "Linha Branca Reforçada", tipo: "Linha", unidade: "Rolo", descricao: "Linha para costura industrial", quantidade: 0, precoUnit: 18.90, alertaMinimo: 5, fornecedor: "Textil Sul", status: "Sem estoque" },
  { id: 2, nome: "Agulha Industrial", tipo: "Agulha", unidade: "Pacote", descricao: "Agulha para máquina de costura", quantidade: 3, precoUnit: 24.90, alertaMinimo: 5, fornecedor: "MáquinaCost", status: "Baixo" },
  { id: 3, nome: "Tecido de Algodão Branco", tipo: "Tecido", unidade: "Metro", descricao: "Tecido premium para confecção de quimonos leves", quantidade: 42, precoUnit: 22.90, alertaMinimo: 10, fornecedor: "Tecidos Brasil", status: "Normal" },
  { id: 4, nome: "Botão Preto 15mm", tipo: "Botão", unidade: "Pacote", descricao: "Botão de resina para uniformes", quantidade: 18, precoUnit: 8.50, alertaMinimo: 5, fornecedor: "Aviamentos SP", status: "Normal" },
  { id: 5, nome: "Zíper Invisível 30cm", tipo: "Zíper", unidade: "Unidade", descricao: "", quantidade: 60, precoUnit: 3.20, alertaMinimo: 10, fornecedor: "Aviamentos SP", status: "Normal" },
];

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

// ─── Campos compartilhados entre modais ───────────────────────────────────────

function CamposInsumo({
  form,
  errors,
  set,
}: {
  form: InsumoForm;
  errors: Partial<InsumoForm>;
  set: (field: keyof InsumoForm, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Nome */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ex: Tecido de Algodão Branco"
          value={form.nome}
          onChange={(e) => set("nome", e.target.value)}
          className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.nome ? "border-red-400" : "border-gray-200"}`}
        />
        {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
      </div>

      {/* Tipo + Unidade */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Tipo <span className="text-red-500">*</span>
          </label>
          <select
            value={form.tipo}
            onChange={(e) => set("tipo", e.target.value)}
            className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none ${errors.tipo ? "border-red-400" : "border-gray-200"}`}
          >
            <option value="">Tipo</option>
            {tiposInsumo.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.tipo && <p className="text-xs text-red-500">{errors.tipo}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Unidade <span className="text-red-500">*</span>
          </label>
          <select
            value={form.unidade}
            onChange={(e) => set("unidade", e.target.value)}
            className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none ${errors.unidade ? "border-red-400" : "border-gray-200"}`}
          >
            <option value="">Unidade</option>
            {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          {errors.unidade && <p className="text-xs text-red-500">{errors.unidade}</p>}
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Descrição</label>
        <input
          type="text"
          placeholder="Descrição do insumo"
          value={form.descricao}
          onChange={(e) => set("descricao", e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Quantidade + Preço */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Quantidade Inicial <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={form.quantidadeInicial}
            onChange={(e) => set("quantidadeInicial", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Preço Unit. (R$) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.precoUnit}
            onChange={(e) => set("precoUnit", e.target.value)}
            className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.precoUnit ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.precoUnit && <p className="text-xs text-red-500">{errors.precoUnit}</p>}
        </div>
      </div>

      {/* Alerta Mínimo */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Alerta de Estoque Mínimo</label>
        <input
          type="number"
          min="0"
          value={form.alertaMinimo}
          onChange={(e) => set("alertaMinimo", e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Fornecedor */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Fornecedor</label>
        <input
          type="text"
          placeholder="Nome do fornecedor"
          value={form.fornecedor}
          onChange={(e) => set("fornecedor", e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>
    </div>
  );
}

function useInsumoForm(inicial: InsumoForm) {
  const [form, setForm] = useState<InsumoForm>(inicial);
  const [errors, setErrors] = useState<Partial<InsumoForm>>({});

  const set = (field: keyof InsumoForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<InsumoForm> = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.tipo) e.tipo = "Selecione um tipo";
    if (!form.unidade) e.unidade = "Selecione uma unidade";
    if (isNaN(parseFloat(form.precoUnit)) || parseFloat(form.precoUnit) < 0) e.precoUnit = "Valor inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return { form, errors, set, validate };
}

// ─── Modal Novo ───────────────────────────────────────────────────────────────

function NovoInsumoModal({ onClose, onCadastrar }: { onClose: () => void; onCadastrar: (f: InsumoForm) => void }) {
  const { form, errors, set, validate } = useInsumoForm(formVazio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onCadastrar(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Novo Insumo</h2>
            <p className="text-xs text-gray-500 mt-0.5">Preencha as informações do novo insumo</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="size-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <CamposInsumo form={form} errors={errors} set={set} />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button type="button" onClick={onClose} className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Editar ─────────────────────────────────────────────────────────────

function EditarInsumoModal({ insumo, onClose, onSalvar }: { insumo: Insumo; onClose: () => void; onSalvar: (i: Insumo) => void }) {
  const { form, errors, set, validate } = useInsumoForm({
    nome: insumo.nome,
    tipo: insumo.tipo,
    unidade: insumo.unidade,
    descricao: insumo.descricao,
    quantidadeInicial: String(insumo.quantidade),
    precoUnit: insumo.precoUnit.toFixed(2),
    alertaMinimo: String(insumo.alertaMinimo),
    fornecedor: insumo.fornecedor,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const qtd = Math.max(0, parseInt(form.quantidadeInicial) || 0);
    const alerta = Math.max(0, parseInt(form.alertaMinimo) || 0);
    onSalvar({
      ...insumo,
      nome: form.nome.trim(),
      tipo: form.tipo,
      unidade: form.unidade,
      descricao: form.descricao.trim(),
      quantidade: qtd,
      precoUnit: parseFloat(form.precoUnit) || 0,
      alertaMinimo: alerta,
      fornecedor: form.fornecedor.trim(),
      status: deriveStatus(qtd, alerta),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Editar Insumo</h2>
            <p className="text-xs text-gray-500 mt-0.5">Atualize as informações do insumo.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="size-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <CamposInsumo form={form} errors={errors} set={set} />
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

export function InsumosPage() {
  const navigate = useNavigate();
  const [activeNav] = useState<NavItem>("insumos");
  const [insumos, setInsumos] = useState<Insumo[]>(insumosIniciais);
  const [busca, setBusca] = useState("");
  const [modalNovo, setModalNovo] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null);

  const navItems = [
    { key: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { key: "estoque" as NavItem, label: "Estoque", icon: Package, path: "/estoque" },
    { key: "insumos" as NavItem, label: "Insumos", icon: FlaskConical, path: "/insumos" },
    { key: "vendas" as NavItem, label: "Vendas", icon: ShoppingCart, path: "/vendas" },
  ];

  const alterarQuantidade = (id: number, delta: number) => {
    setInsumos((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const novaQtd = Math.max(0, i.quantidade + delta);
        return { ...i, quantidade: novaQtd, status: deriveStatus(novaQtd, i.alertaMinimo) };
      })
    );
  };

  const excluir = (id: number) => setInsumos((prev) => prev.filter((i) => i.id !== id));

  const cadastrar = (form: InsumoForm) => {
    const qtd = Math.max(0, parseInt(form.quantidadeInicial) || 0);
    const alerta = Math.max(0, parseInt(form.alertaMinimo) || 0);
    const novo: Insumo = {
      id: Date.now(),
      nome: form.nome.trim(),
      tipo: form.tipo,
      unidade: form.unidade,
      descricao: form.descricao.trim(),
      quantidade: qtd,
      precoUnit: parseFloat(form.precoUnit) || 0,
      alertaMinimo: alerta,
      fornecedor: form.fornecedor.trim(),
      status: deriveStatus(qtd, alerta),
    };
    setInsumos((prev) => [novo, ...prev]);
    setModalNovo(false);
  };

  const salvar = (atualizado: Insumo) => {
    setInsumos((prev) => prev.map((i) => (i.id === atualizado.id ? atualizado : i)));
    setInsumoEditando(null);
  };

  const insumosFiltrados = insumos.filter((i) => {
    const q = busca.toLowerCase();
    return i.nome.toLowerCase().includes(q) || i.tipo.toLowerCase().includes(q) || i.fornecedor.toLowerCase().includes(q);
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
            {navItems.map(({ key, label, icon: Icon, path }) => (
              <button
                key={key}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeNav === key ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
              <span className="text-sm text-gray-700 hidden sm:block">Usuário Demo</span>
            </div>
            <button
              onClick={() => navigate("/")}
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
            <h1 className="text-2xl font-semibold text-gray-900">Controle de Insumos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gerencie matérias-primas para fabricação</p>
          </div>
          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="size-4" />
            Novo Insumo
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, tipo ou fornecedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FlaskConical className="size-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              Insumos Cadastrados ({insumosFiltrados.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Insumo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fornecedor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Preço Unit.</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantidade</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {insumosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      Nenhum insumo encontrado.
                    </td>
                  </tr>
                ) : (
                  insumosFiltrados.map((insumo) => (
                    <tr key={insumo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{insumo.nome}</p>
                        {insumo.descricao && (
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{insumo.descricao}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {insumo.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-sm">
                        {insumo.fornecedor || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-medium tabular-nums">
                        R$ {insumo.precoUnit.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => alterarQuantidade(insumo.id, -1)}
                            disabled={insumo.quantidade === 0}
                            className="w-7 h-7 rounded-md border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Minus className="size-3 text-gray-600" />
                          </button>
                          <span className="w-10 text-center font-semibold text-gray-900 tabular-nums">
                            {insumo.quantidade} <span className="text-xs font-normal text-gray-400">{insumo.unidade.toLowerCase()}</span>
                          </span>
                          <button
                            onClick={() => alterarQuantidade(insumo.id, 1)}
                            className="w-7 h-7 rounded-md border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
                          >
                            <Plus className="size-3 text-gray-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={insumo.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setInsumoEditando(insumo)}
                            className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors group/btn"
                          >
                            <Pencil className="size-3.5 text-gray-400 group-hover/btn:text-blue-600 transition-colors" />
                          </button>
                          <button
                            onClick={() => excluir(insumo.id)}
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

      {modalNovo && <NovoInsumoModal onClose={() => setModalNovo(false)} onCadastrar={cadastrar} />}
      {insumoEditando && <EditarInsumoModal insumo={insumoEditando} onClose={() => setInsumoEditando(null)} onSalvar={salvar} />}
    </div>
  );
}
