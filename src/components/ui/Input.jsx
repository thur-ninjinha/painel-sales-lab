export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</label>}
      <input
        className={`bg-surface2 border ${error ? 'border-danger' : 'border-border'} rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-brand transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</label>}
      <select
        className={`bg-surface2 border ${error ? 'border-danger' : 'border-border'} rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</label>}
      <textarea
        rows={3}
        className={`bg-surface2 border ${error ? 'border-danger' : 'border-border'} rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-brand transition-colors resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  )
}
