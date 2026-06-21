import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../Header";
import { supabase } from "../../services/supabaseClient";
import {
  getInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo,
  Insumo,
  InsumoForm,
} from "../../services/insumos";
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
  BookOpen,
} from "lucide-react";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

type NavItem = "dashboard" | "estoque" | "insumos" | "vendas" | "clientes";
type Status = "Normal" | "Baixo" | "Sem estoque";

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

function NovoInsumoModal({ onClose, onCadastrar }: { onClose: () => void; onCadastrar: (f: InsumoForm) => Promise<void> }) {
  const { form, errors, set, validate } = useInsumoForm(formVazio);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (validate()) {
      setIsSubmitting(true);
      try {
        await onCadastrar(form);
      } finally {
        setIsSubmitting(false);
      }
    }
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
          <button onClick={onClose} disabled={isSubmitting} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50">
            <X className="size-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <CamposInsumo form={form} errors={errors} set={set} />
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
              className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={16} className="text-white" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                "Cadastrar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Editar ─────────────────────────────────────────────────────────────

function EditarInsumoModal({ insumo, onClose, onSalvar }: { insumo: Insumo; onClose: () => void; onSalvar: (i: Insumo) => Promise<void> }) {
  const { form, errors, set, validate } = useInsumoForm({
    nome: insumo.nome,
    tipo: insumo.tipo,
    unidade: insumo.unidade,
    descricao: insumo.descricao || "",
    quantidadeInicial: String(insumo.quantidade),
    precoUnit: insumo.precoUnit.toFixed(2),
    alertaMinimo: String(insumo.alertaMinimo),
    fornecedor: insumo.fornecedor || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    const qtd = Math.max(0, parseInt(form.quantidadeInicial) || 0);
    const alerta = Math.max(0, parseInt(form.alertaMinimo) || 0);
    setIsSubmitting(true);
    try {
      await onSalvar({
        ...insumo,
        nome: form.nome.trim(),
        tipo: form.tipo,
        unidade: form.unidade,
        descricao: form.descricao.trim(),
        quantidade: qtd,
        precoUnit: parseFloat(form.precoUnit) || 0,
        alertaMinimo: alerta,
        fornecedor: form.fornecedor.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <button type="button" onClick={onClose} disabled={isSubmitting} className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={16} className="text-white" />
                  <span>Salvando...</span>
                </>
              ) : (
                "Salvar"
              )}
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
  const [userEmail, setUserEmail] = useState<string>("Gerente");
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [busca, setBusca] = useState("");
  const [modalNovo, setModalNovo] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    carregarInsumos();
  }, []);

  const carregarInsumos = async () => {
    try {
      setIsLoading(true);
      const data = await getInsumos();
      setInsumos(data);
    } catch (error) {
      console.error("Erro ao carregar insumos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  
  const [activeNav] = useState<NavItem>("insumos");

  const navItems = [
    { key: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { key: "insumos" as NavItem, label: "Insumos", icon: FlaskConical, path: "/insumos" },
    { key: "estoque" as NavItem, label: "Estoque", icon: Package, path: "/estoque" },
    { key: "vendas" as NavItem, label: "Vendas", icon: ShoppingCart, path: "/vendas" },
    { key: "clientes" as NavItem, label: "Clientes", icon: BookOpen, path: "/clientes" },
  ];

  const alterarQuantidade = async (id: string, delta: number) => {
    const original = insumos.find((i) => i.id === id);
    if (!original) return;

    const novaQtd = Math.max(0, original.quantidade + delta);
    
    try {
      // Otimista
      setInsumos((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantidade: novaQtd } : i))
      );

      await updateInsumo(id, { quantidade: novaQtd });
    } catch (error) {
      console.error("Erro ao alterar quantidade:", error);
      // Reverter se falhar
      carregarInsumos();
    }
  };

  const excluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este insumo?")) return;
    try {
      setInsumos((prev) => prev.filter((i) => i.id !== id));
      await deleteInsumo(id);
      toast.success("Insumo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir insumo:", error);
      carregarInsumos();
      toast.error("Erro ao excluir o insumo.");
    }
  };

  const cadastrar = async (form: InsumoForm) => {
    try {
      const novo = await createInsumo(form);
      setInsumos((prev) => [novo, ...prev]);
      setModalNovo(false);
      toast.success("Insumo cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar insumo:", error);
      toast.error("Erro ao cadastrar o insumo.");
    }
  };

  const salvar = async (atualizado: Insumo) => {
    try {
      setInsumos((prev) => prev.map((i) => (i.id === atualizado.id ? atualizado : i)));
      await updateInsumo(atualizado.id, atualizado);
      setInsumoEditando(null);
      toast.success("Insumo atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar insumo:", error);
      carregarInsumos();
      toast.error("Erro ao salvar o insumo.");
    }
  };

  const insumosFiltrados = insumos.filter((i) => {
    const q = busca.toLowerCase();
    const nomeMatches = i.nome?.toLowerCase().includes(q) || false;
    const tipoMatches = i.tipo?.toLowerCase().includes(q) || false;
    const fornecedorMatches = i.fornecedor?.toLowerCase().includes(q) || false;
    return nomeMatches || tipoMatches || fornecedorMatches;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Controle de Insumos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gerencie matérias-primas para fabricação</p>
          </div>
          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
          >
            <Plus className="size-4" />
            Novo Insumo
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar insumos por nome, tipo ou fornecedor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
              <LoadingSpinner size={28} />
              <span>Carregando insumos...</span>
            </div>
          ) : insumosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">Nenhum insumo encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Insumo</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Fornecedor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Preço Unit.</th>
                    <th className="px-6 py-3 text-center w-36">Quantidade</th>
                    <th className="px-6 py-3 text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {insumosFiltrados.map((i) => {
                    const status = deriveStatus(i.quantidade, i.alertaMinimo);
                    return (
                      <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{i.nome}</div>
                          {i.descricao && <div className="text-xs text-gray-400 mt-0.5">{i.descricao}</div>}
                        </td>
                        <td className="px-4 py-4 text-gray-600">{i.tipo}</td>
                        <td className="px-4 py-4 text-gray-600">{i.fornecedor || "—"}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-900 tabular-nums">
                          R$ {i.precoUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          <span className="text-xs font-normal text-gray-400 block mt-0.5">por {i.unidade.toLowerCase()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => alterarQuantidade(i.id, -1)}
                              className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors"
                            >
                              <Minus className="size-3 text-gray-600" />
                            </button>
                            <span className="text-sm font-bold text-gray-900 w-10 text-center tabular-nums">{i.quantidade}</span>
                            <button
                              onClick={() => alterarQuantidade(i.id, 1)}
                              className="w-7 h-7 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors"
                            >
                              <Plus className="size-3 text-gray-600" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setInsumoEditando(i)}
                              className="p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-md transition-colors"
                              title="Editar"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => excluir(i.id)}
                              className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-md transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
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

      {/* Modais */}
      {modalNovo && <NovoInsumoModal onClose={() => setModalNovo(false)} onCadastrar={cadastrar} />}
      {insumoEditando && <EditarInsumoModal insumo={insumoEditando} onClose={() => setInsumoEditando(null)} onSalvar={salvar} />}
    </div>
  );
}
