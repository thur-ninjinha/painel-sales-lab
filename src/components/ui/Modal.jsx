import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative card shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <p className="label-caps text-white">{title}</p>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-surface2">
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirmar exclusão', message = 'Tem certeza? Esta ação não pode ser desfeita.' }) {
  if (!isOpen) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-ink-muted text-sm mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-ink-muted hover:text-ink transition-colors">
          Cancelar
        </button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-danger text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Excluir
        </button>
      </div>
    </Modal>
  )
}
