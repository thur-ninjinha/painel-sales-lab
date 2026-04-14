import { TrendingUp, TrendingDown } from 'lucide-react'

const ICON_GRADIENTS = {
  'text-brand': 'bg-gradient-brand',
  'text-success': 'bg-gradient-success',
  'text-warning': 'bg-gradient-warning',
  'text-danger': 'bg-gradient-danger',
}

export function StatCard({ label, value, icon: Icon, delta, deltaLabel, iconColor = 'text-brand', iconBg = 'bg-brand/10' }) {
  const positivo = delta > 0
  const neutro = delta === 0 || delta === undefined || delta === null

  const gradientClass = ICON_GRADIENTS[iconColor]

  return (
    <div className="relative bg-surface rounded-xl border border-border/70 p-4 sm:p-5 flex items-start gap-3.5 shadow-card overflow-hidden transition-all duration-200 hover:border-brand/25 hover:shadow-glow-brand-sm group">
      {/* Accent line no topo */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

      {Icon && (
        <div className={`p-2.5 rounded-xl ${gradientClass || iconBg} flex-shrink-0 shadow-card`}>
          <Icon size={17} className="text-white" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-text-secondary text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">{label}</p>
        <p className="text-text-primary text-xl sm:text-2xl font-bold mt-1 truncate tracking-tight">{value}</p>
        {!neutro && (
          <p className={`flex items-center gap-1 text-xs mt-1.5 font-medium ${positivo ? 'text-success' : 'text-danger'}`}>
            {positivo ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {deltaLabel ?? `${positivo ? '+' : ''}${delta}`}
          </p>
        )}
      </div>
    </div>
  )
}
