import { Menu, Search, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Usuário'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center gap-4 px-5 flex-shrink-0">
      {/* Menu mobile */}
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
        {/* Bell */}
        <button className="relative p-1.5 text-ink-muted hover:text-ink transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-danger rounded-full" />
        </button>

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
