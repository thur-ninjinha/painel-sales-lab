export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-xl border border-border p-5 ${className}`}>
      {children}
    </div>
  )
}
