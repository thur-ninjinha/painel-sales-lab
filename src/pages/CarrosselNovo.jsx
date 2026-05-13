import { BriefForm } from '../components/carrossel/BriefForm'

export function CarrosselNovo() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <header className="mb-12">
        <p className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-1">Studio Notes</p>
        <h2 className="text-3xl font-light tracking-tight text-ink">Novo carrossel</h2>
      </header>
      <BriefForm />
    </div>
  )
}
