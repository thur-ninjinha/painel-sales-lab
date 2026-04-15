import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { logActivity } from '../lib/activity'

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
    logActivity({ action: 'adicionou', entity_type: 'funcionario', entity_name: data.nome, meta: { cargo: data.cargo } })
  }

  async function updateFuncionario(id, data) {
    const { error } = await supabase.from('funcionarios').update(data).eq('id', id)
    if (error) throw error
    await fetchAll()
    logActivity({ action: 'editou', entity_type: 'funcionario', entity_name: data.nome })
  }

  async function deleteFuncionario(id) {
    const f = funcionarios.find(f => f.id === id)
    const { error } = await supabase.from('funcionarios').update({ ativo: false }).eq('id', id)
    if (error) throw error
    await fetchAll()
    logActivity({ action: 'removeu', entity_type: 'funcionario', entity_name: f?.nome ?? '' })
  }

  async function addMeta(data) {
    const { error } = await supabase.from('metas').insert([{ ...data, mes_referencia: mesReferencia }])
    if (error) throw error
    await fetchAll()
    logActivity({ action: 'criou', entity_type: 'meta', entity_name: data.titulo })
  }

  async function updateMeta(id, data) {
    const { error } = await supabase.from('metas').update(data).eq('id', id)
    if (error) throw error
    await fetchAll()
    logActivity({ action: 'editou', entity_type: 'meta', entity_name: data.titulo })
  }

  async function deleteMeta(id) {
    const m = metas.find(m => m.id === id)
    const { error } = await supabase.from('metas').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
    logActivity({ action: 'excluiu', entity_type: 'meta', entity_name: m?.titulo ?? '' })
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
