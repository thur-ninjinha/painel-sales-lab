import { useState } from 'react'
import { useMetaLucro } from '../../hooks/useMetaLucro'
import { useToast } from '../ui/Toast'
import { Button } from '../ui/Button'
import { Modal, ConfirmModal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { MetaLucroCard } from './MetaLucroCard'
import { MetaLucroForm } from './MetaLucroForm'
import { HistoricoMetasLucroModal } from './HistoricoMetasLucroModal'
import { Plus, Target, Loader2, History } from 'lucide-react'

/**
 * @param {Array} transacoes - transactions from useCaixa (passed by parent to avoid double-fetch)
 */
export function MetasLucroSection({ transacoes }) {
  const { metas, loading, addMeta, updateMeta, archiveMeta, removeMeta } = useMetaLucro(transacoes)
  const toast = useToast()
  const [modalForm, setModalForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [arquivando, setArquivando] = useState(null)
  const [removendo, setRemovendo] = useState(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)

  const ativas = metas.filter(m => m.status === 'ativa')
  const temArquivadas = metas.some(m => m.status !== 'ativa')

  async function handleSubmit(data) {
    try {
      if (editando) {
        await updateMeta(editando.id, data)
        toast.addToast('Meta atualizada.')
      } else {
        await addMeta(data)
        toast.addToast('Meta criada.')
      }
      setModalForm(false)
      setEditando(null)
    } catch {
      toast.addToast('Erro ao salvar.', 'error')
    }
  }

  async function confirmArchive() {
    if (!arquivando) return
    try {
      await archiveMeta(arquivando.id)
      toast.addToast('Meta arquivada.', 'warning')
    } catch {
      toast.addToast('Erro ao arquivar.', 'error')
    } finally {
      setArquivando(null)
    }
  }

  async function confirmRemove() {
    if (!removendo) return
    try {
      await removeMeta(removendo.id)
      toast.addToast('Meta excluída.', 'warning')
    } catch {
      toast.addToast('Erro ao excluir.', 'error')
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-caps mb-1">Resultado</p>
          <h2 className="font-display font-extrabold italic text-white uppercase text-xl sm:text-2xl leading-none">
            METAS DE LUCRO
          </h2>
        </div>
        <div className="flex gap-2">
          {temArquivadas && (
            <Button variant="secondary" onClick={() => setHistoricoAberto(true)}>
              <History size={14} /> Histórico
            </Button>
          )}
          <Button onClick={() => { setEditando(null); setModalForm(true) }}>
            <Plus size={14} /> Nova meta
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={20} className="animate-spin text-brand" />
        </div>
      ) : ativas.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta ativa"
          description="Defina um valor alvo e uma data limite para acompanhar seu lucro."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ativas.map(meta => (
            <MetaLucroCard
              key={meta.id}
              meta={meta}
              onEdit={(m) => { setEditando(m); setModalForm(true) }}
              onArchive={(m) => setArquivando(m)}
              onRemove={(m) => setRemovendo(m)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalForm}
        onClose={() => { setModalForm(false); setEditando(null) }}
        title={editando ? 'Editar meta de lucro' : 'Nova meta de lucro'}
      >
        <MetaLucroForm
          inicial={editando}
          onSubmit={handleSubmit}
          onCancel={() => { setModalForm(false); setEditando(null) }}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!arquivando}
        onClose={() => setArquivando(null)}
        onConfirm={confirmArchive}
        title="Arquivar meta"
        message={`Arquivar "${arquivando?.titulo ?? 'esta meta'}"? Ela some do Dashboard mas continua no histórico.`}
      />

      <ConfirmModal
        isOpen={!!removendo}
        onClose={() => setRemovendo(null)}
        onConfirm={confirmRemove}
        title="Excluir meta"
        message={`Excluir "${removendo?.titulo ?? 'esta meta'}" permanentemente? Esta ação não pode ser desfeita.`}
      />

      <HistoricoMetasLucroModal
        isOpen={historicoAberto}
        onClose={() => setHistoricoAberto(false)}
        metas={metas}
      />
    </section>
  )
}
