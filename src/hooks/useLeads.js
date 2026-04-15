import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { logActivity } from '../lib/activity'

export const ESTAGIOS = [
  { key: 'lead', label: 'Lead' },
  { key: 'em_negociacao', label: 'Em Negociação' },
  { key: 'proposta_enviada', label: 'Proposta Enviada' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'perdido', label: 'Perdido' },
]

export function useLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('data_entrada', { ascending: false })
    if (error) setError(error.message)
    else setLeads(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const pipeline = ESTAGIOS.reduce((acc, e) => {
    acc[e.key] = leads.filter(l => l.estagio === e.key)
    return acc
  }, {})

  const totalLeads = leads.filter(l => l.estagio !== 'perdido').length
  const emNegociacao = leads.filter(l => l.estagio === 'em_negociacao' || l.estagio === 'proposta_enviada').length
  const clientes = leads.filter(l => l.estagio === 'cliente').length
  const perdidos = leads.filter(l => l.estagio === 'perdido').length

  async function addLead(data) {
    const { error } = await supabase.from('leads').insert([data])
    if (error) throw error
    await fetchLeads()
    logActivity({ action: 'adicionou', entity_type: 'lead', entity_name: data.nome, meta: { origem: data.origem } })
  }

  async function updateLead(id, data) {
    const { error } = await supabase.from('leads').update(data).eq('id', id)
    if (error) throw error
    await fetchLeads()
    logActivity({ action: 'editou', entity_type: 'lead', entity_name: data.nome })
  }

  async function deleteLead(id) {
    const l = leads.find(l => l.id === id)
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error
    await fetchLeads()
    logActivity({ action: 'excluiu', entity_type: 'lead', entity_name: l?.nome ?? '' })
  }

  async function moveEstagio(id, novoEstagio) {
    const lead = leads.find(l => l.id === id)
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estagio: novoEstagio } : l))
    const { error } = await supabase.from('leads').update({ estagio: novoEstagio }).eq('id', id)
    if (error) {
      await fetchLeads()
      throw error
    }
    const estagioLabel = ESTAGIOS.find(e => e.key === novoEstagio)?.label ?? novoEstagio
    logActivity({ action: 'moveu', entity_type: 'lead', entity_name: lead?.nome ?? '', meta: { para: estagioLabel } })
  }

  return {
    leads, pipeline, loading, error,
    totalLeads, emNegociacao, clientes, perdidos,
    addLead, updateLead, deleteLead, moveEstagio,
    refresh: fetchLeads,
  }
}
