import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ label, value, icon: Icon, delta, deltaLabel, iconColor = 'text-brand', iconBg = 'bg-brand/10' }) {
  const positivo = delta > 0
  const neutro = delta === 0 || delta === undefined || delta === null

  return (
    <div className="bg-surface rounded-xl border border-border p-3 sm:p-4 flex items-start gap-3">
      {Icon && (
        <div className={`p-2 rounded-lg ${iconBg} flex-shrink-0`}>
          <Icon size={18} className={iconColor} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-text-secondary text-[10px] sm:text-xs font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-text-primary text-lg sm:text-2xl font-bold mt-0.5 truncate">{value}</p>
        {!neutro && (
          <p className={`flex items-center gap-1 text-xs mt-1 ${positivo ? 'text-success' : 'text-danger'}`}>
            {positivo ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {deltaLabel ?? `${positivo ? '+' : ''}${delta}`}
          </p>
        )}
      </div>
    </div>
  )
}
