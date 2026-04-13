import { useState } from 'react'
import { useCaixa } from '../hooks/useCaixa'
import { useToast } from '../components/ui/Toast'
import { StatCard } from '../components/ui/StatCard'
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { TransacaoForm } from '../components/caixa/TransacaoForm'
import { formatarMoeda, formatarDataCurta } from '../lib/formatters'
import { Wallet, TrendingUp, TrendingDown, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

export function Caixa() {
  const { transacoes, saldoAtual, totalReceitas, totalDespesas, loading, addTransacao, updateTransacao, deleteTransacao } = useCaixa()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletandoId, setDeletandoId] = useState(null)

  async function handleSubmit(data) {
    try {
      if (editando) {
        await updateTransacao(editando.id, data)
        toast.addToast('Transação atualizada!')
      } else {
        await addTransacao(data)
        toast.addToast('Transação adicionada!')
      }
      setModalOpen(false)
      setEditando(null)
    } catch {
      toast.addToast('Erro ao salvar transação.', 'error')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTransacao(id)
      toast.addToast('Transação excluída.', 'warning')
    } catch {
      toast.addToast('Erro ao excluir.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Saldo Atual"
          value={formatarMoeda(saldoAtual)}
          icon={Wallet}
          iconColor={saldoAtual >= 0 ? 'text-success' : 'text-danger'}
          iconBg={saldoAtual >= 0 ? 'bg-success/10' : 'bg-danger/10'}
        />
        <StatCard label="Total de Receitas" value={formatarMoeda(totalReceitas)} icon={TrendingUp} iconColor="text-success" iconBg="bg-success/10" />
        <StatCard label="Total de Despesas" value={formatarMoeda(totalDespesas)} icon={TrendingDown} iconColor="text-danger" iconBg="bg-danger/10" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary font-semibold">Histórico de Transações</h2>
        <Button onClick={() => { setEditando(null); setModalOpen(true) }}>
          <Plus size={16} /> Nova Transação
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand" /></div>
      ) : transacoes.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhuma transação ainda" description="Adicione sua primeira receita ou despesa." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} />Adicionar</Button>} />
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t, i) => (
                  <tr key={t.id} className={`border-b border-border/50 hover:bg-surface2 transition-colors ${i % 2 === 0 ? '' : 'bg-surface2/30'}`}>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{formatarDataCurta(t.data)}</td>
                    <td className="px-4 py-3"><Badge status={t.tipo} /></td>
                    <td className="px-4 py-3 text-text-secondary">{t.categoria}</td>
                    <td className="px-4 py-3 text-text-primary">{t.descricao}</td>
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${t.tipo === 'receita' ? 'text-success' : 'text-danger'}`}>
                      {t.tipo === 'receita' ? '+' : '-'}{formatarMoeda(t.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => { setEditando(t); setModalOpen(true) }}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletandoId(t.id)}>
                          <Trash2 size={14} className="text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditando(null) }} title={editando ? 'Editar Transação' : 'Nova Transação'}>
        <TransacaoForm
          inicial={editando}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditando(null) }}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deletandoId}
        onClose={() => setDeletandoId(null)}
        onConfirm={() => handleDelete(deletandoId)}
        message="Tem certeza que deseja excluir esta transação?"
      />
    </div>
  )
}
