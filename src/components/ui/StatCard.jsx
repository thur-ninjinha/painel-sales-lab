import { TrendingUp, TrendingDown } from 'lucide-react'

const ICON_STYLES = {
  'text-brand':   { bg: 'bg-brand',         text: 'text-white' },
  'text-success': { bg: 'bg-success',       text: 'text-white' },
  'text-warning': { bg: 'bg-warning',       text: 'text-white' },
  'text-danger':  { bg: 'bg-danger',        text: 'text-white' },
}

export function StatCard({ label, value, icon: Icon, delta, deltaLabel, iconColor = 'text-brand', iconBg }) {
  const positivo = delta > 0
  const neutro = delta === 0 || delta === undefined || delta === null
  const style = ICON_STYLES[iconColor] ?? { bg: 'bg-brand', text: 'text-white' }

  return (
    <div className="card-interactive p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-text-secondary text-xs font-medium uppercase tracking-widest truncate mb-3">{label}</p>
          <p className="text-text-primary text-2xl sm:text-3xl font-bold tracking-tight truncate">{value}</p>
          {!neutro && (
            <p className={`flex items-center gap-1 text-xs mt-2 font-medium ${positivo ? 'text-success' : 'text-danger'}`}>
              {positivo ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {deltaLabel ?? `${positivo ? '+' : ''}${delta}`}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${style.bg} flex-shrink-0 shadow-md`}>
            <Icon size={18} className={style.text} />
          </div>
        )}
      </div>
    </div>
  )
}
