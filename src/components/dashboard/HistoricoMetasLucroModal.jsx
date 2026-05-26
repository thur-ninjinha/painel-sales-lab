import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { formatarMoeda, formatarDataCurta } from '../../lib/formatters'

function renderBadge(status) {
  if (status === 'concluida') return <Badge status="atingida" label="Concluída" />
  if (status === 'expirada') return <Badge status="atrasada" label="Expirada" />
  return <span className="label-caps text-ink-muted">Arquivada</span>
}

export function HistoricoMetasLucroModal({ isOpen, onClose, metas }) {
  const arquivadas = metas
    .filter(m => m.status !== 'ativa')
    .sort((a, b) => (a.data_limite < b.data_limite ? 1 : -1))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Histórico de metas de lucro" maxWidth="max-w-2xl">
      {arquivadas.length === 0 ? (
        <p className="text-ink-muted text-sm py-6 text-center">
          Nenhuma meta arquivada ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {arquivadas.map(m => (
            <div key={m.id} className="border border-border rounded-lg p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  {m.titulo ?? 'Sem título'}
                </p>
                <p className="text-ink-muted text-xs mt-0.5">
                  {formatarDataCurta(m.data_inicio)} → {formatarDataCurta(m.data_limite)}
                </p>
                <p className="text-ink-muted text-xs mt-1">
                  {formatarMoeda(m.lucroAtual)} de {formatarMoeda(m.valor_alvo)}
                </p>
              </div>
              {renderBadge(m.status)}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
