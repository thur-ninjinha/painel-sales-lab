import { useEffect, useRef, useState } from 'react'
import { Menu, Search, Bell, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useActivity } from '../../hooks/useActivity'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ENTITY_LABELS = {
  transacao: 'Transação',
  lead: 'Lead',
  campanha: 'Campanha',
  meta: 'Meta',
  funcionario: 'Funcionário',
}

const ACTION_COLORS = {
  criou:     'text-success',
  adicionou: 'text-success',
  editou:    'text-warning',
  moveu:     'text-brand',
  excluiu:   'text-danger',
  removeu:   'text-danger',
}

function ActivityItem({ item }) {
  const color = ACTION_COLORS[item.action] ?? 'text-ink-muted'
  const entity = ENTITY_LABELS[item.entity_type] ?? item.entity_type
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface2 transition-colors">
      <span className={`label-caps ${color} flex-shrink-0 mt-0.5`}>{item.action}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">
          {entity}{item.entity_name ? `: ${item.entity_name}` : ''}
        </p>
        {item.meta?.para && (
          <p className="text-ink-muted text-xs">→ {item.meta.para}</p>
        )}
        <p className="text-ink-muted text-xs mt-0.5">{timeAgo}</p>
      </div>
    </div>
  )
}

export function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Usuário'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const initials = name.slice(0, 2).toUpperCase()

  const { activities, loading } = useActivity(15)
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(() => {
    return Number(localStorage.getItem('notifications_last_seen') ?? 0)
  })
  const dropdownRef = useRef(null)

  const unread = activities.filter(a => new Date(a.created_at).getTime() > lastSeen).length

  function openNotifications() {
    setOpen(prev => !prev)
    if (!open) {
      const now = Date.now()
      setLastSeen(now)
      localStorage.setItem('notifications_last_seen', String(now))
    }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center gap-4 px-5 flex-shrink-0">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden text-ink-muted hover:text-ink p-1">
        <Menu size={18} />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-xl">
        <div className="flex items-center gap-2.5 bg-surface2 border border-border rounded-lg px-3.5 py-2">
          <Search size={14} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search analytics..."
            className="bg-transparent text-sm text-ink-muted placeholder-ink-muted focus:outline-none focus:text-ink w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">

        {/* Notifications bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={openNotifications}
            className="relative p-1.5 text-ink-muted hover:text-ink transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-danger rounded-full flex items-center justify-center">
                <span className="text-white font-black" style={{ fontSize: '9px' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 card shadow-2xl z-50 overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="label-caps text-white">Atividade Recente</p>
                {activities.length > 0 && (
                  <span className="label-caps">{activities.length} registros</span>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                {loading ? (
                  <div className="py-8 text-center">
                    <p className="label-caps">Carregando...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="label-caps">Nenhuma atividade ainda</p>
                  </div>
                ) : (
                  activities.map(a => <ActivityItem key={a.id} item={a} />)
                )}
              </div>
            </div>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white font-semibold text-sm leading-none">{displayName}</p>
            <p className="label-caps mt-0.5">Sales Director</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold ring-2 ring-border">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
