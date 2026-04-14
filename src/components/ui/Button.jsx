export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button' }) {
  const base = 'inline-flex items-center gap-2 font-bold uppercase tracking-widest transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-white text-black hover:bg-ink-soft border border-white',
    secondary: 'bg-transparent text-ink border border-border hover:border-border-light hover:text-ink',
    danger:    'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
    ghost:     'text-ink-muted hover:text-ink hover:bg-surface2',
  }

  const sizes = {
    sm:   'px-3 py-1.5 text-[10px] rounded-md',
    md:   'px-4 py-2 text-[10px] rounded-lg',
    lg:   'px-5 py-2.5 text-xs rounded-lg',
    icon: 'p-2 rounded-lg text-sm',
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
