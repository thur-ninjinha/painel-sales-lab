import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export function AssetUpload({ carouselId, slideIndex, onDone }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handle = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${carouselId}/slide-${String(slideIndex).padStart(2, '0')}.${ext}`
      const { error } = await supabase.storage.from('carousel-uploads').upload(path, file, { upsert: true })
      if (error) throw error
      if (onDone) onDone()
    } catch (e) {
      alert(`Upload falhou: ${e.message}`)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs px-2 py-1 border border-border rounded text-ink-muted hover:text-ink hover:border-border-light disabled:opacity-50 transition"
      >
        {uploading ? '…' : 'Imagem'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handle} className="hidden" />
    </>
  )
}
