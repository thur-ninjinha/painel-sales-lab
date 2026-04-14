import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ label, value, icon: Icon, delta, deltaLabel, iconColor = 'text-white', iconBg = 'bg-surface3' }) {
  const positivo = delta === undefined || delta === null ? null : delta >= 0
  const pctText = deltaLabel ?? (delta !== undefined && delta !== null ? `${delta >= 0 ? '+' : ''}${delta}%` : null)

  return (
    <div className="py-6 px-1 border-b border-border last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-start justify-between gap-2 mb-4">
        {/* Icon */}
        <div className={`p-2.5 rounded-lg ${iconBg} border border-border`}>
          {Icon && <Icon size={16} className={iconColor} />}
        </div>
        {/* Delta */}
        {pctText && (
          <span className={positivo ? 'delta-up' : 'delta-down'}>
            {positivo ? '↗' : '↘'} {pctText}
          </span>
        )}
      </div>
      <p className="label-caps mb-2">{label}</p>
      <p className="font-display text-white font-extrabold italic text-4xl sm:text-5xl leading-none tracking-tight">
        {value}
      </p>
    </div>
  )
}
