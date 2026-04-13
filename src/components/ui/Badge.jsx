const BADGE_MAP = {
  receita: { label: 'Receita', cls: 'bg-success/10 text-success border-success/20' },
  despesa: { label: 'Despesa', cls: 'bg-danger/10 text-danger border-danger/20' },
  atingida: { label: 'Atingida', cls: 'bg-success/10 text-success border-success/20' },
  em_andamento: { label: 'Em andamento', cls: 'bg-brand/10 text-brand border-brand/20' },
  atrasada: { label: 'Atrasada', cls: 'bg-danger/10 text-danger border-danger/20' },
  ativa: { label: 'Ativa', cls: 'bg-success/10 text-success border-success/20' },
  pausada: { label: 'Pausada', cls: 'bg-warning/10 text-warning border-warning/20' },
  encerrada: { label: 'Encerrada', cls: 'bg-surface2 text-text-secondary border-border' },
  lead: { label: 'Lead', cls: 'bg-brand/10 text-brand border-brand/20' },
  em_negociacao: { label: 'Em Negociação', cls: 'bg-warning/10 text-warning border-warning/20' },
  proposta_enviada: { label: 'Proposta Enviada', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  cliente: { label: 'Cliente', cls: 'bg-success/10 text-success border-success/20' },
  perdido: { label: 'Perdido', cls: 'bg-danger/10 text-danger border-danger/20' },
}

export function Badge({ status, label: labelProp }) {
  const config = BADGE_MAP[status] ?? { label: status, cls: 'bg-surface2 text-text-secondary border-border' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.cls}`}>
      {labelProp ?? config.label}
    </span>
  )
}
