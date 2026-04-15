export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label-caps">{label}</label>}
      <input
        className={`bg-surface2 border ${error ? 'border-danger' : 'border-border'} rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ink-muted focus:outline-none focus:border-border-light transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs font-medium">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label-caps">{label}</label>}
      <select
        className={`bg-surface2 border ${error ? 'border-danger' : 'border-border'} rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-border-light transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-danger text-xs font-medium">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label-caps">{label}</label>}
      <textarea
        rows={3}
        className={`bg-surface2 border ${error ? 'border-danger' : 'border-border'} rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ink-muted focus:outline-none focus:border-border-light transition-colors resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs font-medium">{error}</p>}
    </div>
  )
}
