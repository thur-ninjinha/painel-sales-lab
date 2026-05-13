import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function RegenerateButton({ carouselId, slideIndex, onDone }) {
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async () => {
    setErr(null)
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirou.')
      const res = await fetch('/api/carrossel/regenerate-slide', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ carouselId, slideIndex, hint: hint || undefined })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setOpen(false)
      setHint('')
      if (onDone) onDone()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 border border-border rounded text-ink-muted hover:text-ink hover:border-border-light transition"
      >
        Regenerar
      </button>
    )
  }
  return (
    <div className="absolute z-10 mt-1 bg-surface2 border border-border rounded p-3 shadow-lg flex flex-col gap-2 w-64">
      <input
        value={hint}
        onChange={(e) => setHint(e.target.value)}
        placeholder="dica (opcional): mais curto, tom mais leve…"
        className="text-xs bg-transparent border-b border-border py-1 text-ink focus:outline-none focus:border-ink"
      />
      {err && <p className="text-xs text-danger">{err}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={submitting}
          className="text-xs px-2 py-1 bg-brand text-white rounded hover:bg-brand-hover disabled:opacity-50"
        >
          {submitting ? '…' : 'Refazer'}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 text-ink-muted hover:text-ink">
          Cancelar
        </button>
      </div>
    </div>
  )
}
