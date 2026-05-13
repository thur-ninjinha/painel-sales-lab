import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCarousels } from '../lib/carrossel/queries'

export function CarrosselList() {
  const [carousels, setCarousels] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listCarousels().then(setCarousels).catch((e) => setError(e.message))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-12">
        <div>
          <p className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-1">Studio Notes</p>
          <h2 className="text-3xl font-light tracking-tight text-ink">Carrosséis</h2>
        </div>
        <Link
          to="/carrossel/novo"
          className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded hover:bg-brand-hover"
        >
          Novo carrossel
        </Link>
      </header>

      {error && <p className="text-danger text-sm">{error}</p>}

      {carousels === null && !error && <p className="text-ink-muted">Carregando…</p>}

      {carousels && carousels.length === 0 && (
        <p className="text-ink-muted">Nenhum carrossel ainda. Crie o primeiro.</p>
      )}

      {carousels && carousels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carousels.map((c) => (
            <Link
              key={c.id}
              to={`/carrossel/${c.id}`}
              className="border border-border rounded p-5 hover:border-border-light transition block"
            >
              <div className="font-mono text-xs text-ink-muted mb-2">
                {new Date(c.updated_at).toLocaleDateString('pt-BR')}
              </div>
              <div className="font-medium text-ink">{c.title}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
