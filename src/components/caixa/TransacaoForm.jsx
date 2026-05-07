import { useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { Loader2, Paperclip, X, FileText } from 'lucide-react'
import { format } from 'date-fns'

const CATEGORIAS_RECEITA = ['Serviços', 'Site/Landing Page', 'Manutenção', 'Consultoria', 'Outros']
const CATEGORIAS_DESPESA = ['Ferramentas', 'Marketing', 'Salários', 'Infraestrutura', 'Impostos', 'Outros']

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

function ComprovanteField({ file, existingNome, onPick, onClear, error }) {
  const inputRef = useRef(null)

  const hasNew = !!file
  const hasExisting = !hasNew && !!existingNome

  function handlePick(e) {
    const f = e.target.files?.[0]
    if (f) onPick(f)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="label-caps">Comprovante (opcional)</label>

      {!hasNew && !hasExisting && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex items-center gap-2 bg-surface2 border ${error ? 'border-danger' : 'border-border border-dashed'} rounded-lg px-3.5 py-2.5 text-sm text-ink-muted hover:text-ink hover:border-border-light transition-colors`}
        >
          <Paperclip size={14} />
          <span>Anexar PDF ou imagem (até 5 MB)</span>
        </button>
      )}

      {(hasNew || hasExisting) && (
        <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2.5">
          <FileText size={14} className="text-ink-muted flex-shrink-0" />
          <span className="text-sm text-white truncate flex-1" title={hasNew ? file.name : existingNome}>
            {hasNew ? file.name : existingNome}
          </span>
          {hasNew && (
            <span className="label-caps text-success">Novo</span>
          )}
          <button
            type="button"
            onClick={onClear}
            className="text-ink-muted hover:text-danger transition-colors p-1"
            aria-label="Remover anexo"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePick}
      />
      {error && <p className="text-danger text-xs font-medium">{error}</p>}
    </div>
  )
}

export function TransacaoForm({ inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    ...inicial,
  })
  const [file, setFile] = useState(null)
  const [removerComprovante, setRemoverComprovante] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const categorias = form.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA
  const existingNome = removerComprovante ? null : inicial?.comprovante_nome

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function pickFile(f) {
    setErrors(prev => ({ ...prev, comprovante: '' }))
    if (!ACCEPTED_MIME.includes(f.type)) {
      setErrors(prev => ({ ...prev, comprovante: 'Use PDF, JPG, PNG ou WEBP.' }))
      return
    }
    if (f.size > MAX_FILE_BYTES) {
      setErrors(prev => ({ ...prev, comprovante: 'Arquivo excede 5 MB.' }))
      return
    }
    setFile(f)
    setRemoverComprovante(false)
  }

  function clearFile() {
    if (file) {
      setFile(null)
    } else if (inicial?.comprovante_path) {
      setRemoverComprovante(true)
    }
  }

  function validate() {
    const e = {}
    if (!form.descricao.trim()) e.descricao = 'Obrigatório'
    if (!form.categoria) e.categoria = 'Obrigatório'
    if (!form.valor || isNaN(form.valor) || Number(form.valor) <= 0) e.valor = 'Valor inválido'
    if (!form.data) e.data = 'Obrigatório'
    setErrors(prev => ({ ...prev, ...e }))
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        tipo: form.tipo,
        categoria: form.categoria,
        descricao: form.descricao,
        valor: Number(form.valor),
        data: form.data,
      }
      await onSubmit(payload, file, removerComprovante)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo toggle */}
      <div className="flex gap-2 p-1 bg-surface3 rounded-lg">
        {['receita', 'despesa'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => set('tipo', t)}
            className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${
              form.tipo === t
                ? t === 'receita'
                  ? 'bg-success text-black'
                  : 'bg-danger text-white'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {t === 'receita' ? 'Receita' : 'Despesa'}
          </button>
        ))}
      </div>

      <Select label="Categoria" value={form.categoria} onChange={e => set('categoria', e.target.value)} error={errors.categoria}>
        <option value="">Selecionar...</option>
        {categorias.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>

      <Input label="Descrição" value={form.descricao} onChange={e => set('descricao', e.target.value)} error={errors.descricao} placeholder="Ex: Projeto site Cliente X" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Valor (R$)" type="number" step="0.01" min="0" value={form.valor} onChange={e => set('valor', e.target.value)} error={errors.valor} placeholder="0,00" />
        <Input label="Data" type="date" value={form.data} onChange={e => set('data', e.target.value)} error={errors.data} />
      </div>

      <ComprovanteField
        file={file}
        existingNome={existingNome}
        onPick={pickFile}
        onClear={clearFile}
        error={errors.comprovante}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {inicial ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}
