import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from '@dnd-kit/core'
import { useLeads, ESTAGIOS } from '../hooks/useLeads'
import { useToast } from '../components/ui/Toast'
import { StatCard } from '../components/ui/StatCard'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Users, Plus, Pencil, Trash2, Loader2, UserCheck, UserX, MessageSquare, GripVertical } from 'lucide-react'
import { formatarMoeda, formatarDataCurta } from '../lib/formatters'

const ORIGENS = ['Instagram', 'Indicação', 'Google', 'Site', 'LinkedIn', 'WhatsApp', 'Outro']

/* ─── Lead Form ─────────────────────────────────────────────────── */
function LeadForm({ inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nome: '', empresa: '', email: '', telefone: '', origem: '', estagio: 'lead',
    valor_estimado: '', notas: '', data_entrada: new Date().toISOString().split('T')[0],
    ...inicial,
  })
  const [loading, setLoading] = useState(false)
  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ ...form, valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : null })
    } finally { setLoading(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome" value={form.nome} onChange={e => set('nome', e.target.value)} required placeholder="Nome do lead" />
        <Input label="Empresa" value={form.empresa} onChange={e => set('empresa', e.target.value)} placeholder="Empresa (opcional)" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email (opcional)" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" />
        <Input label="Telefone" value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 99999-9999" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Origem" value={form.origem} onChange={e => set('origem', e.target.value)}>
          <option value="">Selecionar...</option>
          {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
        </Select>
        <Select label="Estágio" value={form.estagio} onChange={e => set('estagio', e.target.value)}>
          {ESTAGIOS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Valor estimado (R$)" type="number" step="0.01" value={form.valor_estimado} onChange={e => set('valor_estimado', e.target.value)} placeholder="0,00" />
        <Input label="Data de entrada" type="date" value={form.data_entrada} onChange={e => set('data_entrada', e.target.value)} />
      </div>
      <Textarea label="Notas" value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observações sobre o lead..." />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {inicial ? 'Salvar' : 'Adicionar Lead'}
        </Button>
      </div>
    </form>
  )
}

/* ─── Draggable Lead Card ────────────────────────────────────────── */
function DraggableLeadCard({ lead, onEdit, onDelete, onMove, isDragOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-surface2 border rounded-lg p-3 space-y-2 transition-all ${
        isDragging
          ? 'opacity-40 border-brand scale-95'
          : isDragOverlay
          ? 'border-brand shadow-2xl rotate-1 scale-105'
          : 'border-border hover:border-border-light'
      }`}
    >
      {/* Header row: grip + name + actions */}
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...listeners}
          {...attributes}
          className="text-ink-muted hover:text-white mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate">{lead.nome}</p>
          {lead.empresa && <p className="text-ink-muted text-xs truncate">{lead.empresa}</p>}
        </div>

        <div className="flex gap-0.5 flex-shrink-0">
          <button onClick={() => onEdit(lead)} className="p-1 text-ink-muted hover:text-white rounded transition-colors"><Pencil size={11} /></button>
          <button onClick={() => onDelete(lead.id)} className="p-1 text-ink-muted hover:text-danger rounded transition-colors"><Trash2 size={11} /></button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {lead.origem && <span className="label-caps bg-surface border border-border rounded px-1.5 py-0.5">{lead.origem}</span>}
        {lead.valor_estimado && <span className="text-brand text-xs font-bold">{formatarMoeda(lead.valor_estimado)}</span>}
      </div>

      {lead.notas && <p className="text-ink-muted text-xs line-clamp-2">{lead.notas}</p>}
      <p className="text-ink-muted text-xs">{formatarDataCurta(lead.data_entrada)}</p>

      {/* Quick move buttons (hidden in overlay) */}
      {!isDragOverlay && (
        <div className="flex gap-1 pt-1 border-t border-border/40">
          {ESTAGIOS.filter(e => e.key !== lead.estagio && e.key !== 'perdido').slice(0, 2).map(e => (
            <button key={e.key} onClick={() => onMove(lead.id, e.key)}
              className="label-caps hover:text-white border border-border hover:border-border-light rounded px-2 py-0.5 transition-colors truncate">
              → {e.label}
            </button>
          ))}
          {lead.estagio !== 'perdido' && (
            <button onClick={() => onMove(lead.id, 'perdido')}
              className="label-caps text-danger/60 hover:text-danger border border-border/40 hover:border-danger/30 rounded px-2 py-0.5 transition-colors ml-auto">
              Perdido
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Droppable Kanban Column ────────────────────────────────────── */
function KanbanColumn({ estagio, leads, onEdit, onDelete, onMove, isOver }) {
  const { setNodeRef } = useDroppable({ id: estagio.key })

  return (
    <div
      ref={setNodeRef}
      className={`card overflow-hidden flex-shrink-0 w-64 sm:w-auto transition-colors ${
        isOver ? 'border-brand bg-brand/5' : ''
      }`}
    >
      <div className="px-3 py-3 border-b border-border flex items-center justify-between">
        <Badge status={estagio.key} />
        <span className="label-caps">{leads.length}</span>
      </div>
      <div className="p-2 space-y-2 min-h-[120px]">
        {leads.map(lead => (
          <DraggableLeadCard
            key={lead.id}
            lead={lead}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
        {leads.length === 0 && (
          <div className={`flex items-center justify-center min-h-[80px] rounded-lg border-2 border-dashed transition-colors ${
            isOver ? 'border-brand/50' : 'border-border/30'
          }`}>
            <p className="label-caps">{isOver ? 'Soltar aqui' : 'Vazio'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export function Leads() {
  const { leads, pipeline, totalLeads, emNegociacao, clientes, perdidos, loading, addLead, updateLead, deleteLead, moveEstagio } = useLeads()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletandoId, setDeletandoId] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  function handleDragStart({ active }) {
    setActiveId(active.id)
  }

  function handleDragOver({ over }) {
    setOverId(over?.id ?? null)
  }

  async function handleDragEnd({ active, over }) {
    setActiveId(null)
    setOverId(null)
    if (!over) return

    const lead = leads.find(l => l.id === active.id)
    const targetColumn = ESTAGIOS.find(e => e.key === over.id)
    if (!lead || !targetColumn || lead.estagio === targetColumn.key) return

    try {
      await moveEstagio(lead.id, targetColumn.key)
      toast.addToast(`"${lead.nome}" movido para ${targetColumn.label}`)
    } catch {
      toast.addToast('Erro ao mover lead.', 'error')
    }
  }

  async function handleSubmit(data) {
    try {
      if (editando) { await updateLead(editando.id, data); toast.addToast('Lead atualizado!') }
      else { await addLead(data); toast.addToast('Lead adicionado!') }
      setModalOpen(false); setEditando(null)
    } catch { toast.addToast('Erro ao salvar lead.', 'error') }
  }

  async function handleMove(id, estagio) {
    try {
      await moveEstagio(id, estagio)
      toast.addToast(`Lead movido para "${ESTAGIOS.find(e => e.key === estagio)?.label}"`)
    } catch { toast.addToast('Erro ao mover lead.', 'error') }
  }

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <p className="label-caps mb-1">Pipeline</p>
        <h1 className="font-display font-extrabold italic text-white uppercase" style={{ fontSize: '2.5rem', lineHeight: '0.95' }}>
          LEADS
        </h1>
      </div>

      {/* KPIs */}
      <div className="card divide-y divide-border sm:divide-y-0 sm:divide-x sm:grid sm:grid-cols-4">
        <StatCard label="Total de Leads" value={totalLeads} icon={Users} />
        <StatCard label="Em Negociação" value={emNegociacao} icon={MessageSquare} iconColor="text-warning" />
        <StatCard label="Clientes" value={clientes} icon={UserCheck} iconColor="text-success" />
        <StatCard label="Perdidos" value={perdidos} icon={UserX} iconColor="text-danger" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="label-caps">Pipeline de Leads</p>
        <Button onClick={() => { setEditando(null); setModalOpen(true) }}><Plus size={14} />Novo Lead</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-brand" /></div>
      ) : leads.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum lead ainda" description="Comece adicionando seu primeiro lead." action={<Button onClick={() => setModalOpen(true)}><Plus size={14} />Adicionar Lead</Button>} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-start">
            {ESTAGIOS.map(estagio => (
              <KanbanColumn
                key={estagio.key}
                estagio={estagio}
                leads={pipeline[estagio.key] ?? []}
                isOver={overId === estagio.key}
                onEdit={l => { setEditando(l); setModalOpen(true) }}
                onDelete={id => setDeletandoId(id)}
                onMove={handleMove}
              />
            ))}
          </div>

          {/* Drag overlay — ghost card that follows cursor */}
          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeLead && (
              <DraggableLeadCard
                lead={activeLead}
                onEdit={() => {}}
                onDelete={() => {}}
                onMove={() => {}}
                isDragOverlay
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditando(null) }} title={editando ? 'Editar Lead' : 'Novo Lead'} maxWidth="max-w-xl">
        <LeadForm inicial={editando} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditando(null) }} />
      </Modal>

      <ConfirmModal isOpen={!!deletandoId} onClose={() => setDeletandoId(null)} onConfirm={() => { deleteLead(deletandoId); toast.addToast('Lead excluído.', 'warning') }} message="Excluir este lead?" />
    </div>
  )
}
