import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, Target, Megaphone, Users, Settings, LogOut, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_MAIN = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/caixa',   icon: Wallet,          label: 'Caixa' },
  { to: '/metas',   icon: Target,          label: 'Metas' },
  { to: '/trafego', icon: Megaphone,       label: 'Tráfego Pago' },
  { to: '/leads',   icon: Users,           label: 'Leads' },
]

export function Sidebar({ open, onClose }) {
  const { signOut } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/80 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-[260px] z-30 flex flex-col
        bg-surface border-r border-border
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-sm tracking-tight">SL</span>
            </div>
            <span className="font-display text-white font-bold text-lg tracking-widest uppercase italic">
              Sales Lab
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-ink-muted hover:text-ink p-1 rounded">
            <X size={16} />
          </button>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="label-caps px-3 mb-3">Main Menu</p>
          {NAV_MAIN.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 pb-4 border-t border-border pt-3 space-y-0.5">
          <button className="nav-item w-full">
            <Settings size={16} className="flex-shrink-0" />
            Configurações
          </button>
          <button onClick={signOut} className="nav-item w-full">
            <LogOut size={16} className="flex-shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
