import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, Target, Megaphone, Users, X, Sparkles } from 'lucide-react'

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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden animate-fade-in" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-surface border-r border-border/60 z-30 flex flex-col
        transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Gradiente decorativo no topo */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-brand-subtle pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center justify-between px-5 py-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-glow-brand-sm flex-shrink-0">
              SL
            </div>
            <div>
              <p className="text-text-primary font-bold text-sm leading-none tracking-tight">Sales Lab</p>
              <p className="text-text-secondary text-[10px] mt-0.5 font-medium">Painel Interno</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-text-primary p-1.5 hover:bg-surface2 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-text-secondary text-[10px] uppercase tracking-widest font-semibold px-3 mb-2 mt-1">Menu</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-brand/12 text-brand border-l-2 border-brand pl-[10px] shadow-glow-brand-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface2/80 border-l-2 border-transparent pl-[10px]'
                }
              `}
            >
              <Icon size={17} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Sparkles size={11} className="text-brand/60" />
            <p className="text-text-secondary text-[10px] font-medium">Sales Lab Studio · 2026</p>
          </div>
        </div>
      </aside>
    </>
  )
}
