import { useState } from 'react'
import { useMetas } from '../hooks/useMetas'
import { useToast } from '../components/ui/Toast'
import { StatCard } from '../components/ui/StatCard'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Select } from '../components/ui/Input'
import { Target, UserPlus, Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function FuncionarioForm({ inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState({ nome: '', cargo: '', ...inicial })
  const [loading, setLoading] = useState(false)
  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome" value={form.nome} onChange={e => set('nome', e.target.value)} required placeholder="Nome do funcionário" />
      <Input label="Cargo" value={form.cargo} onChange={e => set('cargo', e.target.value)} required placeholder="Ex: Designer, Comercial" />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {inicial ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

function MetaForm({ funcionarios, inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    funcionario_id: '', titulo: '', valor_alvo: '', valor_atual: '0',
    unidade: 'unidade', status: 'em_andamento', ...inicial,
  })
  const [loading, setLoading] = useState(false)
  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ ...form, valor_alvo: Number(form.valor_alvo), valor_atual: Number(form.valor_atual) })
    } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Funcionário" value={form.funcionario_id} onChange={e => set('funcionario_id', e.target.value)} required>
        <option value="">Selecionar...</option>
        {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
      </Select>
      <Input label="Título da meta" value={form.titulo} onChange={e => set('titulo', e.target.value)} required placeholder="Ex: Fechar 5 contratos" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Meta (alvo)" type="number" step="0.01" value={form.valor_alvo} onChange={e => set('valor_alvo', e.target.value)} required />
        <Input label="Atual" type="number" step="0.01" value={form.valor_atual} onChange={e => set('valor_atual', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Unidade" value={form.unidade} onChange={e => set('unidade', e.target.value)} placeholder="projetos, leads, R$..." />
        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="em_andamento">Em andamento</option>
          <option value="atingida">Atingida</option>
          <option value="atrasada">Atrasada</option>
        </Select>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {inicial ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

export function Metas() {
  const { metasPorFuncionario, funcionarios, mesReferencia, setMesReferencia, totalMetas, metasAtingidas, loading, addFuncionario, updateFuncionario, deleteFuncionario, addMeta, updateMeta, deleteMeta } = useMetas()
  const toast = useToast()
  const [modalFunc, setModalFunc] = useState(false)
  const [modalMeta, setModalMeta] = useState(false)
  const [editFunc, setEditFunc] = useState(null)
  const [editMeta, setEditMeta] = useState(null)
  const [deletandoFunc, setDeletandoFunc] = useState(null)
  const [deletandoMeta, setDeletandoMeta] = useState(null)

  const mesDate = parseISO(mesReferencia)

  function navegarMes(dir) {
    const novoMes = dir === 'prev' ? subMonths(mesDate, 1) : addMonths(mesDate, 1)
    setMesReferencia(format(novoMes, 'yyyy-MM') + '-01')
  }

  async function handleFunc(data) {
    try {
      if (editFunc) { await updateFuncionario(editFunc.id, data); toast.addToast('Funcionário atualizado!') }
      else { await addFuncionario(data); toast.addToast('Funcionário adicionado!') }
      setModalFunc(false); setEditFunc(null)
    } catch { toast.addToast('Erro ao salvar.', 'error') }
  }

  async function handleMeta(data) {
    try {
      if (editMeta) { await updateMeta(editMeta.id, data); toast.addToast('Meta atualizada!') }
      else { await addMeta(data); toast.addToast('Meta adicionada!') }
      setModalMeta(false); setEditMeta(null)
    } catch { toast.addToast('Erro ao salvar.', 'error') }
  }

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <p className="label-caps mb-1">Equipe</p>
        <h1 className="font-display font-extrabold italic text-white uppercase" style={{ fontSize: '2.5rem', lineHeight: '0.95' }}>
          METAS
        </h1>
      </div>

      {/* KPIs */}
      <div className="card divide-y divide-border md:divide-y-0 md:divide-x md:grid md:grid-cols-3">
        <StatCard label="Funcionários Ativos" value={funcionarios.length} icon={Target} />
        <StatCard label="Metas Atingidas" value={metasAtingidas} icon={Target} iconColor="text-success" />
        <StatCard label="Total de Metas" value={totalMetas} icon={Target} iconColor="text-brand" />
      </div>

      {/* Month nav + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => navegarMes('prev')} className="p-1.5 rounded-lg hover:bg-surface2 text-ink-muted hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="label-caps text-white w-36 text-center">
            {format(mesDate, 'MMMM yyyy', { locale: ptBR }).toUpperCase()}
          </span>
          <button onClick={() => navegarMes('next')} className="p-1.5 rounded-lg hover:bg-surface2 text-ink-muted hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setEditFunc(null); setModalFunc(true) }}><UserPlus size={14} />Funcionário</Button>
          <Button onClick={() => { setEditMeta(null); setModalMeta(true) }}><Plus size={14} />Nova Meta</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-brand" /></div>
      ) : metasPorFuncionario.length === 0 ? (
        <EmptyState icon={Target} title="Nenhum funcionário" description="Adicione funcionários e defina suas metas mensais." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metasPorFuncionario.map(func => (
            <div key={func.id} className="card p-5">
              {/* Employee header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-black font-black text-xs tracking-tighter">
                    {func.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{func.nome}</p>
                    <p className="label-caps">{func.cargo}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditFunc(func); setModalFunc(true) }}><Pencil size={12} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletandoFunc(func.id)}><Trash2 size={12} className="text-danger" /></Button>
                </div>
              </div>

              {func.metas.length === 0 ? (
                <p className="text-ink-muted text-xs text-center py-3">Sem metas neste mês.</p>
              ) : (
                <div className="space-y-4">
                  {func.metas.map(meta => {
                    const pct = meta.valor_alvo > 0 ? (meta.valor_atual / meta.valor_alvo) * 100 : 0
                    return (
                      <div key={meta.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-bold truncate">{meta.titulo}</p>
                            <p className="text-ink-muted text-xs">{meta.valor_atual} / {meta.valor_alvo} {meta.unidade}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Badge status={meta.status} />
                            <Button variant="ghost" size="icon" onClick={() => { setEditMeta(meta); setModalMeta(true) }}><Pencil size={11} /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletandoMeta(meta.id)}><Trash2 size={11} className="text-danger" /></Button>
                          </div>
                        </div>
                        <ProgressBar value={pct} status={meta.status} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalFunc} onClose={() => { setModalFunc(false); setEditFunc(null) }} title={editFunc ? 'Editar Funcionário' : 'Novo Funcionário'}>
        <FuncionarioForm inicial={editFunc} onSubmit={handleFunc} onCancel={() => { setModalFunc(false); setEditFunc(null) }} />
      </Modal>

      <Modal isOpen={modalMeta} onClose={() => { setModalMeta(false); setEditMeta(null) }} title={editMeta ? 'Editar Meta' : 'Nova Meta'}>
        <MetaForm funcionarios={funcionarios} inicial={editMeta} onSubmit={handleMeta} onCancel={() => { setModalMeta(false); setEditMeta(null) }} />
      </Modal>

      <ConfirmModal isOpen={!!deletandoFunc} onClose={() => setDeletandoFunc(null)} onConfirm={() => { deleteFuncionario(deletandoFunc); toast.addToast('Funcionário removido.', 'warning') }} message="Remover este funcionário?" />
      <ConfirmModal isOpen={!!deletandoMeta} onClose={() => setDeletandoMeta(null)} onConfirm={() => { deleteMeta(deletandoMeta); toast.addToast('Meta excluída.', 'warning') }} message="Excluir esta meta?" />
    </div>
  )
}
