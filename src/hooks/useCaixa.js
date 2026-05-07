import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { logActivity } from '../lib/activity'

const BUCKET = 'comprovantes'

function extOf(file) {
  const m = file.name.match(/\.([a-zA-Z0-9]+)$/)
  return m ? m[1].toLowerCase() : 'bin'
}

async function uploadComprovante(file, transacaoId) {
  const path = `${transacaoId}/${Date.now()}.${extOf(file)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error
  return { path, nome: file.name }
}

async function deleteComprovante(path) {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

export async function getComprovanteUrl(path) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

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

  async function addTransacao(data, file) {
    const { data: inserted, error } = await supabase
      .from('transacoes')
      .insert([data])
      .select()
      .single()
    if (error) throw error

    if (file) {
      try {
        const { path, nome } = await uploadComprovante(file, inserted.id)
        const { error: updErr } = await supabase
          .from('transacoes')
          .update({ comprovante_path: path, comprovante_nome: nome })
          .eq('id', inserted.id)
        if (updErr) {
          await deleteComprovante(path).catch(() => {})
          throw updErr
        }
      } catch (e) {
        await supabase.from('transacoes').delete().eq('id', inserted.id)
        throw e
      }
    }

    await fetchTransacoes()
    logActivity({
      action: 'criou',
      entity_type: 'transacao',
      entity_name: data.descricao,
      meta: { tipo: data.tipo, valor: data.valor, tem_comprovante: !!file },
    })
  }

  async function updateTransacao(id, data, file, removerComprovante) {
    const atual = transacoes.find(t => t.id === id)
    const patch = { ...data }

    if (removerComprovante && atual?.comprovante_path) {
      await deleteComprovante(atual.comprovante_path).catch(() => {})
      patch.comprovante_path = null
      patch.comprovante_nome = null
    }

    if (file) {
      if (atual?.comprovante_path) {
        await deleteComprovante(atual.comprovante_path).catch(() => {})
      }
      const { path, nome } = await uploadComprovante(file, id)
      patch.comprovante_path = path
      patch.comprovante_nome = nome
    }

    const { error } = await supabase.from('transacoes').update(patch).eq('id', id)
    if (error) throw error
    await fetchTransacoes()
    logActivity({ action: 'editou', entity_type: 'transacao', entity_name: data.descricao })
  }

  async function deleteTransacao(id) {
    const t = transacoes.find(t => t.id === id)
    if (t?.comprovante_path) {
      await deleteComprovante(t.comprovante_path).catch(() => {})
    }
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
