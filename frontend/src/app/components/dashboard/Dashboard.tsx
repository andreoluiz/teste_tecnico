import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../Header";
import { getInsumos, Insumo } from "../../services/insumos";
import { getProdutos, Produto } from "../../services/produtos";
import { getVendas, Venda } from "../../services/vendas";
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
  BookOpen,
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
type NavItem = "dashboard" | "estoque" | "insumos" | "vendas" | "clientes";
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

function VendasView({ vendas, isLoading }: { vendas: Venda[]; isLoading: boolean }) {
  const [periodo, setPeriodo] = useState<PeriodoVendas>(30);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded-xl">Carregando dados das vendas...</div>;
  }

  // Filtrar apenas vendas concluídas para faturamento e contadores
  const concluidas = vendas.filter((v) => v.status === "Concluída");

  // Faturamento total
  const faturamentoTotal = concluidas.reduce((acc, v) => acc + v.total, 0);

  // Vendas diárias baseadas no período selecionado
  const hoje = new Date();
  const vendasDiarias: { dia: string; vendas: number }[] = [];
  for (let i = periodo - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const dataString = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    
    // Contar vendas concluídas criadas nesse dia
    const count = concluidas.filter((v) => v.data === dataString).length;
    vendasDiarias.push({ dia: label, vendas: count });
  }

  // Faturamento mensal
  // Agrupar faturamento por mês (últimos 6 meses)
  const mesesAbrev = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const faturamentosMensais: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje);
    d.setMonth(d.getMonth() - i);
    const label = mesesAbrev[d.getMonth()];
    faturamentosMensais[label] = 0;
  }

  concluidas.forEach((v) => {
    // v.data format: YYYY-MM-DD
    const parts = v.data.split("-");
    if (parts.length === 3) {
      const mesIdx = parseInt(parts[1]) - 1;
      const label = mesesAbrev[mesIdx];
      if (faturamentosMensais[label] !== undefined) {
        faturamentosMensais[label] += v.total;
      }
    }
  });

  const vendasPorMes = Object.entries(faturamentosMensais).map(([mes, faturamento]) => ({
    mes,
    faturamento,
  }));

  const ticketMedio = concluidas.length > 0 ? faturamentoTotal / concluidas.length : 0;

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
              <p className="text-3xl font-bold text-gray-900 mt-1">{concluidas.length}</p>
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
              <p className="text-3xl font-bold text-gray-900 mt-1">
                R$ {faturamentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
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
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
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
            { label: "Total de Vendas", value: String(concluidas.length), green: false },
            { label: "Receita Líquida", value: `R$ ${faturamentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, green: true },
            { label: "Ticket Médio", value: `R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, green: true },
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

const medalhas: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function InteligenciaView({
  vendas,
  produtos,
  insumos,
  isLoading,
}: {
  vendas: Venda[];
  produtos: Produto[];
  insumos: Insumo[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded-xl">Carregando inteligência comercial...</div>;
  }

  // Filtrar apenas concluídas
  const concluidas = vendas.filter((v) => v.status === "Concluída");

  // 1. Calcular Produtos Campeões (Max 5)
  const vendasPorProduto: Record<string, { nome: string; quantidade: number }> = {};
  concluidas.forEach((venda) => {
    venda.itens.forEach((item) => {
      if (!vendasPorProduto[item.produtoId]) {
        vendasPorProduto[item.produtoId] = { nome: item.nomeProduto, quantidade: 0 };
      }
      vendasPorProduto[item.produtoId].quantidade += item.quantidade;
    });
  });

  const produtosCampeoes = Object.values(vendasPorProduto)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5)
    .map((item, index) => ({
      posicao: index + 1,
      nome: item.nome,
      qtd: item.quantidade,
    }));

  // 2. Calcular Clientes VIP (Max 5)
  const comprasPorCliente: Record<string, { nome: string; pedidos: number; total: number }> = {};
  concluidas.forEach((venda) => {
    const nome = venda.cliente.trim();
    if (!comprasPorCliente[nome]) {
      comprasPorCliente[nome] = { nome, pedidos: 0, total: 0 };
    }
    comprasPorCliente[nome].pedidos += 1;
    comprasPorCliente[nome].total += venda.total;
  });

  const clientesVip = Object.values(comprasPorCliente)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((c, index) => ({
      rank: index + 1,
      nome: c.nome,
      pedidos: c.pedidos,
      total: c.total,
    }));

  // 3. Giro de Estoque (Produtos com alto giro vs. sem giro)
  const produtosVendidosIds = Object.keys(vendasPorProduto);
  
  // Alto Giro: Estão no TOP vendidos e possuem estoque baixo em relação à procura
  const altoGiro = produtos
    .filter((p) => vendasPorProduto[p.id] && vendasPorProduto[p.id].quantidade > 0)
    .map((p) => ({
      nome: p.nome,
      qtdVendida: vendasPorProduto[p.id].quantidade,
      estoqueAtual: p.quantidade,
      tipo: p.tipo,
    }))
    .sort((a, b) => b.qtdVendida - a.qtdVendida)
    .slice(0, 3);

  // Sem Giro (Estoque encalhado): Possuem quantidade em estoque mas zero vendas registradas
  const semGiro = produtos
    .filter((p) => p.quantidade > 0 && !produtosVendidosIds.includes(p.id))
    .slice(0, 3);

  // 4. Previsão de Necessidade de Matéria-Prima (Gargalos de Produção)
  // Regra de Consumo Simplificada: 
  // Quimono Completo consome 3.5m de Tecido e 1 Linha. Calça consome 2m de Tecido. Faixa consome 1m de Tecido.
  let tecidoGastoNecessario = 0;
  let linhaGastoNecessario = 0;

  // Calculamos a velocidade de vendas nos últimos 30 dias (de todos os quimonos e peças)
  concluidas.forEach((venda) => {
    venda.itens.forEach((item) => {
      const nomeLower = item.nomeProduto.toLowerCase();
      if (nomeLower.includes("quimono")) {
        tecidoGastoNecessario += 3.5 * item.quantidade;
        linhaGastoNecessario += 1.0 * item.quantidade;
      } else if (nomeLower.includes("calça") || nomeLower.includes("calca")) {
        tecidoGastoNecessario += 2.0 * item.quantidade;
      } else if (nomeLower.includes("faixa")) {
        tecidoGastoNecessario += 1.0 * item.quantidade;
      }
    });
  });

  const tecidoInsumo = insumos.find((i) => i.nome.toLowerCase().includes("tecido") || i.tipo.toLowerCase().includes("tecido"));
  const linhaInsumo = insumos.find((i) => i.nome.toLowerCase().includes("linha") || i.tipo.toLowerCase().includes("linha"));

  const alertasGargalo: { nome: string; estoque: number; unidade: string; diasEstimados: number; status: "urgente" | "alerta" }[] = [];

  if (tecidoInsumo && tecidoGastoNecessario > 0) {
    const ritmoMensal = tecidoGastoNecessario; // consumo médio do histórico atual
    const ritmoDiario = ritmoMensal / 30;
    const diasEstimados = Math.round(tecidoInsumo.quantidade / (ritmoDiario || 1));
    if (diasEstimados <= 30) {
      alertasGargalo.push({
        nome: tecidoInsumo.nome,
        estoque: tecidoInsumo.quantidade,
        unidade: tecidoInsumo.unidade.toLowerCase(),
        diasEstimados,
        status: diasEstimados <= 10 ? "urgente" : "alerta",
      });
    }
  }

  if (linhaInsumo && linhaGastoNecessario > 0) {
    const ritmoMensal = linhaGastoNecessario;
    const ritmoDiario = ritmoMensal / 30;
    const diasEstimados = Math.round(linhaInsumo.quantidade / (ritmoDiario || 1));
    if (diasEstimados <= 30) {
      alertasGargalo.push({
        nome: linhaInsumo.nome,
        estoque: linhaInsumo.quantidade,
        unidade: linhaInsumo.unidade.toLowerCase(),
        diasEstimados,
        status: diasEstimados <= 10 ? "urgente" : "alerta",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Gargalo de Produção */}
      {alertasGargalo.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-600 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Previsão de Matéria-Prima (Gargalos de Insumo)</h3>
              <p className="text-xs text-red-500">Baseado no ritmo atual de vendas e fabricação dos quimonos</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {alertasGargalo.map((a) => (
              <div
                key={a.nome}
                className={`border rounded-lg p-4 flex flex-col justify-between ${
                  a.status === "urgente" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{a.nome}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Estoque Atual: {a.estoque} {a.unidade}</p>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    a.status === "urgente" ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"
                  }`}>
                    Acaba em ~{a.diasEstimados} dias
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Central: Campeões e VIPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Campeões */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-green-500" />
              <h3 className="text-sm font-semibold text-gray-900">Produtos Campeões de Venda (Top 5)</h3>
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
                {produtosCampeoes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-400 text-xs">Nenhum produto vendido ainda.</td>
                  </tr>
                ) : (
                  produtosCampeoes.map((p) => (
                    <tr key={p.posicao} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-lg">
                        {medalhas[p.posicao] ?? <span className="text-sm font-medium text-gray-400">{p.posicao}º</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.nome}</td>
                      <td className="px-6 py-3 text-right font-semibold text-green-600 tabular-nums">
                        {p.qtd} un.
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clientes VIP */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900">Clientes VIP (Top 5)</h3>
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
                {clientesVip.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400 text-xs">Nenhum cliente comprou ainda.</td>
                  </tr>
                ) : (
                  clientesVip.map((c) => (
                    <tr key={c.rank} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-bold text-gray-500">#{c.rank}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{c.nome}</td>
                      <td className="px-4 py-3 text-gray-500">{c.pedidos} compra{c.pedidos !== 1 ? "s" : ""}</td>
                      <td className="px-6 py-3 text-right font-semibold text-green-600 tabular-nums">
                        R$ {c.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Análise de Giro de Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alto Giro */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Produtos de Alto Giro 🔥</h3>
            <p className="text-xs text-gray-400">Produtos com venda recorrente acelerada</p>
          </div>
          <div className="space-y-3">
            {altoGiro.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Sem vendas para classificar o giro.</p>
            ) : (
              altoGiro.map((a) => (
                <div key={a.nome} className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.nome}</p>
                    <p className="text-xs text-gray-400">Vendas: {a.qtdVendida} un. | Estoque Atual: {a.estoqueAtual} un.</p>
                  </div>
                  <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full font-semibold">
                    Giro Rápido
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sem Giro (Encalhado) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Produtos com Estoque Parado ⚠️</h3>
            <p className="text-xs text-gray-400">Em estoque com zero saídas registradas</p>
          </div>
          <div className="space-y-3">
            {semGiro.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Nenhum produto encalhado em estoque.</p>
            ) : (
              semGiro.map((s) => (
                <div key={s.id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.nome}</p>
                    <p className="text-xs text-gray-400">Quantidade em Estoque: {s.quantidade} un.</p>
                  </div>
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full font-semibold">
                    Parado
                  </span>
                </div>
              ))
            )}
          </div>
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

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoadingVendas, setIsLoadingVendas] = useState(true);

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

    setIsLoadingVendas(true);
    getVendas()
      .then((data) => setVendas(data))
      .catch((e) => console.error("Erro ao carregar vendas na dashboard:", e))
      .finally(() => setIsLoadingVendas(false));
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
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral da loja de quimonos</p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 w-full sm:w-fit shadow-sm">
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
        {activeTab === "vendas" && <VendasView vendas={vendas} isLoading={isLoadingVendas} />}
        {activeTab === "inteligencia" && (
          <InteligenciaView
            vendas={vendas}
            produtos={produtos}
            insumos={insumos}
            isLoading={isLoadingVendas || isLoadingProdutos || isLoadingInsumos}
          />
        )}
      </main>
    </div>
  );
}

