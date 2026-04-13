import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, Target, Megaphone, Users, X } from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/caixa', icon: Wallet, label: 'Caixa' },
  { to: '/metas', icon: Target, label: 'Metas' },
  { to: '/trafego', icon: Megaphone, label: 'Tráfego Pago' },
  { to: '/leads', icon: Users, label: 'Leads' },
]

export function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-surface border-r border-border z-30 flex flex-col
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-sm">SL</div>
            <div>
              <p className="text-text-primary font-bold text-sm leading-none">Sales Lab</p>
              <p className="text-text-secondary text-xs mt-0.5">Painel Interno</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-text-primary p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-brand/10 text-brand border border-brand/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-text-secondary text-xs">© 2026 Sales Lab Studio</p>
        </div>
      </aside>
    </>
  )
}
