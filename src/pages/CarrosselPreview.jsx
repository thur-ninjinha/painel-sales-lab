import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getCarouselFull } from '../lib/carrossel/queries'
import { SlideGrid } from '../components/carrossel/SlideGrid'
import { supabase } from '../lib/supabase'

export function CarrosselPreview() {
  const { id } = useParams()
  const [carousel, setCarousel] = useState(null)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  const refetch = useCallback(() => {
    getCarouselFull(id).then(setCarousel).catch((e) => setError(e.message))
  }, [id])

  useEffect(() => { refetch() }, [refetch])

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirou.')
      const res = await fetch('/api/carrossel/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ carouselId: id })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const { zipUrl } = await res.json()
      window.location.href = zipUrl
    } catch (e) {
      setError(e.message)
    } finally {
      setExporting(false)
    }
  }

  if (!carousel && !error) return <div className="p-12 text-ink-muted">Carregando…</div>
  if (error) return <div className="p-12 text-danger">{error}</div>

  const current = carousel.versions.find((v) => v.id === carousel.current_version_id)
  if (!current) return <div className="p-12 text-danger">Versão atual não encontrada.</div>
  const doc = current.doc

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex items-start justify-between mb-12 gap-6">
        <div>
          <p className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-1">
            Studio Notes · v{current.version_number}
          </p>
          <h2 className="text-3xl font-light tracking-tight text-ink">{doc.title}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded hover:bg-brand-hover disabled:opacity-50"
          >
            {exporting ? 'Exportando…' : 'Exportar zip'}
          </button>
        </div>
      </header>
      <SlideGrid carouselId={id} slides={doc.slides} onChange={refetch} />
    </div>
  )
}
