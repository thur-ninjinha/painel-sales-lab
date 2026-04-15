import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle size={14} className="text-success flex-shrink-0" />,
    error:   <XCircle size={14} className="text-danger flex-shrink-0" />,
    warning: <AlertCircle size={14} className="text-warning flex-shrink-0" />,
  }
  const borders = {
    success: 'border-success/30',
    error:   'border-danger/30',
    warning: 'border-warning/30',
  }

  return (
    <div className={`flex items-start gap-3 card border ${borders[type] ?? 'border-border'} p-4 shadow-2xl pointer-events-auto animate-fade-in`}>
      {icons[type]}
      <p className="text-white text-xs font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors flex-shrink-0">
        <X size={13} />
      </button>
    </div>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
