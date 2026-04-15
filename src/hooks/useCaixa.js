import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { logActivity } from '../lib/activity'

export function useCaixa() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransacoes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('data', { ascending: false })
    if (error) setError(error.message)
    else setTransacoes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchTransacoes() }, [fetchTransacoes])

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const saldoAtual = totalReceitas - totalDespesas

  async function addTransacao(data) {
    const { error } = await supabase.from('transacoes').insert([data])
    if (error) throw error
    await fetchTransacoes()
    logActivity({ action: 'criou', entity_type: 'transacao', entity_name: data.descricao, meta: { tipo: data.tipo, valor: data.valor } })
  }

  async function updateTransacao(id, data) {
    const { error } = await supabase.from('transacoes').update(data).eq('id', id)
    if (error) throw error
    await fetchTransacoes()
    logActivity({ action: 'editou', entity_type: 'transacao', entity_name: data.descricao })
  }

  async function deleteTransacao(id) {
    const t = transacoes.find(t => t.id === id)
    const { error } = await supabase.from('transacoes').delete().eq('id', id)
    if (error) throw error
    await fetchTransacoes()
    logActivity({ action: 'excluiu', entity_type: 'transacao', entity_name: t?.descricao ?? '' })
  }

  return {
    transacoes, loading, error,
    saldoAtual, totalReceitas, totalDespesas,
    addTransacao, updateTransacao, deleteTransacao,
    refresh: fetchTransacoes,
  }
}
