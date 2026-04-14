import { useState } from 'react'
import { useCaixa } from '../hooks/useCaixa'
import { useMetas } from '../hooks/useMetas'
import { useTrafego } from '../hooks/useTrafego'
import { useLeads, ESTAGIOS } from '../hooks/useLeads'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { Wallet, Target, Megaphone, Users, ArrowRight } from 'lucide-react'
import { formatarMoeda, formatarDataCurta, formatarPorcentagem } from '../lib/formatters'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TABS = ['Overview', 'Analytics', 'Reports']

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-ink-muted mb-1 font-semibold uppercase tracking-wider">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.stroke ?? p.fill }} className="font-bold">
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

function RevenueChart({ transacoes }) {
  const meses = Array.from({ length: 7 }, (_, i) => {
    const d = subMonths(new Date(), 6 - i)
    return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM', { locale: ptBR }) }
  })
  const data = meses.map(({ key, label }) => {
    const do_mes = transacoes.filter(t => t.data?.startsWith(key))
    return {
      mes: label.charAt(0).toUpperCase() + label.slice(1),
      Vendas: do_mes.filter(t => t.tipo === 'receita').reduce((a, t) => a + Number(t.valor), 0),
      Receita: do_mes.filter(t => t.tipo === 'despesa').reduce((a, t) => a + Number(t.valor), 0),
    }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#FFFFFF" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#2A2A2A" vertical={false} />
        <XAxis dataKey="mes" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} width={42} />
        <Tooltip content={<ChartTooltip formatter={formatarMoeda} />} />
        <Area type="monotone" dataKey="Vendas" stroke="#FFFFFF" strokeWidth={2} fill="url(#gradVendas)" dot={false} />
        <Area type="monotone" dataKey="Receita" stroke="#555555" strokeWidth={1.5} strokeDasharray="5 4" fill="none" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview')
  const { saldoAtual, totalReceitas, totalDespesas, transacoes } = useCaixa()
  const { totalMetas, metasAtingidas, metas } = useMetas()
  const { campanhasAtivas, roiGeral, totalInvestido, campanhas } = useTrafego()
  const { totalLeads, pipeline } = useLeads()
  const ultimasTransacoes = transacoes.slice(0, 6)

  const conversionRate = totalLeads > 0
    ? ((pipeline['cliente']?.length ?? 0) / totalLeads * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-0 animate-fade-in">

      {/* Hero header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="label-caps mb-2">Overview</p>
          <h1 className="font-display font-extrabold italic text-white leading-none"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', lineHeight: '0.9' }}>
            PERFORMANCE<br />LAB
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab ? 'tab-active' : 'tab'} ${i === 0 ? 'rounded-l-md' : ''} ${i === TABS.length - 1 ? 'rounded-r-md' : ''} -ml-px first:ml-0`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="card overflow-hidden mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border px-6">
          <StatCard
            label="Total de Receitas"
            value={formatarMoeda(totalReceitas)}
            icon={Wallet}
            delta={12.5}
            deltaLabel="+12.5%"
          />
          <StatCard
            label="Leads Ativos"
            value={String(totalLeads)}
            icon={Users}
            delta={18.2}
            deltaLabel="+18.2%"
          />
          <StatCard
            label="Taxa de Conversão"
            value={`${conversionRate}%`}
            icon={Target}
            delta={roiGeral !== null ? (roiGeral >= 0 ? 2.4 : -2.4) : -2.4}
            deltaLabel={roiGeral !== null ? formatarPorcentagem(roiGeral) : '-2.4%'}
          />
        </div>
      </div>

      {/* Chart + toggle */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="label-caps">Receitas vs Despesas</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-ink-muted font-medium uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
              Sales
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-muted font-medium uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full border border-ink-muted inline-block" />
              Revenue
            </span>
          </div>
        </div>
        <RevenueChart transacoes={transacoes} />
      </div>

      {/* Recent Transactions */}
      <div className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <p className="label-caps">Recent Transactions</p>
          <a href="/caixa">
            <span className="text-[10px] font-bold uppercase tracking-widest border border-border px-3 py-1.5 rounded text-ink-muted hover:text-ink hover:border-border-light transition-colors">
              Live Feed
            </span>
          </a>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[80px_1fr_140px_120px] gap-4 px-5 py-3 border-b border-border">
          <p className="label-caps">ID</p>
          <p className="label-caps">Descrição</p>
          <p className="label-caps">Status</p>
          <p className="label-caps text-right">Valor</p>
        </div>

        {ultimasTransacoes.length === 0 ? (
          <p className="text-ink-muted text-sm text-center py-10">Nenhuma transação ainda</p>
        ) : (
          <div className="divide-y divide-border">
            {ultimasTransacoes.map((t, idx) => (
              <div key={t.id} className="grid grid-cols-[80px_1fr_140px_120px] gap-4 px-5 py-3.5 items-center hover:bg-surface2 transition-colors">
                <p className="text-ink-muted text-xs font-mono">#{String(idx + 1).padStart(4, '0')}</p>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-surface3 border border-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-ink-muted">
                    {t.descricao?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{t.descricao}</p>
                    <p className="text-ink-muted text-xs">{t.categoria}</p>
                  </div>
                </div>
                <div>
                  {t.tipo === 'receita' ? (
                    <span className="text-success text-xs font-bold uppercase tracking-widest">Completed</span>
                  ) : (
                    <span className="text-warning text-xs font-bold uppercase tracking-widest">Processing</span>
                  )}
                </div>
                <p className={`text-right text-sm font-bold ${t.tipo === 'receita' ? 'text-white' : 'text-ink-muted'}`}>
                  {t.tipo === 'receita' ? '+' : '-'}{formatarMoeda(t.valor)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lab Insight */}
        <div className="card-cream p-6">
          <h3 className="font-display font-extrabold italic text-black text-2xl mb-3 uppercase">
            Lab Insight
          </h3>
          <p className="text-black/70 text-sm leading-relaxed">
            {totalReceitas > totalDespesas
              ? <>Suas receitas estão <span className="text-green-600 font-bold">acima</span> das despesas este período. Continue investindo em campanhas de tráfego para ampliar os resultados.</>
              : <>Suas despesas estão <span className="text-red-600 font-bold">acima</span> das receitas. Revise os gastos e foque em fechar mais leads do pipeline.</>
            }
            {' '}{metasAtingidas > 0 && <><span className="text-green-700 font-bold">{metasAtingidas}</span> meta{metasAtingidas > 1 ? 's' : ''} atingida{metasAtingidas > 1 ? 's' : ''} no período.</>}
          </p>
        </div>

        {/* Export Data */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold italic text-white text-2xl mb-1 uppercase">
              Export Data
            </h3>
            <p className="label-caps mt-1">Download full laboratory report (PDF/CSV)</p>
          </div>
          <div className="flex justify-end mt-4">
            <a href="/caixa" className="w-10 h-10 border border-border rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:border-border-light transition-colors">
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
