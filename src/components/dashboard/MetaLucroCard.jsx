import { useState, useRef, useEffect } from 'react'
import { ProgressBar } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'
import { MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react'
import { formatarMoeda, formatarDataCurta } from '../../lib/formatters'

export function MetaLucroCard({ meta, onEdit, onArchive, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const progressoStatus =
    meta.status === 'concluida' || meta.atingida ? 'atingida' :
    meta.status === 'expirada' ? 'atrasada' :
    'em_andamento'

  return (
    <div className="card p-5 relative">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="label-caps mb-1">Meta de lucro</p>
          <p className="text-white font-bold text-sm truncate">
            {meta.titulo ?? 'Sem título'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {meta.atingida && meta.status === 'ativa' && (
            <Badge status="atingida" />
          )}
          {meta.status === 'concluida' && <Badge status="atingida" label="Concluída" />}
          {meta.status === 'expirada' && <Badge status="atrasada" label="Expirada" />}
          {meta.status === 'arquivada' && (
            <span className="label-caps text-ink-muted">Arquivada</span>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              className="p-1.5 rounded-lg hover:bg-surface2 text-ink-muted hover:text-white transition-colors"
              aria-label="Ações"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 w-40 bg-surface2 border border-border rounded-lg shadow-xl py-1">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(meta) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-surface3 text-left"
                >
                  <Pencil size={12} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onArchive(meta) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-surface3 text-left disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={meta.status !== 'ativa'}
                >
                  <Archive size={12} /> Arquivar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onRemove(meta) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-surface3 text-left"
                >
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-2">
        <p className="font-display font-extrabold italic text-white text-2xl leading-none">
          {formatarMoeda(meta.lucroAtual)}
        </p>
        <p className="text-ink-muted text-xs font-semibold">
          de {formatarMoeda(meta.valor_alvo)}
        </p>
      </div>

      <ProgressBar value={meta.progressoPct} status={progressoStatus} showPercent />

      <div className="flex items-center justify-between mt-4 text-xs">
        <p className="text-ink-muted">
          {meta.status === 'ativa'
            ? `${meta.diasRestantes} ${meta.diasRestantes === 1 ? 'dia' : 'dias'} restantes`
            : `Até ${formatarDataCurta(meta.data_limite)}`}
        </p>
        {meta.status === 'ativa' && !meta.atingida && meta.diasRestantes > 0 && (
          <p className="text-white font-semibold">
            {formatarMoeda(meta.ritmoNecessario)}/dia
          </p>
        )}
      </div>
    </div>
  )
}
