import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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
  }

  async function updateTransacao(id, data) {
    const { error } = await supabase.from('transacoes').update(data).eq('id', id)
    if (error) throw error
    await fetchTransacoes()
  }

  async function deleteTransacao(id) {
    const { error } = await supabase.from('transacoes').delete().eq('id', id)
    if (error) throw error
    await fetchTransacoes()
  }

  return {
    transacoes, loading, error,
    saldoAtual, totalReceitas, totalDespesas,
    addTransacao, updateTransacao, deleteTransacao,
    refresh: fetchTransacoes,
  }
}
