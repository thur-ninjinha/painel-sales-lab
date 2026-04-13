import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export function useMetas() {
  const [funcionarios, setFuncionarios] = useState([])
  const [metas, setMetas] = useState([])
  const [mesReferencia, setMesReferencia] = useState(
    format(new Date(), 'yyyy-MM') + '-01'
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: funcs, error: e1 }, { data: metasData, error: e2 }] = await Promise.all([
      supabase.from('funcionarios').select('*').eq('ativo', true).order('nome'),
      supabase.from('metas').select('*').eq('mes_referencia', mesReferencia).order('created_at'),
    ])
    if (e1 || e2) setError((e1 || e2).message)
    else {
      setFuncionarios(funcs)
      setMetas(metasData)
    }
    setLoading(false)
  }, [mesReferencia])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function addFuncionario(data) {
    const { error } = await supabase.from('funcionarios').insert([data])
    if (error) throw error
    await fetchAll()
  }

  async function updateFuncionario(id, data) {
    const { error } = await supabase.from('funcionarios').update(data).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function deleteFuncionario(id) {
    const { error } = await supabase.from('funcionarios').update({ ativo: false }).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function addMeta(data) {
    const { error } = await supabase.from('metas').insert([{ ...data, mes_referencia: mesReferencia }])
    if (error) throw error
    await fetchAll()
  }

  async function updateMeta(id, data) {
    const { error } = await supabase.from('metas').update(data).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function deleteMeta(id) {
    const { error } = await supabase.from('metas').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  const metasPorFuncionario = funcionarios.map(f => ({
    ...f,
    metas: metas.filter(m => m.funcionario_id === f.id),
  }))

  const totalMetas = metas.length
  const metasAtingidas = metas.filter(m => m.status === 'atingida').length

  return {
    funcionarios, metas, metasPorFuncionario,
    mesReferencia, setMesReferencia,
    totalMetas, metasAtingidas,
    loading, error,
    addFuncionario, updateFuncionario, deleteFuncionario,
    addMeta, updateMeta, deleteMeta,
    refresh: fetchAll,
  }
}
