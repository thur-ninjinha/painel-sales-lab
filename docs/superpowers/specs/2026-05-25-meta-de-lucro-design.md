# Meta de Lucro com Prazo — Design

**Data:** 2026-05-25
**Projeto:** painel-zenite-studio (painel-sales-lab)
**Status:** Em revisão

## Contexto

O painel já possui:
- **Caixa** (`transacoes`): receitas e despesas, com `saldoAtual = totalReceitas - totalDespesas`.
- **Metas** (`metas` + `funcionarios`): metas individuais por funcionário (ex: "fechar 5 contratos").

Falta um conceito de **meta de lucro financeira com prazo** — valores e datas livres, definidas pelo usuário, com progresso calculado automaticamente a partir do Caixa.

## Objetivo

Permitir que o usuário crie metas de lucro com valor alvo (R$) e data limite. O progresso é calculado automaticamente somando `(receitas − despesas)` das transações do Caixa entre a `data_inicio` e `min(hoje, data_limite)` da meta. Múltiplas metas podem coexistir.

## Modelo de Dados

Nova tabela Supabase **`metas_lucro`**:

| Campo | Tipo | Constraints | Nota |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `titulo` | text | nullable | Distinguir metas (ex: "Meta Q2", "Inauguração") |
| `valor_alvo` | numeric(12,2) | NOT NULL, > 0 | Meta em R$ |
| `data_inicio` | date | NOT NULL, default `current_date` | Início do período |
| `data_limite` | date | NOT NULL, > `data_inicio` | Deadline |
| `status` | text | NOT NULL, default `'ativa'`, check in (`'ativa'`, `'concluida'`, `'expirada'`, `'arquivada'`) | |
| `created_at` | timestamptz | NOT NULL, default `now()` | |
| `updated_at` | timestamptz | NOT NULL, default `now()` | trigger de update |

**RLS:** ativa, mesmo padrão das outras tabelas (`metas`, `transacoes`). Política: usuários autenticados podem `select/insert/update/delete`.

**Sem índice único** — múltiplas metas `ativa` permitidas simultaneamente.

**Migration:** `supabase/migrations/<timestamp>_metas_lucro.sql`, aplicada via MCP `apply_migration`.

## Cálculo do Progresso

Para cada meta, no client (hook `useMetaLucro`):

```
lucro_atual = sum(
  t.valor * (t.tipo === 'receita' ? 1 : -1)
  for t in transacoes
  where t.data >= meta.data_inicio
    and t.data <= min(today, meta.data_limite)
)

progresso_pct = clamp(lucro_atual / meta.valor_alvo * 100, 0, 100)
dias_restantes = max(0, days_between(today, meta.data_limite))
ritmo_necessario = dias_restantes > 0
  ? max(0, (meta.valor_alvo - lucro_atual) / dias_restantes)
  : 0
```

Reaproveita as transações já carregadas pelo `useCaixa`. Sem view SQL nem RPC.

**Importante:** transações são consideradas pela `data` da transação (não `created_at`). Uma mesma transação conta para todas as metas cujo período a inclui — intencional, é o lucro do studio no período.

## Ciclo de Vida

| Evento | Ação |
|---|---|
| Criar meta | Insere com `status='ativa'`. NÃO arquiva outras metas. |
| Editar meta | Permitido enquanto `status='ativa'`. Demais bloqueiam edição. |
| `data_limite < hoje` | Ao carregar `useMetaLucro`, marcar como `concluida` (se `lucro_atual >= valor_alvo`) ou `expirada`. Update síncrono no Supabase. |
| Atingiu alvo antes da deadline | Mantém `ativa` (usuário pode querer superar). Badge "ATINGIDA" no card. |
| Arquivar manualmente | Botão no card → `status='arquivada'`. |
| Excluir | Hard delete via botão (com confirmação). Log activity. |

## UI

### Seção no Dashboard

Inserir entre o hero "DASHBOARD" e os `BigMetric` financeiros existentes.

**Quando há metas ativas:**

```
METAS DE LUCRO                          [+ Nova meta]  [Ver arquivadas]

┌─────────────────────────────┐  ┌─────────────────────────────┐
│ META Q2                     │  │ INAUGURAÇÃO LOJA            │
│                             │  │                             │
│ R$ 4.320 / R$ 8.000   54%   │  │ R$ 12.500 / R$ 10.000 125%  │
│ ▰▰▰▰▰▰▱▱▱▱▱▱                │  │ ▰▰▰▰▰▰▰▰▰▰▰▰  [ATINGIDA]    │
│                             │  │                             │
│ 18 dias · R$ 204/dia        │  │ 4 dias restantes            │
│                  [···]      │  │                  [···]      │
└─────────────────────────────┘  └─────────────────────────────┘
```

- Grid responsivo: `grid-cols-1 md:grid-cols-2`
- Menu `[···]` por card: Editar, Arquivar, Excluir
- Cores: barra `bg-brand` em andamento, `bg-success` se atingida, `bg-danger` se expirada sem bater

**Quando não há metas ativas:**

`EmptyState` discreto com CTA "Criar primeira meta de lucro" (mesma seção, sem ocultar título).

### Modal de criação/edição

Campos:
- **Título** (opcional) — placeholder "Ex: Meta Q2"
- **Valor alvo (R$)** — number, step 0.01, required, > 0
- **Data limite** — date, required, > hoje no momento da criação

Validação client antes de submit. Erros via toast.

### Modal de histórico ("Ver arquivadas")

Lista de metas com `status` em `('concluida', 'expirada', 'arquivada')`, ordenadas por `data_limite DESC`. Cada linha mostra: título, período, valor alvo, lucro final atingido, badge de status. Sem ações além de fechar.

## Arquivos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/<ts>_metas_lucro.sql` | Criar — tabela + RLS + trigger updated_at |
| `src/hooks/useMetaLucro.js` | Criar — fetch + derive progresso + auto-update status expiradas |
| `src/components/dashboard/MetaLucroCard.jsx` | Criar — card individual com progresso + menu |
| `src/components/dashboard/MetaLucroForm.jsx` | Criar — form de criação/edição |
| `src/components/dashboard/HistoricoMetasLucroModal.jsx` | Criar — lista de arquivadas |
| `src/components/dashboard/MetasLucroSection.jsx` | Criar — orquestra grid + modais + empty state |
| `src/pages/Dashboard.jsx` | Editar — montar `MetasLucroSection` após o hero |
| `src/lib/activity.js` | Usar (sem editar) — logar `criou/editou/arquivou/excluiu meta_lucro` |

## Edge Cases

- Sem transações no período → `lucro_atual = 0`, progresso = 0%, card mostra normalmente.
- `data_limite` no passado ao criar → bloquear no form.
- `data_inicio` futura → não suportado nesta versão (sempre = hoje na criação).
- Múltiplas metas com mesmo período → permitido, cada uma calcula independente.
- Transação editada/removida → próximo render do Dashboard reflete o novo lucro (refresh do `useCaixa`).
- Auto-update de status `expirada/concluida` ao detectar deadline passada → roda uma vez por sessão na montagem do hook, idempotente.

## Fora de escopo (não fazer agora)

- Gráfico de projeção/burndown da meta
- Notificações quando próximo da deadline
- Meta recorrente (mensal automática)
- Edição de `data_inicio`
- Vincular meta a funcionário específico
- Exportar relatório de meta

## Testes manuais (golden path)

1. Criar meta "Teste" com alvo R$ 1.000 e deadline +30 dias → aparece card com 0%.
2. Lançar transação receita R$ 500 (data hoje) no Caixa → recarregar Dashboard → card mostra R$ 500 / R$ 1.000 (50%).
3. Lançar despesa R$ 200 → card mostra R$ 300 / R$ 1.000 (30%).
4. Criar segunda meta → ambas aparecem em grid, primeira inalterada.
5. Editar meta → modal carrega valores, salvar reflete imediato.
6. Arquivar meta → some do grid, aparece em "Ver arquivadas".
7. Criar meta com `data_limite` no passado → form bloqueia submit.
