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
      {open && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-60 z-30 flex flex-col
        bg-surface border-r border-border
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">SL</span>
            </div>
            <span className="text-text-primary font-semibold text-sm tracking-tight">Sales Lab</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-text-primary p-1 rounded">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-text-muted text-xs">© 2026 Sales Lab Studio</p>
        </div>
      </aside>
    </>
  )
}
