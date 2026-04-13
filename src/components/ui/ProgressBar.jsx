export function ProgressBar({ value, label, status, showPercent = true }) {
  const clamped = Math.min(100, Math.max(0, value ?? 0))

  const colorMap = {
    atingida: 'bg-success',
    em_andamento: 'bg-brand',
    atrasada: 'bg-danger',
  }
  const barColor = colorMap[status] ?? 'bg-brand'

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-text-secondary truncate">{label}</span>}
          {showPercent && <span className="text-xs text-text-primary font-medium ml-2 flex-shrink-0">{clamped.toFixed(0)}%</span>}
        </div>
      )}
      <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
