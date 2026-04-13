import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calcularROI } from '../lib/formatters'

export function useTrafego() {
  const [campanhas, setCampanhas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCampanhas = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('campanhas')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else {
      setCampanhas(data.map(c => ({
        ...c,
        roi: calcularROI(Number(c.receita_gerada), Number(c.valor_investido)),
        percentualGasto: c.orcamento_total > 0
          ? (Number(c.valor_investido) / Number(c.orcamento_total)) * 100
          : 0,
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCampanhas() }, [fetchCampanhas])

  const totalOrcamento = campanhas.reduce((acc, c) => acc + Number(c.orcamento_total), 0)
  const totalInvestido = campanhas.reduce((acc, c) => acc + Number(c.valor_investido), 0)
  const totalReceita = campanhas.reduce((acc, c) => acc + Number(c.receita_gerada), 0)
  const roiGeral = calcularROI(totalReceita, totalInvestido)
  const campanhasAtivas = campanhas.filter(c => c.status === 'ativa').length

  async function addCampanha(data) {
    const { error } = await supabase.from('campanhas').insert([data])
    if (error) throw error
    await fetchCampanhas()
  }

  async function updateCampanha(id, data) {
    const { error } = await supabase.from('campanhas').update(data).eq('id', id)
    if (error) throw error
    await fetchCampanhas()
  }

  async function deleteCampanha(id) {
    const { error } = await supabase.from('campanhas').delete().eq('id', id)
    if (error) throw error
    await fetchCampanhas()
  }

  return {
    campanhas, loading, error,
    totalOrcamento, totalInvestido, totalReceita, roiGeral, campanhasAtivas,
    addCampanha, updateCampanha, deleteCampanha,
    refresh: fetchCampanhas,
  }
}
