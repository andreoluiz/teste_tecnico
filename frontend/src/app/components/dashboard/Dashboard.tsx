import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getInsumos, Insumo } from "../../services/insumos";
import { getProdutos, Produto } from "../../services/produtos";
import { supabase } from "../../services/supabaseClient";
import {
  Package,
  AlertTriangle,
  Layers,
  Tag,
  LayoutDashboard,
  ShoppingCart,
  FlaskConical,
  LogOut,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  User,
  Shirt,
  DollarSign,
  CheckCircle2,
  Calendar,
  Lightbulb,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type ActiveTab = "insumos" | "estoque" | "vendas" | "inteligencia";
type NavItem = "dashboard" | "estoque" | "insumos" | "vendas";
type PeriodoVendas = 30 | 60 | 90 | 120;

// ─── Dados Insumos (Serão dinâmicos, mas mantemos os tipos de estrutura) ─────

const statusConfigInsumo = {
  Normal: "bg-green-100 text-green-700 border border-green-200",
  Baixo: "bg-amber-100 text-amber-700 border border-amber-200",
  "Sem estoque": "bg-red-100 text-red-700 border border-red-200",
};

// ─── Dados Vendas ─────────────────────────────────────────────────────────────

function gerarVendasDiarias(dias: number) {
  const data: { dia: string; vendas: number }[] = [];
  const hoje = new Date(2026, 5, 18);
  for (let i = dias - 1; i >= 0; i -= Math.ceil(dias / 12)) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    data.push({ dia: label, vendas: Math.floor(Math.random() * 5) + 1 });
  }
  return data;
}

const vendasPorMes = [
  { mes: "Jan", faturamento: 8200 },
  { mes: "Fev", faturamento: 9100 },
  { mes: "Mar", faturamento: 7650 },
  { mes: "Abr", faturamento: 11675 },
  { mes: "Mai", faturamento: 10300 },
  { mes: "Jun", faturamento: 9800 },
];

// ─── Sub-views ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
}) {
  const isAmber = color === "amber";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold ${isAmber ? "text-amber-500" : "text-gray-900"}`}>
            {value}
          </p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isAmber ? "bg-amber-50" : "bg-blue-50"}`}>
          <Icon className={`size-4 ${isAmber ? "text-amber-500" : "text-blue-600"}`} />
        </div>
      </div>
    </div>
  );
}

function InsumosBaixoAlert({
  items,
  type = "insumos",
}: {
  items: { nome: string; categoria: string; quantidade: number; unidade: string }[];
  type?: "produtos" | "insumos";
}) {
  const isProdutos = type === "produtos";
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center gap-2">
        <AlertTriangle className="size-4 text-amber-500 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold text-amber-800">
            {isProdutos ? "Produtos" : "Insumos"} com Estoque Baixo
          </h2>
          <p className="text-xs text-amber-600">
            {items.length} {isProdutos ? "produto(s)" : "insumo(s)"} com necessidade de reposição
          </p>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.nome}
              className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">{item.nome}</p>
              <p className="text-xs text-gray-400 mb-3">{item.categoria}</p>
              <p className={`text-lg font-bold ${item.quantidade === 0 ? "text-red-500" : "text-amber-500"}`}>
                {item.quantidade}{" "}
                <span className="text-sm font-normal">{item.unidade}</span>
              </p>
            </div>
          ))}
        </div>
        <button 
          onClick={() => navigate(isProdutos ? "/estoque" : "/insumos")}
          className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Ver todos os {isProdutos ? "produtos" : "insumos"}
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}




// EstoqueView foi movida para dentro do Dashboard component para se tornar dinâmica

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#374151",
};

function VendasView() {
  const [periodo, setPeriodo] = useState<PeriodoVendas>(30);
  const vendasDiarias = gerarVendasDiarias(periodo);

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="size-3.5" />
          Período:
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {([30, 60, 90, 120] as PeriodoVendas[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                periodo === p
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {p} dias
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendas Concluídas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">26</p>
              <p className="text-xs text-gray-400 mt-1">vendas realizadas</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <ShoppingCart className="size-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Faturamento Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">R$ 11.675,00</p>
              <p className="text-xs text-gray-400 mt-1">total em vendas</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="size-4 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Linha: Vendas diárias */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Vendas nos Últimos {periodo} Dias
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Acompanhe o volume de vendas diárias</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={vendasDiarias} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="vendas"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: "#2563EB", r: 3 }}
              activeDot={{ r: 5 }}
              name="Quantidade de Vendas"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Barra: Faturamento por mês */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Faturamento por Mês</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Receita mensal em reais</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={vendasPorMes} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Faturamento"]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
            <Bar dataKey="faturamento" name="Faturamento" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Indicadores Financeiros Rápidos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Indicadores Financeiros Rápidos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total de Ordens", value: "3", green: false },
            { label: "Receita Líquida", value: "R$ 2.851,50", green: true },
            { label: "Ticket Médio", value: "R$ 950,50", green: true },
          ].map(({ label, value, green }) => (
            <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${green ? "text-green-600" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Inteligência Comercial ───────────────────────────────────────────────────

const produtosCampeoes = [
  { posicao: 1, nome: "Quimono Judô Branco M", qtd: 4 },
  { posicao: 2, nome: "Camisa Azul G", qtd: 3 },
  { posicao: 3, nome: "Faixa Branca M", qtd: 2 },
  { posicao: 4, nome: "Calça Preto M", qtd: 1 },
];

const clientesVip = [
  { rank: 1, nome: "João Silva", pedidos: 3, total: 2731.0 },
  { rank: 2, nome: "Patrick", pedidos: 1, total: 120.5 },
];

const medalhas: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function InteligenciaView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Produtos Campeões */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-green-500" />
            <h3 className="text-sm font-semibold text-gray-900">Produtos Campeões de Venda</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ranking dos quimonos e acessórios mais vendidos para guiar sua produção
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Posição</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produto</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qtd. Vendida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {produtosCampeoes.map((p) => (
                <tr key={p.posicao} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-lg">
                    {medalhas[p.posicao] ?? <span className="text-sm font-medium text-gray-400">{p.posicao}º</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nome}</td>
                  <td className="px-6 py-3 text-right font-semibold text-green-600 tabular-nums">
                    {p.qtd} un.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clientes VIP */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900">Clientes VIP (Quem Mais Compra)</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Maiores faturamentos por cliente para campanhas e descontos de fidelidade
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome do Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pedidos</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Investido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientesVip.map((c) => (
                <tr key={c.rank} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-bold text-gray-500">#{c.rank}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{c.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{c.pedidos} compra{c.pedidos !== 1 ? "s" : ""}</td>
                  <td className="px-6 py-3 text-right font-semibold text-green-600 tabular-nums">
                    R$ {c.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Shell ──────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>("insumos");
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");
  const [userEmail, setUserEmail] = useState<string>("Gerente");
  
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoadingInsumos, setIsLoadingInsumos] = useState(true);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    setIsLoadingInsumos(true);
    getInsumos()
      .then((data) => setInsumos(data))
      .catch((e) => console.error("Erro ao carregar insumos na dashboard:", e))
      .finally(() => setIsLoadingInsumos(false));

    setIsLoadingProdutos(true);
    getProdutos()
      .then((data) => setProdutos(data))
      .catch((e) => console.error("Erro ao carregar produtos na dashboard:", e))
      .finally(() => setIsLoadingProdutos(false));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Cálculos dinâmicos de Insumos
  const insumosCadastradosCount = insumos.length;
  const insumosBaixoEstoque = insumos.filter((i) => i.quantidade <= i.alertaMinimo);
  const insumosBaixoEstoqueCount = insumosBaixoEstoque.length;
  const totalUnidadesInsumos = insumos.reduce((acc, i) => acc + i.quantidade, 0);

  // Agrupamento de categorias únicas
  const categoriasUnicas = Array.from(new Set(insumos.map((i) => i.tipo)));
  const categoriasCount = categoriasUnicas.length;

  // KPIs dinâmicos para renderização
  const dynamicKpiInsumos = [
    { label: "Insumos Cadastrados", value: String(insumosCadastradosCount), sub: "Tipos de matéria-prima", icon: Package, color: "blue" },
    { label: "Insumos - Baixo Estoque", value: String(insumosBaixoEstoqueCount), sub: "necessitam compra", icon: AlertTriangle, color: "amber" },
    { label: "Quantidade Total", value: String(totalUnidadesInsumos), sub: "Unidades em estoque", icon: Layers, color: "blue" },
    { label: "Categorias", value: String(categoriasCount), sub: "Tipos diferentes", icon: Tag, color: "blue" },
  ];

  // Status Geral dinâmico
  const emEstoqueAdequadoCount = insumos.length - insumosBaixoEstoqueCount;
  const dynamicStatusGeralInsumos = [
    { label: "Em estoque adequado", count: emEstoqueAdequadoCount, ok: true },
    { label: "Baixo estoque", count: insumosBaixoEstoqueCount, ok: false },
  ];

  // Cálculo de Porcentagem para a barra de progresso (Mínimo de 1% para não estourar layout)
  const totalInsumosBar = insumos.length || 1;
  const pctAdequado = Math.round((emEstoqueAdequadoCount / totalInsumosBar) * 100);
  const pctBaixo = 100 - pctAdequado;

  // Top categorias dinâmico
  const contagemCategorias: Record<string, number> = {};
  insumos.forEach((i) => {
    contagemCategorias[i.tipo] = (contagemCategorias[i.tipo] || 0) + 1;
  });
  const dynamicTopCategorias = Object.entries(contagemCategorias)
    .map(([nome, count]) => ({ nome, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Subcomponente de Insumos com dados dinâmicos injetados
  function InsumosView() {
    if (isLoadingInsumos) {
      return <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded-xl">Carregando dados dos insumos...</div>;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicKpiInsumos.map((c) => <KpiCard key={c.label} {...c} />)}
        </div>

        {insumosBaixoEstoqueCount > 0 && (
          <InsumosBaixoAlert 
            items={insumosBaixoEstoque.map(i => ({
              nome: i.nome,
              categoria: i.tipo,
              quantidade: i.quantidade,
              unidade: i.unidade.toLowerCase()
            }))} 
            type="insumos"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <FlaskConical className="size-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Gerenciar Insumos</h3>
                <p className="text-xs text-gray-400">Adicionar, editar e controlar</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Gerencie suas matérias-primas, controle entradas e saídas e mantenha o estoque sempre atualizado.
            </p>
            <button 
              onClick={() => navigate("/insumos")}
              className="mt-auto flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Acessar módulo <ChevronRight className="size-3.5" />
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Status Geral</h3>
              <p className="text-xs text-gray-400">Situação dos insumos</p>
            </div>
            <div className="space-y-3">
              {dynamicStatusGeralInsumos.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.ok ? <TrendingUp className="size-3.5 text-green-500" /> : <TrendingDown className="size-3.5 text-amber-500" />}
                    <span className="text-sm text-gray-600">{item.label}:</span>
                  </div>
                  <span className={`text-sm font-bold ${item.ok ? "text-green-600" : "text-amber-500"}`}>{item.count}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                <div className="bg-green-400 rounded-full" style={{ width: `${pctAdequado}%` }} />
                <div className="bg-amber-400 rounded-full" style={{ width: `${pctBaixo}%` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">Adequado ({pctAdequado}%)</span>
                <span className="text-xs text-gray-400">Baixo ({pctBaixo}%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Top Categorias</h3>
              <p className="text-xs text-gray-400">Tipos de insumos</p>
            </div>
            <div className="space-y-3">
              {dynamicTopCategorias.length === 0 ? (
                <p className="text-xs text-gray-400">Sem insumos para categorizar.</p>
              ) : (
                dynamicTopCategorias.map((cat, i) => (
                  <div key={cat.nome} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{cat.nome}:</span>
                        <span className="text-sm font-semibold text-blue-600">{cat.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(cat.count / totalInsumosBar) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Subcomponente de Estoque com dados dinâmicos injetados
  function EstoqueView() {
    if (isLoadingProdutos) {
      return <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded-xl">Carregando dados do estoque...</div>;
    }

    const produtosCadastradosCount = produtos.length;
    const produtosBaixoEstoque = produtos.filter((p) => p.quantidade <= p.alertaMinimo);
    const produtosBaixoEstoqueCount = produtosBaixoEstoque.length;
    const totalUnidadesProdutos = produtos.reduce((acc, p) => acc + p.quantidade, 0);
    const quimonosCompletosCount = produtos
      .filter((p) => p.tipo === "Quimono Completo")
      .reduce((acc, p) => acc + p.quantidade, 0);

    const dynamicKpiEstoque = [
      { label: "Produtos em Estoque", value: String(produtosCadastradosCount), sub: "modelos cadastrados", icon: Shirt, color: "blue" },
      { label: "Produtos - Baixo Estoque", value: String(produtosBaixoEstoqueCount), sub: "necessitam reposição", icon: AlertTriangle, color: "amber" },
      { label: "Unidades Totais", value: String(totalUnidadesProdutos), sub: "peças disponíveis", icon: Layers, color: "blue" },
      { label: "Quimonos Completos", value: String(quimonosCompletosCount), sub: "unidades prontas", icon: Package, color: "blue" },
    ];

    const estoqueAdequadoCount = produtos.length - produtosBaixoEstoqueCount;
    const dynamicStatusGeralEstoque = [
      { label: "Estoque adequado", count: estoqueAdequadoCount, ok: true },
      { label: "Baixo estoque", count: produtosBaixoEstoqueCount, ok: false },
    ];

    const totalProdutosBar = produtos.length || 1;
    const pctEstoqueAdequado = Math.round((estoqueAdequadoCount / totalProdutosBar) * 100);
    const pctEstoqueBaixo = 100 - pctEstoqueAdequado;

    const quimonosCount = produtos.filter((p) => p.tipo === "Quimono Completo").length;
    const calcasCamisasCount = produtos.filter((p) => p.tipo === "Calça" || p.tipo === "Camisa").length;
    const faixasCount = produtos.filter((p) => p.tipo === "Faixa").length;

    const dynamicDistribuicao = [
      { nome: "Quimonos", count: quimonosCount },
      { nome: "Calças/Camisas", count: calcasCamisasCount },
      { nome: "Faixas", count: faixasCount },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicKpiEstoque.map((c) => <KpiCard key={c.label} {...c} />)}
        </div>

        {produtosBaixoEstoqueCount > 0 && (
          <InsumosBaixoAlert 
            items={produtosBaixoEstoque.map(p => ({
              nome: p.nome,
              categoria: p.tipo,
              quantidade: p.quantidade,
              unidade: "un."
            }))} 
            type="produtos"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="size-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Gerenciar Estoque</h3>
                <p className="text-xs text-gray-400">Adicionar, editar e controlar produtos</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Controle o estoque de quimonos, faixas e acessórios. Registre entradas, saídas e ajustes de inventário.
            </p>
            <button 
              onClick={() => navigate("/estoque")}
              className="mt-auto flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Acessar módulo <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Distribuição de Produtos</h3>
              <p className="text-xs text-gray-400">Por tipo</p>
            </div>
            <div className="space-y-3">
              {dynamicDistribuicao.map((item) => (
                <div key={item.nome} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-600">{item.nome}:</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 flex gap-1 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 flex-1 rounded-full" style={{ width: `${(quimonosCount / (totalProdutosBar || 1)) * 100}%` }} />
              <div className="bg-blue-300 flex-1 rounded-full" style={{ width: `${(calcasCamisasCount / (totalProdutosBar || 1)) * 100}%` }} />
              <div className="bg-blue-200 flex-1 rounded-full" style={{ width: `${(faixasCount / (totalProdutosBar || 1)) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Status Geral</h3>
              <p className="text-xs text-gray-400">Situação do estoque</p>
            </div>
            <div className="space-y-3">
              {dynamicStatusGeralEstoque.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.ok
                      ? <CheckCircle2 className="size-3.5 text-green-500" />
                      : <AlertTriangle className="size-3.5 text-amber-500" />}
                    <span className="text-sm text-gray-600">{item.label}:</span>
                  </div>
                  <span className={`text-sm font-bold ${item.ok ? "text-green-600" : "text-amber-500"}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                <div className="bg-green-400 rounded-full" style={{ width: `${pctEstoqueAdequado}%` }} />
                <div className="bg-amber-400 rounded-full" style={{ width: `${pctEstoqueBaixo}%` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">Adequado ({pctEstoqueAdequado}%)</span>
                <span className="text-xs text-gray-400">Baixo ({pctEstoqueBaixo}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">S</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">SIGE</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {(
              [
                { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
                { key: "estoque", label: "Estoque", icon: Package, path: "/estoque" },
                { key: "insumos", label: "Insumos", icon: FlaskConical, path: "/insumos" },
                { key: "vendas", label: "Vendas", icon: ShoppingCart, path: "/vendas" },
              ] as { key: NavItem; label: string; icon: React.ElementType; path: string }[]
            ).map(({ key, label, icon: Icon, path }) => (
              <button
                key={key}
                onClick={() => { setActiveNav(key); if (path !== "/dashboard") navigate(path); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeNav === key
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral da loja de quimonos</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit shadow-sm">
          {(
            [
              { key: "insumos", label: "Insumos", icon: FlaskConical },
              { key: "estoque", label: "Estoque", icon: Package },
              { key: "vendas", label: "Vendas", icon: ShoppingCart },
              { key: "inteligencia", label: "Inteligência Comercial", icon: Lightbulb },
            ] as { key: ActiveTab; label: string; icon: React.ElementType }[]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "insumos" && <InsumosView />}
        {activeTab === "estoque" && <EstoqueView />}
        {activeTab === "vendas" && <VendasView />}
        {activeTab === "inteligencia" && <InteligenciaView />}
      </main>
    </div>
  );
}

