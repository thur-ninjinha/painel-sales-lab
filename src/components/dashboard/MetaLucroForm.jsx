import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Loader2 } from 'lucide-react'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function tomorrowIso() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function MetaLucroForm({ inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    titulo: inicial?.titulo ?? '',
    valor_alvo: inicial?.valor_alvo ?? '',
    data_limite: inicial?.data_limite ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)

    const valor = Number(form.valor_alvo)
    if (!valor || valor <= 0) {
      setErro('Valor alvo deve ser maior que zero.')
      return
    }
    if (!form.data_limite) {
      setErro('Defina uma data limite.')
      return
    }
    if (!inicial && form.data_limite <= todayIso()) {
      setErro('Data limite deve ser futura.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        titulo: form.titulo,
        valor_alvo: valor,
        data_limite: form.data_limite,
      })
    } catch (err) {
      setErro(err?.message ?? 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título (opcional)"
        value={form.titulo}
        onChange={e => set('titulo', e.target.value)}
        placeholder="Ex: Meta Q2, Inauguração"
        maxLength={80}
      />
      <Input
        label="Valor alvo (R$)"
        type="number"
        step="0.01"
        min="0.01"
        value={form.valor_alvo}
        onChange={e => set('valor_alvo', e.target.value)}
        required
        placeholder="0,00"
      />
      <Input
        label="Data limite"
        type="date"
        value={form.data_limite}
        onChange={e => set('data_limite', e.target.value)}
        min={tomorrowIso()}
        required
      />

      {erro && (
        <p className="text-danger text-xs">{erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {inicial ? 'Salvar' : 'Criar meta'}
        </Button>
      </div>
    </form>
  )
}
