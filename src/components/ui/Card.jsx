export function Card({ children, className = '', glow = false }) {
  return (
    <div className={`
      bg-surface rounded-xl border border-border/70 p-5 shadow-card
      transition-all duration-200 hover:border-border
      ${glow ? 'shadow-glow-brand-sm hover:shadow-glow-brand' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
