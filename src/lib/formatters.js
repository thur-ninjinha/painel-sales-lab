import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor ?? 0)
}

export function formatarData(data) {
  if (!data) return '—'
  const d = typeof data === 'string' ? parseISO(data) : data
  return format(d, "d 'de' MMM. 'de' yyyy", { locale: ptBR })
}

export function formatarDataCurta(data) {
  if (!data) return '—'
  const d = typeof data === 'string' ? parseISO(data) : data
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatarMes(data) {
  if (!data) return '—'
  const d = typeof data === 'string' ? parseISO(data) : data
  return format(d, 'MMMM yyyy', { locale: ptBR })
}

export function formatarPorcentagem(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return '—'
  return `${Number(valor).toFixed(1).replace('.', ',')}%`
}

export function calcularROI(receitaGerada, valorInvestido) {
  if (!valorInvestido || valorInvestido === 0) return null
  return ((receitaGerada - valorInvestido) / valorInvestido) * 100
}
