import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'Dashboard',
  '/caixa': 'Caixa',
  '/metas': 'Metas de Funcionários',
  '/trafego': 'Tráfego Pago',
  '/leads': 'Leads & Clientes',
}

export function Topbar({ onMenuClick }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const title = TITLES[location.pathname] ?? 'Painel'

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'SL'

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface2 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-text-primary font-semibold text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand text-xs font-bold">
          {initials}
        </div>
        <button
          onClick={signOut}
          className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
