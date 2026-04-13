import { useCaixa } from '../hooks/useCaixa'
import { useMetas } from '../hooks/useMetas'
import { useTrafego } from '../hooks/useTrafego'
import { useLeads, ESTAGIOS } from '../hooks/useLeads'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { Wallet, Target, Megaphone, Users, TrendingUp, TrendingDown } from 'lucide-react'
import { formatarMoeda, formatarDataCurta, formatarPorcentagem } from '../lib/formatters'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { format, parseISO, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const COLORS = {
  receita: '#22C55E',
  despesa: '#EF4444',
  brand: '#6C63FF',
  warning: '#F59E0B',
  lead: '#6C63FF',
  em_negociacao: '#F59E0B',
  proposta_enviada: '#A78BFA',
  cliente: '#22C55E',
  perdido: '#EF4444',
}

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      {label && <p className="text-text-secondary mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

function CaixaChart({ transacoes }) {
  // Agrupar por mês (últimos 6 meses)
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM', { locale: ptBR }) }
  })

  const data = meses.map(({ key, label }) => {
    const do_mes = transacoes.filter(t => t.data?.startsWith(key))
    return {
      mes: label,
      Receitas: do_mes.filter(t => t.tipo === 'receita').reduce((a, t) => a + Number(t.valor), 0),
      Despesas: do_mes.filter(t => t.tipo === 'despesa').reduce((a, t) => a + Number(t.valor), 0),
    }
  })

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-text-primary font-semibold text-sm mb-4">Receitas vs Despesas (6 meses)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2E3248" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: '#8B8FA8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8B8FA8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} width={45} />
          <Tooltip content={<ChartTooltip formatter={formatarMoeda} />} />
          <Bar dataKey="Receitas" fill={COLORS.receita} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Despesas" fill={COLORS.despesa} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function LeadsPipelineChart({ pipeline }) {
  const data = ESTAGIOS.map(e => ({
    name: e.label,
    value: pipeline[e.key]?.length ?? 0,
    color: COLORS[e.key],
  })).filter(d => d.value > 0)

  const total = data.reduce((a, d) => a + d.value, 0)

  if (total === 0) return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-text-primary font-semibold text-sm mb-4">Distribuição de Leads</h3>
      <div className="flex items-center justify-center h-[200px] text-text-secondary text-sm">Nenhum lead cadastrado</div>
    </div>
  )

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-text-primary font-semibold text-sm mb-4">Distribuição de Leads</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#8B8FA8', fontSize: 11 }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrafegoChart({ campanhas }) {
  const data = campanhas.slice(0, 6).map(c => ({
    nome: c.nome.length > 12 ? c.nome.slice(0, 12) + '…' : c.nome,
    Orçamento: Number(c.orcamento_total),
    Investido: Number(c.valor_investido),
    Receita: Number(c.receita_gerada),
  }))

  if (data.length === 0) return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-text-primary font-semibold text-sm mb-4">Campanhas — Orçamento vs Investido</h3>
      <div className="flex items-center justify-center h-[200px] text-text-secondary text-sm">Nenhuma campanha cadastrada</div>
    </div>
  )

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-text-primary font-semibold text-sm mb-4">Campanhas — Orçamento vs Investido</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2E3248" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#8B8FA8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="nome" tick={{ fill: '#8B8FA8', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
          <Tooltip content={<ChartTooltip formatter={formatarMoeda} />} />
          <Bar dataKey="Orçamento" fill="#2E3248" radius={[0, 4, 4, 0]} />
          <Bar dataKey="Investido" fill={COLORS.warning} radius={[0, 4, 4, 0]} />
          <Bar dataKey="Receita" fill={COLORS.receita} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function MetasChart({ totalMetas, metasAtingidas, metas }) {
  const emAndamento = metas.filter(m => m.status === 'em_andamento').length
  const atrasadas = metas.filter(m => m.status === 'atrasada').length

  const data = [
    { name: 'Atingidas', value: metasAtingidas, color: COLORS.receita },
    { name: 'Em andamento', value: emAndamento, color: COLORS.brand },
    { name: 'Atrasadas', value: atrasadas, color: COLORS.despesa },
  ].filter(d => d.value > 0)

  if (totalMetas === 0) return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-text-primary font-semibold text-sm mb-4">Status das Metas</h3>
      <div className="flex items-center justify-center h-[200px] text-text-secondary text-sm">Nenhuma meta cadastrada</div>
    </div>
  )

  const pct = totalMetas > 0 ? Math.round((metasAtingidas / totalMetas) * 100) : 0

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-text-primary font-semibold text-sm mb-4">Status das Metas</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#F1F2F6" fontSize={22} fontWeight="bold">{pct}%</text>
              <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fill="#8B8FA8" fontSize={10}>concluídas</text>
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#8B8FA8', fontSize: 11 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { saldoAtual, totalReceitas, totalDespesas, transacoes } = useCaixa()
  const { totalMetas, metasAtingidas, metas } = useMetas()
  const { campanhasAtivas, roiGeral, totalInvestido, campanhas } = useTrafego()
  const { totalLeads, clientes, emNegociacao, pipeline } = useLeads()

  const ultimasTransacoes = transacoes.slice(0, 5)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Saldo Atual"
          value={formatarMoeda(saldoAtual)}
          icon={Wallet}
          iconColor={saldoAtual >= 0 ? 'text-success' : 'text-danger'}
          iconBg={saldoAtual >= 0 ? 'bg-success/10' : 'bg-danger/10'}
        />
        <StatCard label="Leads Ativos" value={totalLeads} icon={Users} />
        <StatCard label="Campanhas Ativas" value={campanhasAtivas} icon={Megaphone} iconColor="text-warning" iconBg="bg-warning/10" />
        <StatCard label="Metas Atingidas" value={`${metasAtingidas}/${totalMetas}`} icon={Target} iconColor="text-brand" iconBg="bg-brand/10" />
      </div>

      {/* Gráficos — linha 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CaixaChart transacoes={transacoes} />
        <LeadsPipelineChart pipeline={pipeline} />
      </div>

      {/* Gráficos — linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrafegoChart campanhas={campanhas} />
        <MetasChart totalMetas={totalMetas} metasAtingidas={metasAtingidas} metas={metas} />
      </div>

      {/* Últimas transações + resumo financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-text-primary font-semibold text-sm">Últimas Transações</h2>
            <a href="/caixa" className="text-brand text-xs hover:underline">Ver todas</a>
          </div>
          {ultimasTransacoes.length === 0 ? (
            <p className="text-text-secondary text-sm text-center py-8">Nenhuma transação</p>
          ) : (
            <div className="divide-y divide-border/50">
              {ultimasTransacoes.map(t => (
                <div key={t.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge status={t.tipo} />
                    <div className="min-w-0">
                      <p className="text-text-primary text-xs font-medium truncate">{t.descricao}</p>
                      <p className="text-text-secondary text-xs">{t.categoria} · {formatarDataCurta(t.data)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${t.tipo === 'receita' ? 'text-success' : 'text-danger'}`}>
                    {t.tipo === 'receita' ? '+' : '-'}{formatarMoeda(t.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-success" />
              <span className="text-text-secondary text-xs uppercase tracking-wide">Receitas</span>
            </div>
            <p className="text-success text-xl font-bold">{formatarMoeda(totalReceitas)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={14} className="text-danger" />
              <span className="text-text-secondary text-xs uppercase tracking-wide">Despesas</span>
            </div>
            <p className="text-danger text-xl font-bold">{formatarMoeda(totalDespesas)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone size={14} className="text-warning" />
              <span className="text-text-secondary text-xs uppercase tracking-wide">Tráfego Investido</span>
            </div>
            <p className="text-warning text-xl font-bold">{formatarMoeda(totalInvestido)}</p>
            {roiGeral !== null && (
              <p className={`text-xs mt-1 ${roiGeral >= 0 ? 'text-success' : 'text-danger'}`}>
                ROI: {formatarPorcentagem(roiGeral)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
