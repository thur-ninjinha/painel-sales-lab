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
    <header className="h-14 glass border-b border-white/[0.06] flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-10 shadow-card">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface2 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-text-primary font-semibold text-base tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-glow-brand-sm ring-2 ring-brand/20">
          {initials}
        </div>
        <button
          onClick={signOut}
          className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all duration-200"
          title="Sair"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
