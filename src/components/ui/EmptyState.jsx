export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-xl bg-surface2 border border-border flex items-center justify-center mb-5">
          <Icon size={22} className="text-ink-muted" />
        </div>
      )}
      <p className="label-caps mb-1">{title}</p>
      {description && <p className="text-ink-muted text-xs max-w-xs mt-1">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
