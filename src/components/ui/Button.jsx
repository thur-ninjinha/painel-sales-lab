export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button' }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-brand hover:bg-brand-hover text-white',
    secondary: 'bg-surface2 hover:bg-border text-text-primary border border-border',
    danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30',
    ghost: 'hover:bg-surface2 text-text-secondary hover:text-text-primary',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    icon: 'p-2 text-sm',
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
