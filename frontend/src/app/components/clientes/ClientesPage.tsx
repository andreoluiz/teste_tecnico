import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../Header";
import { supabase } from "../../services/supabaseClient";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  Cliente,
  ClienteForm,
} from "../../services/clientes";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  ShoppingCart,
  LogOut,
  User,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  BookOpen,
} from "lucide-react";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

type NavItem = "dashboard" | "estoque" | "insumos" | "vendas" | "clientes";

const formVazio: ClienteForm = {
  nome: "",
  email: "",
  telefone: "",
  anotacao: "",
};

// ─── Modal Novo Cliente ──────────────────────────────────────────────────────
function NovoClienteModal({
  onClose,
  onCadastrar,
}: {
  onClose: () => void;
  onCadastrar: (form: ClienteForm) => Promise<void>;
}) {
  const [form, setForm] = useState<ClienteForm>(formVazio);
  const [errors, setErrors] = useState<Partial<Record<keyof ClienteForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: keyof ClienteForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof ClienteForm, string>> = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Novo Contato</h2>
            <p className="text-xs text-gray-500 mt-0.5">Adicione as informações de contato do cliente.</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: João da Silva"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.nome ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Telefone (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: (11) 99999-9999"
              value={form.telefone}
              onChange={(e) => set("telefone", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">E-mail (Opcional)</label>
            <input
              type="email"
              placeholder="Ex: joao@email.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Anotações (Opcional)</label>
            <textarea
              placeholder="Notas, observações sobre preferências ou medidas"
              value={form.anotacao}
              onChange={(e) => set("anotacao", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

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
                  <span>Gravando...</span>
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

// ─── Modal Editar Cliente ────────────────────────────────────────────────────
function EditarClienteModal({
  cliente,
  onClose,
  onSalvar,
}: {
  cliente: Cliente;
  onClose: () => void;
  onSalvar: (atualizado: Cliente) => Promise<void>;
}) {
  const [form, setForm] = useState({
    nome: cliente.nome,
    email: cliente.email || "",
    telefone: cliente.telefone || "",
    anotacao: cliente.anotacao || "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<typeof form> = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (validate()) {
      setIsSubmitting(true);
      try {
        await onSalvar({
          ...cliente,
          nome: form.nome,
          email: form.email || undefined,
          telefone: form.telefone || undefined,
          anotacao: form.anotacao || undefined,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Editar Contato</h2>
            <p className="text-xs text-gray-500 mt-0.5">Modifique as informações do cliente.</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.nome ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Telefone (Opcional)</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => set("telefone", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">E-mail (Opcional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Anotações (Opcional)</label>
            <textarea
              value={form.anotacao}
              onChange={(e) => set("anotacao", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

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
                  <span>Salvando...</span>
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Visualizar Cliente ────────────────────────────────────────────────
function VisualizarClienteModal({
  cliente,
  onClose,
  onEdit,
}: {
  cliente: Cliente;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Detalhes do Contato</h2>
            <p className="text-xs text-gray-500 mt-0.5">Informações completas cadastradas para o cliente.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</span>
            <p className="text-sm font-semibold text-gray-900">{cliente.nome}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone</span>
              <p className="text-sm text-gray-800 font-medium">{cliente.telefone || "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail</span>
              <p className="text-sm text-gray-800 font-medium truncate" title={cliente.email || ""}>{cliente.email || "—"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Anotações</span>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words break-all leading-relaxed">{cliente.anotacao || "Nenhuma anotação registrada."}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Editar Contato
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagina Principal ────────────────────────────────────────────────────────
export function ClientesPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("Gerente");
  const [isLoading, setIsLoading] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [modalNovo, setModalNovo] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteVisualizando, setClienteVisualizando] = useState<Cliente | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setIsLoading(true);
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const cadastrar = async (form: ClienteForm) => {
    try {
      const novo = await createCliente(form);
      setClientes((prev) => [novo, ...prev]);
      setModalNovo(false);
      toast.success("Contato cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Erro ao cadastrar o contato.");
    }
  };

  const salvar = async (atualizado: Cliente) => {
    try {
      const editado = await updateCliente(atualizado.id, updatedFormat(atualizado));
      setClientes((prev) =>
        prev.map((c) => (c.id === editado.id ? editado : c))
      );
      setClienteEditando(null);
      toast.success("Contato atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
      toast.error("Erro ao editar o contato.");
    }
  };

  const updatedFormat = (c: Cliente): ClienteForm => ({
    nome: c.nome,
    email: c.email,
    telefone: c.telefone,
    anotacao: c.anotacao,
  });

  const excluir = async (id: string) => {
    if (!confirm("Deseja realmente excluir este contato da agenda?")) return;
    try {
      setClientes((prev) => prev.filter((c) => c.id !== id));
      await deleteCliente(id);
      toast.success("Contato excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      carregarClientes();
      toast.error("Erro ao excluir o contato.");
    }
  };

  const navItems = [
    { key: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { key: "insumos" as NavItem, label: "Insumos", icon: FlaskConical, path: "/insumos" },
    { key: "estoque" as NavItem, label: "Estoque", icon: Package, path: "/estoque" },
    { key: "vendas" as NavItem, label: "Vendas", icon: ShoppingCart, path: "/vendas" },
    { key: "clientes" as NavItem, label: "Clientes", icon: BookOpen, path: "/clientes" },
  ];

  const clientesFiltrados = clientes.filter((c) => {
    const q = busca.toLowerCase();
    const nomeMatches = c.nome?.toLowerCase().includes(q) || false;
    const emailMatches = c.email?.toLowerCase().includes(q) || false;
    const telMatches = c.telefone?.includes(q) || false;
    const anotacaoMatches = c.anotacao?.toLowerCase().includes(q) || false;
    return nomeMatches || emailMatches || telMatches || anotacaoMatches;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Agenda de Clientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gerencie os contatos e anotações dos clientes</p>
          </div>
          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
          >
            <Plus className="size-4" />
            Novo Contato
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contatos por nome, telefone ou anotação..."
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
              <span>Carregando contatos...</span>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">Nenhum cliente cadastrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientesFiltrados.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setClienteVisualizando(c)}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {c.nome}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{c.telefone || "—"}</td>
                      <td className="px-4 py-4 text-gray-600">{c.email || "—"}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setClienteEditando(c)}
                            className="w-7 h-7 rounded-md hover:bg-blue-50 flex items-center justify-center transition-colors group/btn"
                          >
                            <Pencil className="size-3.5 text-gray-400 group-hover/btn:text-blue-600 transition-colors" />
                          </button>
                          <button
                            onClick={() => excluir(c.id)}
                            className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors group/btn"
                          >
                            <Trash2 className="size-3.5 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Novo */}
      {modalNovo && (
        <NovoClienteModal
          onClose={() => setModalNovo(false)}
          onCadastrar={cadastrar}
        />
      )}

      {/* Modal Editar */}
      {clienteEditando && (
        <EditarClienteModal
          cliente={clienteEditando}
          onClose={() => setClienteEditando(null)}
          onSalvar={salvar}
        />
      )}

      {/* Modal Detalhes */}
      {clienteVisualizando && (
        <VisualizarClienteModal
          cliente={clienteVisualizando}
          onClose={() => setClienteVisualizando(null)}
          onEdit={() => setClienteEditando(clienteVisualizando)}
        />
      )}
    </div>
  );
}
