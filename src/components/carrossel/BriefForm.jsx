import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { BriefInputSchema } from '../../lib/carrossel/schemas'
import { supabase } from '../../lib/supabase'

export function BriefForm() {
  const [mode, setMode] = useState('theme')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const form = useForm({
    resolver: zodResolver(BriefInputSchema),
    defaultValues: { mode: 'theme', input: { topic: '', tone_hint: null } }
  })

  const handleModeChange = (m) => {
    setMode(m)
    if (m === 'theme') form.reset({ mode: 'theme', input: { topic: '', tone_hint: null } })
    else if (m === 'repurpose') form.reset({ mode: 'repurpose', input: { source_text: '' } })
    else if (m === 'template') form.reset({ mode: 'template', input: { skeleton: Array(10).fill('') } })
  }

  const onSubmit = async (data) => {
    setError(null)
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirou — faça login novamente.')
      const res = await fetch('/api/carrossel/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const { carouselId } = await res.json()
      navigate(`/carrossel/${carouselId}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-2 border-b border-border">
        {['theme', 'repurpose', 'template'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
            className={`px-4 py-2 text-sm font-medium transition ${
              mode === m ? 'border-b-2 border-ink -mb-px text-ink' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {m === 'theme' ? 'Tema' : m === 'repurpose' ? 'Repurpose' : 'Template'}
          </button>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {mode === 'theme' && (
          <>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Tema do carrossel</span>
              <input
                {...form.register('input.topic')}
                className="w-full bg-transparent border-b border-border py-3 text-lg text-ink focus:outline-none focus:border-ink"
                placeholder="ex.: 5 sinais de uma landing page mediana"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Dica de tom (opcional)</span>
              <input
                {...form.register('input.tone_hint')}
                className="w-full bg-transparent border-b border-border py-3 text-ink focus:outline-none focus:border-ink"
                placeholder="ex.: mais didático, tom de carta"
              />
            </label>
          </>
        )}

        {mode === 'repurpose' && (
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Cole o texto-fonte</span>
            <span className="text-xs text-ink-muted">Mínimo 50 caracteres. Pode ser artigo, post antigo, transcrição.</span>
            <textarea
              {...form.register('input.source_text')}
              rows={12}
              className="w-full bg-transparent border border-border rounded p-4 text-ink focus:outline-none focus:border-ink"
              placeholder="cole aqui..."
            />
          </label>
        )}

        {mode === 'template' && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Esqueleto — 1 linha por slide</span>
            <span className="text-xs text-ink-muted">Preencha o que cada slide DEVE comunicar.</span>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-mono text-sm text-ink-muted w-10">/{String(i + 1).padStart(2, '0')}</span>
                <input
                  {...form.register(`input.skeleton.${i}`)}
                  className="flex-1 bg-transparent border-b border-border py-2 text-ink focus:outline-none focus:border-ink"
                  placeholder={`slide ${i + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="self-start px-6 py-3 bg-brand text-white font-medium rounded hover:bg-brand-hover disabled:opacity-50 transition"
        >
          {submitting ? 'Gerando…' : 'Gerar carrossel'}
        </button>
      </form>
    </div>
  )
}
