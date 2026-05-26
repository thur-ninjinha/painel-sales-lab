import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { logActivity } from '../lib/activity'
import { differenceInCalendarDays, parseISO } from 'date-fns'

/**
 * Manages profit goals (metas_lucro) and derives live progress from transactions.
 * @param {Array} transacoes - transactions list from useCaixa (with `data`, `tipo`, `valor`)
 */
export function useMetaLucro(transacoes = []) {
  const [metas, setMetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMetas = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('metas_lucro')
      .select('*')
      .order('data_limite', { ascending: true })
    if (error) setError(error.message)
    else setMetas(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMetas() }, [fetchMetas])

  const today = new Date()
  const todayIso = today.toISOString().slice(0, 10)

  const metasComProgresso = useMemo(() => {
    return metas.map((m) => {
      const fimJanela = m.data_limite < todayIso ? m.data_limite : todayIso
      const lucroAtual = transacoes.reduce((acc, t) => {
        if (!t.data) return acc
        if (t.data < m.data_inicio) return acc
        if (t.data > fimJanela) return acc
        const v = Number(t.valor) || 0
        return acc + (t.tipo === 'receita' ? v : -v)
      }, 0)

      const alvo = Number(m.valor_alvo) || 0
      const progressoPct = alvo > 0 ? Math.min(100, Math.max(0, (lucroAtual / alvo) * 100)) : 0
      const diasRestantes = Math.max(0, differenceInCalendarDays(parseISO(m.data_limite), today))
      const restante = Math.max(0, alvo - lucroAtual)
      const ritmoNecessario = diasRestantes > 0 ? restante / diasRestantes : 0
      const atingida = lucroAtual >= alvo
      const expirada = m.data_limite < todayIso

      return {
        ...m,
        lucroAtual,
        progressoPct,
        diasRestantes,
        ritmoNecessario,
        atingida,
        expirada,
      }
    })
  }, [metas, transacoes, todayIso])

  useEffect(() => {
    if (loading) return
    const todayStr = new Date().toISOString().slice(0, 10)
    const aAtualizar = metas.filter(
      m => m.status === 'ativa' && m.data_limite < todayStr
    )
    if (aAtualizar.length === 0) return

    ;(async () => {
      for (const m of aAtualizar) {
        const progressoMeta = metasComProgresso.find(x => x.id === m.id)
        const novoStatus = progressoMeta?.atingida ? 'concluida' : 'expirada'
        await supabase.from('metas_lucro').update({ status: novoStatus }).eq('id', m.id)
      }
      await fetchMetas()
    })().catch(() => {})
  }, [loading, metas, metasComProgresso, fetchMetas])

  async function addMeta({ titulo, valor_alvo, data_limite }) {
    const payload = {
      titulo: titulo?.trim() || null,
      valor_alvo: Number(valor_alvo),
      data_limite,
    }
    const { error } = await supabase.from('metas_lucro').insert([payload])
    if (error) throw error
    await fetchMetas()
    logActivity({
      action: 'criou',
      entity_type: 'meta_lucro',
      entity_name: payload.titulo ?? 'Meta de lucro',
      meta: { valor_alvo: payload.valor_alvo, data_limite },
    })
  }

  async function updateMeta(id, { titulo, valor_alvo, data_limite }) {
    const patch = {
      titulo: titulo?.trim() || null,
      valor_alvo: Number(valor_alvo),
      data_limite,
    }
    const { error } = await supabase.from('metas_lucro').update(patch).eq('id', id)
    if (error) throw error
    await fetchMetas()
    logActivity({
      action: 'editou',
      entity_type: 'meta_lucro',
      entity_name: patch.titulo ?? 'Meta de lucro',
    })
  }

  async function archiveMeta(id) {
    const m = metas.find(x => x.id === id)
    const { error } = await supabase
      .from('metas_lucro')
      .update({ status: 'arquivada' })
      .eq('id', id)
    if (error) throw error
    await fetchMetas()
    logActivity({
      action: 'arquivou',
      entity_type: 'meta_lucro',
      entity_name: m?.titulo ?? 'Meta de lucro',
    })
  }

  async function removeMeta(id) {
    const m = metas.find(x => x.id === id)
    const { error } = await supabase.from('metas_lucro').delete().eq('id', id)
    if (error) throw error
    await fetchMetas()
    logActivity({
      action: 'excluiu',
      entity_type: 'meta_lucro',
      entity_name: m?.titulo ?? 'Meta de lucro',
    })
  }

  return {
    metas: metasComProgresso,
    loading,
    error,
    refresh: fetchMetas,
    addMeta,
    updateMeta,
    archiveMeta,
    removeMeta,
  }
}
