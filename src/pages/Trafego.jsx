import { useState } from 'react'
import { useTrafego } from '../hooks/useTrafego'
import { useToast } from '../components/ui/Toast'
import { StatCard } from '../components/ui/StatCard'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Megaphone, Plus, Pencil, Trash2, Loader2, TrendingUp, Wallet } from 'lucide-react'
import { formatarMoeda, formatarPorcentagem } from '../lib/formatters'

const PLATAFORMAS = ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Outro']

function CampanhaForm({ inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nome: '', plataforma: 'Meta Ads', orcamento_total: '', valor_investido: '0',
    receita_gerada: '0', data_inicio: '', data_fim: '', status: 'ativa', notas: '',
    ...inicial,
  })
  const [loading, setLoading] = useState(false)
  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...form,
        orcamento_total: Number(form.orcamento_total),
        valor_investido: Number(form.valor_investido),
        receita_gerada: Number(form.receita_gerada),
        data_fim: form.data_fim || null,
      })
    } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome da campanha" value={form.nome} onChange={e => set('nome', e.target.value)} required placeholder="Ex: Campanha Abril - Leads" />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Plataforma" value={form.plataforma} onChange={e => set('plataforma', e.target.value)}>
          {PLATAFORMAS.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="ativa">Ativa</option>
          <option value="pausada">Pausada</option>
          <option value="encerrada">Encerrada</option>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Orçamento (R$)" type="number" step="0.01" value={form.orcamento_total} onChange={e => set('orcamento_total', e.target.value)} required />
        <Input label="Investido (R$)" type="number" step="0.01" value={form.valor_investido} onChange={e => set('valor_investido', e.target.value)} />
        <Input label="Receita Gerada (R$)" type="number" step="0.01" value={form.receita_gerada} onChange={e => set('receita_gerada', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data Início" type="date" value={form.data_inicio} onChange={e => set('data_inicio', e.target.value)} required />
        <Input label="Data Fim" type="date" value={form.data_fim} onChange={e => set('data_fim', e.target.value)} />
      </div>
      <Textarea label="Notas" value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observações sobre a campanha..." />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {inicial ? 'Salvar' : 'Criar Campanha'}
        </Button>
      </div>
    </form>
  )
}

export function Trafego() {
  const { campanhas, totalOrcamento, totalInvestido, roiGeral, campanhasAtivas, loading, addCampanha, updateCampanha, deleteCampanha } = useTrafego()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletandoId, setDeletandoId] = useState(null)

  async function handleSubmit(data) {
    try {
      if (editando) { await updateCampanha(editando.id, data); toast.addToast('Campanha atualizada!') }
      else { await addCampanha(data); toast.addToast('Campanha criada!') }
      setModalOpen(false); setEditando(null)
    } catch { toast.addToast('Erro ao salvar campanha.', 'error') }
  }

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <p className="label-caps mb-1">Marketing</p>
        <h1 className="font-display font-extrabold italic text-white uppercase" style={{ fontSize: '2.5rem', lineHeight: '0.95' }}>
          TRÁFEGO
        </h1>
      </div>

      {/* KPIs */}
      <div className="card divide-y divide-border sm:divide-y-0 sm:divide-x sm:grid sm:grid-cols-4">
        <StatCard label="Orçamento Total" value={formatarMoeda(totalOrcamento)} icon={Wallet} />
        <StatCard label="Total Investido" value={formatarMoeda(totalInvestido)} icon={TrendingUp} iconColor="text-warning" />
        <StatCard
          label="ROI Geral"
          value={roiGeral !== null ? formatarPorcentagem(roiGeral) : '—'}
          icon={TrendingUp}
          iconColor={roiGeral >= 0 ? 'text-success' : 'text-danger'}
        />
        <StatCard label="Campanhas Ativas" value={campanhasAtivas} icon={Megaphone} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="label-caps">Campanhas</p>
        <Button onClick={() => { setEditando(null); setModalOpen(true) }}><Plus size={14} />Nova Campanha</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-brand" /></div>
      ) : campanhas.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhuma campanha" description="Crie sua primeira campanha de tráfego pago." action={<Button onClick={() => setModalOpen(true)}><Plus size={14} />Criar Campanha</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campanhas.map(c => (
            <div key={c.id} className="card p-5 space-y-4">
              {/* Campaign header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{c.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge status={c.status} />
                    <span className="label-caps">{c.plataforma}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditando(c); setModalOpen(true) }}><Pencil size={12} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletandoId(c.id)}><Trash2 size={12} className="text-danger" /></Button>
                </div>
              </div>

              {/* Budget progress */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="label-caps">Orçamento utilizado</span>
                  <span className="text-white text-xs font-bold">{formatarMoeda(c.valor_investido)} / {formatarMoeda(c.orcamento_total)}</span>
                </div>
                <ProgressBar value={c.percentualGasto} status={c.percentualGasto >= 100 ? 'atrasada' : 'em_andamento'} showPercent={false} />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border">
                <div>
                  <p className="label-caps mb-1">Receita gerada</p>
                  <p className="text-success font-bold text-sm">{formatarMoeda(c.receita_gerada)}</p>
                </div>
                <div>
                  <p className="label-caps mb-1">ROI</p>
                  <p className={`font-bold text-sm ${c.roi === null ? 'text-ink-muted' : c.roi >= 0 ? 'text-success' : 'text-danger'}`}>
                    {c.roi !== null ? formatarPorcentagem(c.roi) : '—'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditando(null) }} title={editando ? 'Editar Campanha' : 'Nova Campanha'} maxWidth="max-w-xl">
        <CampanhaForm inicial={editando} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditando(null) }} />
      </Modal>

      <ConfirmModal isOpen={!!deletandoId} onClose={() => setDeletandoId(null)} onConfirm={() => { deleteCampanha(deletandoId); toast.addToast('Campanha excluída.', 'warning') }} message="Excluir esta campanha?" />
    </div>
  )
}
