export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button' }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-1 focus:ring-offset-bg disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-lg',
    secondary: 'bg-surface3 hover:bg-border text-text-primary border border-border',
    danger:    'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30',
    ghost:     'hover:bg-surface3 text-text-secondary hover:text-text-primary',
  }

  const sizes = {
    sm:   'px-3 py-1.5 text-xs',
    md:   'px-4 py-2 text-sm',
    lg:   'px-5 py-2.5 text-sm',
    icon: 'p-2',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
