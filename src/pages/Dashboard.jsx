import { useState } from 'react'
import { useCaixa } from '../hooks/useCaixa'
import { useMetas } from '../hooks/useMetas'
import { useTrafego } from '../hooks/useTrafego'
import { useLeads, ESTAGIOS } from '../hooks/useLeads'
import { useActivity } from '../hooks/useActivity'
import { Badge } from '../components/ui/Badge'
import {
  Wallet, Target, Megaphone, Users, ArrowRight,
  TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { formatarMoeda, formatarDataCurta, formatarPorcentagem } from '../lib/formatters'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { format, subMonths, startOfMonth, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TABS = ['Overview', 'Analytics', 'Reports']

/* ─── Tooltip de gráfico ─── */
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border rounded-lg px-3 py-2.5 text-xs shadow-xl">
      {label && <p className="text-ink-muted mb-1.5 font-semibold uppercase tracking-wider">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.stroke ?? p.fill ?? '#fff' }} className="font-bold">
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

/* ─── Card de métrica grande ─── */
function BigMetric({ label, value, sub, color = 'text-white', borderColor = 'border-border', badge }) {
  return (
    <div className={`card p-5 border-t-2 ${borderColor}`}>
      <p className="label-caps mb-3">{label}</p>
      <p className={`font-display font-extrabold italic text-3xl sm:text-4xl leading-none tracking-tight ${color}`}>
        {value}
      </p>
      {sub && <p className="text-ink-muted text-xs mt-2 font-medium">{sub}</p>}
      {badge && (
        <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badge.cls}`}>
          {badge.text}
        </span>
      )}
    </div>
  )
}

/* ─── Linha da tabela mensal ─── */
function MonthRow({ mes, receitas, despesas, trafego, lucro, isLast }) {
  const margem = receitas > 0 ? (lucro / receitas) * 100 : 0
  const positivo = lucro >= 0
  return (
    <div className={`grid grid-cols-[90px_1fr_1fr_1fr_1fr_80px] gap-2 px-5 py-3 text-sm hover:bg-surface2 transition-colors ${!isLast ? 'border-b border-border' : ''}`}>
      <p className="text-ink-muted font-semibold uppercase text-xs">{mes}</p>
      <p className="text-success font-semibold">{formatarMoeda(receitas)}</p>
      <p className="text-danger font-semibold">{formatarMoeda(despesas)}</p>
      <p className="text-warning font-semibold">{formatarMoeda(trafego)}</p>
      <p className={`font-bold ${positivo ? 'text-white' : 'text-danger'}`}>{formatarMoeda(lucro)}</p>
      <p className={`text-right font-bold text-xs ${margem >= 20 ? 'text-success' : margem >= 0 ? 'text-warning' : 'text-danger'}`}>
        {margem.toFixed(1)}%
      </p>
    </div>
  )
}

/* ─── Gráfico de área ─── */
function RevenueChart({ transacoes }) {
  const meses = Array.from({ length: 7 }, (_, i) => {
    const d = subMonths(new Date(), 6 - i)
    return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM', { locale: ptBR }) }
  })
  const data = meses.map(({ key, label }) => {
    const do_mes = transacoes.filter(t => t.data?.startsWith(key))
    return {
      mes: label.charAt(0).toUpperCase() + label.slice(1),
      Receita: do_mes.filter(t => t.tipo === 'receita').reduce((a, t) => a + Number(t.valor), 0),
      Despesa: do_mes.filter(t => t.tipo === 'despesa').reduce((a, t) => a + Number(t.valor), 0),
    }
  })
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00D084" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00D084" stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id="gDesp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#FF4545" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#FF4545" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#2A2A2A" vertical={false} />
        <XAxis dataKey="mes" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} width={42} />
        <Tooltip content={<ChartTooltip formatter={formatarMoeda} />} />
        <Area type="monotone" dataKey="Receita" stroke="#00D084" strokeWidth={2} fill="url(#gRec)" dot={false} />
        <Area type="monotone" dataKey="Despesa" stroke="#FF4545" strokeWidth={1.5} strokeDasharray="5 4" fill="url(#gDesp)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ─── Gráfico de categorias ─── */
function CategoriaChart({ transacoes }) {
  const categorias = {}
  transacoes.filter(t => t.tipo === 'despesa').forEach(t => {
    categorias[t.categoria] = (categorias[t.categoria] ?? 0) + Number(t.valor)
  })
  const data = Object.entries(categorias)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, val]) => ({ cat: cat.length > 14 ? cat.slice(0, 14) + '…' : cat, val }))
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-[160px] text-ink-muted text-sm">Sem despesas registradas</div>
  )
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" barGap={2} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
        <XAxis type="number" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
        <YAxis type="category" dataKey="cat" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
        <Tooltip content={<ChartTooltip formatter={formatarMoeda} />} />
        <Bar dataKey="val" name="Gasto" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#FF4545' : i === 1 ? '#F59E0B' : '#3A3A3A'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ═══════════════════════════════════════════════ */
export function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview')

  const { saldoAtual, totalReceitas, totalDespesas, transacoes } = useCaixa()
  const { totalMetas, metasAtingidas, metas } = useMetas()
  const { campanhasAtivas, roiGeral, totalInvestido, totalReceita: receitaTrafego, campanhas } = useTrafego()
  const { totalLeads, clientes, perdidos, emNegociacao, pipeline } = useLeads()
  const { activities } = useActivity(8)

  /* ── Cálculos financeiros ── */
  const custosTotal     = totalDespesas + totalInvestido
  const lucroLiquido    = totalReceitas - custosTotal
  const margemLucro     = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0
  const ticketMedio     = clientes > 0 ? totalReceitas / clientes : 0
  const taxaConversao   = (totalLeads + perdidos) > 0 ? (clientes / (totalLeads + perdidos)) * 100 : 0
  const lucroPositivo   = lucroLiquido >= 0

  /* ── Tabela mensal (últimos 6 meses) ── */
  const meses6 = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    const key = format(d, 'yyyy-MM')
    const label = format(d, 'MMM/yy', { locale: ptBR })
    const do_mes = transacoes.filter(t => t.data?.startsWith(key))
    const rec  = do_mes.filter(t => t.tipo === 'receita').reduce((a, t) => a + Number(t.valor), 0)
    const desp = do_mes.filter(t => t.tipo === 'despesa').reduce((a, t) => a + Number(t.valor), 0)
    // tráfego por mês não temos data granular, então mostramos zero
    return { mes: label, receitas: rec, despesas: desp, trafego: 0, lucro: rec - desp }
  })

  const ultimasTransacoes = transacoes.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="label-caps mb-2">Overview</p>
          <h1 className="font-display font-extrabold italic text-white uppercase leading-none"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
            PERFORMANCE<br />LAB
          </h1>
        </div>
        <div className="flex items-center">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab ? 'tab-active' : 'tab'} ${i === 0 ? 'rounded-l-md' : ''} ${i === TABS.length-1 ? 'rounded-r-md' : ''} -ml-px first:ml-0`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BLOCO 1 — RESULTADO FINANCEIRO (destaque)
      ══════════════════════════════════════════ */}
      <div>
        <p className="label-caps mb-3">Resultado Financeiro</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <BigMetric
            label="Faturamento Bruto"
            value={formatarMoeda(totalReceitas)}
            sub="Total de receitas lançadas"
            color="text-success"
            borderColor="border-success"
          />
          <BigMetric
            label="Custos Totais"
            value={formatarMoeda(custosTotal)}
            sub={`Desp. ${formatarMoeda(totalDespesas)} + Tráfego ${formatarMoeda(totalInvestido)}`}
            color="text-danger"
            borderColor="border-danger"
          />
          <BigMetric
            label="Lucro Líquido"
            value={formatarMoeda(Math.abs(lucroLiquido))}
            sub={lucroPositivo ? 'Positivo — você está lucrando' : 'Negativo — custos acima da receita'}
            color={lucroPositivo ? 'text-white' : 'text-danger'}
            borderColor={lucroPositivo ? 'border-white' : 'border-danger'}
            badge={lucroPositivo
              ? { text: `▲ Margem ${margemLucro.toFixed(1)}%`, cls: 'bg-success/15 text-success' }
              : { text: `▼ Prejuízo ${Math.abs(margemLucro).toFixed(1)}%`, cls: 'bg-danger/15 text-danger' }
            }
          />
          <BigMetric
            label="Saldo em Caixa"
            value={formatarMoeda(Math.abs(saldoAtual))}
            sub={saldoAtual >= 0 ? 'Receitas superam despesas' : 'Despesas superam receitas'}
            color={saldoAtual >= 0 ? 'text-white' : 'text-danger'}
            borderColor="border-border-light"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BLOCO 2 — KPIs DE NEGÓCIO
      ══════════════════════════════════════════ */}
      <div>
        <p className="label-caps mb-3">Indicadores de Negócio</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* ROI Tráfego */}
          <div className="card p-4">
            <p className="label-caps mb-2">ROI Tráfego</p>
            <p className={`font-display font-extrabold italic text-3xl leading-none ${roiGeral !== null && roiGeral >= 0 ? 'text-success' : 'text-danger'}`}>
              {roiGeral !== null ? formatarPorcentagem(roiGeral) : '—'}
            </p>
            <p className="text-ink-muted text-xs mt-2">
              {totalInvestido > 0
                ? `R$ ${(receitaTrafego/totalInvestido).toFixed(1)}x retorno`
                : 'Nenhuma campanha'}
            </p>
          </div>

          {/* Taxa de Conversão */}
          <div className="card p-4">
            <p className="label-caps mb-2">Taxa de Conversão</p>
            <p className={`font-display font-extrabold italic text-3xl leading-none ${taxaConversao >= 20 ? 'text-success' : taxaConversao >= 10 ? 'text-warning' : 'text-white'}`}>
              {taxaConversao.toFixed(1)}%
            </p>
            <p className="text-ink-muted text-xs mt-2">{clientes} de {totalLeads + perdidos} leads viraram clientes</p>
          </div>

          {/* Ticket Médio */}
          <div className="card p-4">
            <p className="label-caps mb-2">Ticket Médio</p>
            <p className="font-display font-extrabold italic text-3xl leading-none text-white">
              {clientes > 0 ? formatarMoeda(ticketMedio) : '—'}
            </p>
            <p className="text-ink-muted text-xs mt-2">
              {clientes > 0 ? `${clientes} clientes ativos` : 'Nenhum cliente ainda'}
            </p>
          </div>

          {/* Metas */}
          <div className="card p-4">
            <p className="label-caps mb-2">Metas Atingidas</p>
            <p className="font-display font-extrabold italic text-3xl leading-none text-white">
              {metasAtingidas}/{totalMetas}
            </p>
            <div className="mt-2 h-1 bg-surface3 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-500"
                style={{ width: totalMetas > 0 ? `${(metasAtingidas/totalMetas)*100}%` : '0%' }}
              />
            </div>
            <p className="text-ink-muted text-xs mt-1.5">
              {totalMetas > 0 ? `${Math.round((metasAtingidas/totalMetas)*100)}% concluído` : 'Nenhuma meta'}
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BLOCO 3 — GRÁFICO + CATEGORIAS
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Gráfico de área — col 3 */}
        <div className="card p-5 md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="label-caps">Receita vs Despesa</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 label-caps">
                <span className="w-2 h-2 rounded-full bg-success inline-block" />Receita
              </span>
              <span className="flex items-center gap-1.5 label-caps">
                <span className="w-2 h-2 rounded-full bg-danger inline-block" />Despesa
              </span>
            </div>
          </div>
          <RevenueChart transacoes={transacoes} />
        </div>

        {/* Top categorias de custo — col 2 */}
        <div className="card p-5 md:col-span-2">
          <p className="label-caps mb-4">Maiores Custos por Categoria</p>
          <CategoriaChart transacoes={transacoes} />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BLOCO 4 — TABELA MENSAL
      ══════════════════════════════════════════ */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="label-caps">Resultado por Mês (últimos 6 meses)</p>
        </div>
        {/* Header */}
        <div className="grid grid-cols-[90px_1fr_1fr_1fr_1fr_80px] gap-2 px-5 py-2.5 border-b border-border bg-surface2">
          <p className="label-caps">Mês</p>
          <p className="label-caps text-success">Receita</p>
          <p className="label-caps text-danger">Despesa</p>
          <p className="label-caps text-warning">Tráfego</p>
          <p className="label-caps">Lucro</p>
          <p className="label-caps text-right">Margem</p>
        </div>
        {meses6.map((row, i) => (
          <MonthRow key={row.mes} {...row} isLast={i === meses6.length - 1} />
        ))}
        {/* Totais */}
        <div className="grid grid-cols-[90px_1fr_1fr_1fr_1fr_80px] gap-2 px-5 py-3.5 border-t border-border-light bg-surface2">
          <p className="label-caps text-white">TOTAL</p>
          <p className="text-success font-bold text-sm">{formatarMoeda(totalReceitas)}</p>
          <p className="text-danger font-bold text-sm">{formatarMoeda(totalDespesas)}</p>
          <p className="text-warning font-bold text-sm">{formatarMoeda(totalInvestido)}</p>
          <p className={`font-bold text-sm ${lucroPositivo ? 'text-white' : 'text-danger'}`}>{formatarMoeda(lucroLiquido)}</p>
          <p className={`text-right font-bold text-sm ${margemLucro >= 20 ? 'text-success' : margemLucro >= 0 ? 'text-warning' : 'text-danger'}`}>
            {margemLucro.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BLOCO 5 — TRANSAÇÕES + PIPELINE
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Transações recentes */}
        <div className="card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <p className="label-caps">Últimas Transações</p>
            <a href="/caixa" className="label-caps text-white hover:text-ink-muted transition-colors flex items-center gap-1">
              Ver todas <ArrowRight size={10} />
            </a>
          </div>
          {ultimasTransacoes.length === 0 ? (
            <p className="text-ink-muted text-sm text-center py-10">Nenhuma transação</p>
          ) : (
            <div className="divide-y divide-border">
              {ultimasTransacoes.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-surface2 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${t.tipo === 'receita' ? 'bg-success' : 'bg-danger'}`} />
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{t.descricao}</p>
                      <p className="text-ink-muted text-xs mt-0.5">{t.categoria} · {formatarDataCurta(t.data)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${t.tipo === 'receita' ? 'text-success' : 'text-danger'}`}>
                    {t.tipo === 'receita' ? '+' : '-'}{formatarMoeda(t.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline de leads */}
        <div className="card p-5 lg:col-span-2">
          <p className="label-caps mb-4">Pipeline de Leads</p>
          <div className="space-y-3">
            {ESTAGIOS.map(e => {
              const count = pipeline[e.key]?.length ?? 0
              const total = Object.values(pipeline).reduce((a, v) => a + v.length, 0)
              const pct = total > 0 ? (count / total) * 100 : 0
              const colors = {
                lead: 'bg-ink-faint',
                em_negociacao: 'bg-warning',
                proposta_enviada: 'bg-brand',
                cliente: 'bg-success',
                perdido: 'bg-danger',
              }
              return (
                <div key={e.key}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-ink-muted text-xs font-medium">{e.label}</p>
                    <p className="text-white text-xs font-bold">{count}</p>
                  </div>
                  <div className="h-1 bg-surface3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors[e.key]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <p className="label-caps">Em negociação</p>
              <p className="text-warning font-bold text-sm">{emNegociacao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BLOCO 6 — LAB INSIGHT + EXPORT
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-cream p-6">
          <h3 className="font-display font-extrabold italic text-black text-2xl mb-3 uppercase">Lab Insight</h3>
          <p className="text-black/75 text-sm leading-relaxed">
            {lucroPositivo
              ? <>Seu negócio está <span className="text-green-700 font-bold">lucrando</span> com margem de <span className="text-green-700 font-bold">{margemLucro.toFixed(1)}%</span>. {campanhasAtivas > 0 && <>Você tem {campanhasAtivas} campanha{campanhasAtivas > 1 ? 's' : ''} ativa{campanhasAtivas > 1 ? 's' : ''} com ROI de {formatarPorcentagem(roiGeral)}. </>}Continue alimentando o pipeline — {emNegociacao} lead{emNegociacao !== 1 ? 's' : ''} em negociação.</>
              : <>Seus custos estão <span className="text-red-600 font-bold">acima</span> da receita em {formatarMoeda(Math.abs(lucroLiquido))}. Revise as despesas e foque em fechar os {emNegociacao} lead{emNegociacao !== 1 ? 's' : ''} em negociação para reverter o resultado.</>
            }
          </p>
        </div>
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold italic text-white text-2xl mb-1 uppercase">Export Data</h3>
            <p className="label-caps mt-1">Download full laboratory report (PDF/CSV)</p>
          </div>
          <div className="flex justify-end mt-4">
            <a href="/caixa" className="w-10 h-10 border border-border rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:border-border-light transition-colors">
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BLOCO 7 — ATIVIDADE RECENTE
      ══════════════════════════════════════════ */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="label-caps text-white">Atividade Recente</p>
          <p className="label-caps">{activities.length} ações</p>
        </div>

        {activities.length === 0 ? (
          <div className="py-10 text-center">
            <p className="label-caps">Nenhuma atividade registrada ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {activities.map(a => {
              const ACTION_COLOR = {
                criou: 'text-success', adicionou: 'text-success',
                editou: 'text-warning', moveu: 'text-brand',
                excluiu: 'text-danger', removeu: 'text-danger',
              }
              const ENTITY_LABEL = {
                transacao: 'Transação', lead: 'Lead',
                campanha: 'Campanha', meta: 'Meta', funcionario: 'Funcionário',
              }
              const color = ACTION_COLOR[a.action] ?? 'text-ink-muted'
              const entity = ENTITY_LABEL[a.entity_type] ?? a.entity_type
              const user = a.user_email?.split('@')[0] ?? 'Usuário'
              const displayUser = user.charAt(0).toUpperCase() + user.slice(1)
              const timeAgo = formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })

              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-surface2 transition-colors">
                  {/* User avatar */}
                  <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white font-black flex-shrink-0" style={{ fontSize: '10px' }}>
                    {displayUser.slice(0, 2).toUpperCase()}
                  </div>
                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs">
                      <span className="font-bold">{displayUser}</span>
                      {' '}
                      <span className={`font-bold ${color}`}>{a.action}</span>
                      {' '}
                      <span className="text-ink-muted">{entity}{a.entity_name ? `: ` : ''}</span>
                      {a.entity_name && <span className="font-bold">{a.entity_name}</span>}
                      {a.meta?.para && <span className="text-ink-muted"> → {a.meta.para}</span>}
                    </p>
                  </div>
                  {/* Time */}
                  <span className="label-caps flex-shrink-0">{timeAgo}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
