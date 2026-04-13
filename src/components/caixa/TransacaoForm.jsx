import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

const CATEGORIAS_RECEITA = ['Serviços', 'Site/Landing Page', 'Manutenção', 'Consultoria', 'Outros']
const CATEGORIAS_DESPESA = ['Ferramentas', 'Marketing', 'Salários', 'Infraestrutura', 'Impostos', 'Outros']

export function TransacaoForm({ inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    ...inicial,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const categorias = form.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.descricao.trim()) e.descricao = 'Obrigatório'
    if (!form.categoria) e.categoria = 'Obrigatório'
    if (!form.valor || isNaN(form.valor) || Number(form.valor) <= 0) e.valor = 'Valor inválido'
    if (!form.data) e.data = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({ ...form, valor: Number(form.valor) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        {['receita', 'despesa'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => set('tipo', t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              form.tipo === t
                ? t === 'receita'
                  ? 'bg-success/10 text-success border-success/30'
                  : 'bg-danger/10 text-danger border-danger/30'
                : 'bg-surface2 text-text-secondary border-border hover:border-brand'
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
