# Meta de Lucro com Prazo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o usuário crie múltiplas metas de lucro com valor alvo e data limite, com progresso calculado automaticamente a partir das transações do Caixa, exibidas como grid de cards no Dashboard.

**Architecture:** Nova tabela `metas_lucro` no Supabase (RLS ativa, múltiplas linhas com `status='ativa'` permitidas). Hook `useMetaLucro` carrega metas e cruza com transações do `useCaixa` no client. UI vive em `MetasLucroSection` montada no topo do Dashboard, composta por `MetaLucroCard` (apresentação), `MetaLucroForm` (criação/edição em modal), `HistoricoMetasLucroModal` (lista de arquivadas).

**Tech Stack:** Vite + React 19, Supabase (via `@supabase/supabase-js`), Tailwind v3, `date-fns`, `lucide-react`, MCP `apply_migration` para DDL.

**Spec de referência:** [docs/superpowers/specs/2026-05-25-meta-de-lucro-design.md](../specs/2026-05-25-meta-de-lucro-design.md)

**Notas pro executor:**
- Projeto NÃO tem framework de testes (sem `vitest`/`jest`). Verificação é manual no dev server (`npm run dev`) ou via Playwright MCP. Cada task termina com checagem visual antes do commit.
- Idioma: código em inglês, copy/UI em pt-BR (padrão Zênite).
- Estilo: Tailwind v3 (este projeto é v3, não v4 — não migrar).
- Commits: Conventional Commits em inglês.

---

## File Structure

| Arquivo | Tipo | Responsabilidade |
|---|---|---|
| `supabase/migrations/20260525120000_metas_lucro.sql` | criar | DDL: tabela `metas_lucro` + RLS + trigger updated_at |
| `src/hooks/useMetaLucro.js` | criar | Fetch de metas + cálculo de progresso a partir de transações + auto-update de expiradas/concluídas + CRUD |
| `src/components/dashboard/MetaLucroCard.jsx` | criar | Card individual com título, progresso, dias restantes, ritmo, menu de ações |
| `src/components/dashboard/MetaLucroForm.jsx` | criar | Form (título, valor alvo, data limite) usado em modal de criação/edição |
| `src/components/dashboard/HistoricoMetasLucroModal.jsx` | criar | Lista read-only de metas arquivadas/expiradas/concluídas |
| `src/components/dashboard/MetasLucroSection.jsx` | criar | Orquestra grid + modais + empty state + loading |
| `src/pages/Dashboard.jsx` | modificar | Importar e montar `MetasLucroSection` logo após o hero |

---

## Task 1: Criar migration da tabela `metas_lucro`

**Files:**
- Create: `supabase/migrations/20260525120000_metas_lucro.sql`

- [ ] **Step 1: Criar arquivo de migration**

Conteúdo de `supabase/migrations/20260525120000_metas_lucro.sql`:

```sql
-- metas_lucro: profit goals with deadline, multiple active allowed
create table if not exists public.metas_lucro (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  valor_alvo numeric(12, 2) not null check (valor_alvo > 0),
  data_inicio date not null default current_date,
  data_limite date not null,
  status text not null default 'ativa'
    check (status in ('ativa', 'concluida', 'expirada', 'arquivada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint metas_lucro_data_check check (data_limite > data_inicio)
);

-- index for the common query: list active goals ordered by deadline
create index if not exists metas_lucro_status_data_limite_idx
  on public.metas_lucro (status, data_limite);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_metas_lucro_updated_at on public.metas_lucro;
create trigger trg_metas_lucro_updated_at
  before update on public.metas_lucro
  for each row execute function public.set_updated_at();

-- RLS
alter table public.metas_lucro enable row level security;

drop policy if exists "authenticated read metas_lucro" on public.metas_lucro;
create policy "authenticated read metas_lucro" on public.metas_lucro
  for select to authenticated using (true);

drop policy if exists "authenticated insert metas_lucro" on public.metas_lucro;
create policy "authenticated insert metas_lucro" on public.metas_lucro
  for insert to authenticated with check (true);

drop policy if exists "authenticated update metas_lucro" on public.metas_lucro;
create policy "authenticated update metas_lucro" on public.metas_lucro
  for update to authenticated using (true) with check (true);

drop policy if exists "authenticated delete metas_lucro" on public.metas_lucro;
create policy "authenticated delete metas_lucro" on public.metas_lucro
  for delete to authenticated using (true);
```

- [ ] **Step 2: Aplicar migration via MCP Supabase**

Usar a ferramenta MCP `mcp__72d5ad5e-f2df-42da-a132-5d2968bf6e97__apply_migration` com:
- `name`: `metas_lucro_initial`
- `query`: conteúdo do arquivo acima

Se a função `public.set_updated_at()` já existir no banco (outras tabelas podem usar), o `create or replace` é seguro — manter.

- [ ] **Step 3: Verificar criação no Supabase**

Rodar via MCP `mcp__72d5ad5e-f2df-42da-a132-5d2968bf6e97__list_tables` (schemas: `["public"]`) e confirmar que `metas_lucro` aparece com RLS habilitado.

Rodar `mcp__72d5ad5e-f2df-42da-a132-5d2968bf6e97__get_advisors` (type: `"security"`) e confirmar zero novos avisos críticos relacionados a `metas_lucro`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260525120000_metas_lucro.sql
git commit -m "feat(db): add metas_lucro table with RLS"
```

---

## Task 2: Criar hook `useMetaLucro` (fetch + CRUD + cálculo de progresso)

**Files:**
- Create: `src/hooks/useMetaLucro.js`

- [ ] **Step 1: Criar o hook com fetch básico**

Conteúdo inicial de `src/hooks/useMetaLucro.js`:

```js
import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { logActivity } from '../lib/activity'
import { differenceInCalendarDays, parseISO } from 'date-fns'

/**
 * Manages profit goals (metas_lucro) and derives live progress from transactions.
 * @param {Array} transacoes - transactions list from useCaixa (same shape, with `data`, `tipo`, `valor`)
 */
export function useMetaLucro(transacoes = []) {
  const [metas, setMetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMetas = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('metas_lucro')
      .select('*')
      .order('data_limite', { ascending: true })
    if (error) setError(error.message)
    else setMetas(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMetas() }, [fetchMetas])

  return {
    metas,
    loading,
    error,
    refresh: fetchMetas,
  }
}
```

- [ ] **Step 2: Adicionar cálculo derivado de progresso**

Adicionar dentro de `useMetaLucro`, antes do `return`:

```js
const today = new Date()
const todayIso = today.toISOString().slice(0, 10)

const metasComProgresso = useMemo(() => {
  return metas.map((m) => {
    const fimJanela = m.data_limite < todayIso ? m.data_limite : todayIso
    const lucroAtual = transacoes.reduce((acc, t) => {
      if (!t.data) return acc
      if (t.data < m.data_inicio) return acc
      if (t.data > fimJanela) return acc
      const v = Number(t.valor) || 0
      return acc + (t.tipo === 'receita' ? v : -v)
    }, 0)

    const alvo = Number(m.valor_alvo) || 0
    const progressoPct = alvo > 0 ? Math.min(100, Math.max(0, (lucroAtual / alvo) * 100)) : 0
    const diasRestantes = Math.max(0, differenceInCalendarDays(parseISO(m.data_limite), today))
    const restante = Math.max(0, alvo - lucroAtual)
    const ritmoNecessario = diasRestantes > 0 ? restante / diasRestantes : 0
    const atingida = lucroAtual >= alvo
    const expirada = m.data_limite < todayIso

    return {
      ...m,
      lucroAtual,
      progressoPct,
      diasRestantes,
      ritmoNecessario,
      atingida,
      expirada,
    }
  })
}, [metas, transacoes, todayIso])
```

E mudar o `return` para expor `metasComProgresso`:

```js
return {
  metas: metasComProgresso,
  loading,
  error,
  refresh: fetchMetas,
}
```

- [ ] **Step 3: Adicionar CRUD (add, update, archive, remove)**

Adicionar antes do `return`:

```js
async function addMeta({ titulo, valor_alvo, data_limite }) {
  const payload = {
    titulo: titulo?.trim() || null,
    valor_alvo: Number(valor_alvo),
    data_limite,
  }
  const { error } = await supabase.from('metas_lucro').insert([payload])
  if (error) throw error
  await fetchMetas()
  logActivity({
    action: 'criou',
    entity_type: 'meta_lucro',
    entity_name: payload.titulo ?? 'Meta de lucro',
    meta: { valor_alvo: payload.valor_alvo, data_limite },
  })
}

async function updateMeta(id, { titulo, valor_alvo, data_limite }) {
  const patch = {
    titulo: titulo?.trim() || null,
    valor_alvo: Number(valor_alvo),
    data_limite,
  }
  const { error } = await supabase.from('metas_lucro').update(patch).eq('id', id)
  if (error) throw error
  await fetchMetas()
  logActivity({
    action: 'editou',
    entity_type: 'meta_lucro',
    entity_name: patch.titulo ?? 'Meta de lucro',
  })
}

async function archiveMeta(id) {
  const m = metas.find(x => x.id === id)
  const { error } = await supabase
    .from('metas_lucro')
    .update({ status: 'arquivada' })
    .eq('id', id)
  if (error) throw error
  await fetchMetas()
  logActivity({
    action: 'arquivou',
    entity_type: 'meta_lucro',
    entity_name: m?.titulo ?? 'Meta de lucro',
  })
}

async function removeMeta(id) {
  const m = metas.find(x => x.id === id)
  const { error } = await supabase.from('metas_lucro').delete().eq('id', id)
  if (error) throw error
  await fetchMetas()
  logActivity({
    action: 'excluiu',
    entity_type: 'meta_lucro',
    entity_name: m?.titulo ?? 'Meta de lucro',
  })
}
```

Atualizar `return` final:

```js
return {
  metas: metasComProgresso,
  loading,
  error,
  refresh: fetchMetas,
  addMeta,
  updateMeta,
  archiveMeta,
  removeMeta,
}
```

- [ ] **Step 4: Adicionar auto-update de status para expiradas/concluídas**

Adicionar `useEffect` separado após o `useEffect` inicial de fetch:

```js
useEffect(() => {
  if (loading) return
  const todayStr = new Date().toISOString().slice(0, 10)
  const aAtualizar = metas.filter(
    m => m.status === 'ativa' && m.data_limite < todayStr
  )
  if (aAtualizar.length === 0) return

  ;(async () => {
    for (const m of aAtualizar) {
      const progressoMeta = metasComProgresso.find(x => x.id === m.id)
      const novoStatus = progressoMeta?.atingida ? 'concluida' : 'expirada'
      await supabase.from('metas_lucro').update({ status: novoStatus }).eq('id', m.id)
    }
    await fetchMetas()
  })().catch(() => {})
}, [loading, metas, metasComProgresso, fetchMetas])
```

Nota: este efeito é idempotente — só roda para metas `ativa` cuja `data_limite` já passou.

- [ ] **Step 5: Verificar sintaxe e que o dev server não quebra**

```bash
npm run dev
```

Abrir o app, fazer login. Esperado: app continua funcionando, sem erros no console (o hook ainda não está usado em nenhuma página, só não pode ter erro de import/sintaxe).

Encerrar dev server.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useMetaLucro.js
git commit -m "feat(hooks): add useMetaLucro with progress derivation and CRUD"
```

---

## Task 3: Criar componente `MetaLucroForm`

**Files:**
- Create: `src/components/dashboard/MetaLucroForm.jsx`

- [ ] **Step 1: Criar o form**

Conteúdo de `src/components/dashboard/MetaLucroForm.jsx`:

```jsx
import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Loader2 } from 'lucide-react'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function tomorrowIso() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function MetaLucroForm({ inicial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    titulo: inicial?.titulo ?? '',
    valor_alvo: inicial?.valor_alvo ?? '',
    data_limite: inicial?.data_limite ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)

    const valor = Number(form.valor_alvo)
    if (!valor || valor <= 0) {
      setErro('Valor alvo deve ser maior que zero.')
      return
    }
    if (!form.data_limite) {
      setErro('Defina uma data limite.')
      return
    }
    if (!inicial && form.data_limite <= todayIso()) {
      setErro('Data limite deve ser futura.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        titulo: form.titulo,
        valor_alvo: valor,
        data_limite: form.data_limite,
      })
    } catch (err) {
      setErro(err?.message ?? 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título (opcional)"
        value={form.titulo}
        onChange={e => set('titulo', e.target.value)}
        placeholder="Ex: Meta Q2, Inauguração"
        maxLength={80}
      />
      <Input
        label="Valor alvo (R$)"
        type="number"
        step="0.01"
        min="0.01"
        value={form.valor_alvo}
        onChange={e => set('valor_alvo', e.target.value)}
        required
        placeholder="0,00"
      />
      <Input
        label="Data limite"
        type="date"
        value={form.data_limite}
        onChange={e => set('data_limite', e.target.value)}
        min={tomorrowIso()}
        required
      />

      {erro && (
        <p className="text-danger text-xs">{erro}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {inicial ? 'Salvar' : 'Criar meta'}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/MetaLucroForm.jsx
git commit -m "feat(ui): add MetaLucroForm component"
```

---

## Task 4: Criar componente `MetaLucroCard`

**Files:**
- Create: `src/components/dashboard/MetaLucroCard.jsx`

- [ ] **Step 1: Criar o card**

Conteúdo de `src/components/dashboard/MetaLucroCard.jsx`:

```jsx
import { useState, useRef, useEffect } from 'react'
import { ProgressBar } from '../ui/ProgressBar'
import { Badge } from '../ui/Badge'
import { MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react'
import { formatarMoeda, formatarDataCurta } from '../../lib/formatters'

export function MetaLucroCard({ meta, onEdit, onArchive, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const progressoStatus =
    meta.status === 'concluida' || meta.atingida ? 'atingida' :
    meta.status === 'expirada' ? 'atrasada' :
    'em_andamento'

  return (
    <div className="card p-5 relative">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="label-caps mb-1">Meta de lucro</p>
          <p className="text-white font-bold text-sm truncate">
            {meta.titulo ?? 'Sem título'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {meta.atingida && meta.status === 'ativa' && (
            <Badge status="atingida">Atingida</Badge>
          )}
          {meta.status === 'concluida' && <Badge status="atingida">Concluída</Badge>}
          {meta.status === 'expirada' && <Badge status="atrasada">Expirada</Badge>}
          {meta.status === 'arquivada' && <Badge>Arquivada</Badge>}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              className="p-1.5 rounded-lg hover:bg-surface2 text-ink-muted hover:text-white transition-colors"
              aria-label="Ações"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 w-40 bg-surface2 border border-border rounded-lg shadow-xl py-1">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(meta) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-surface3 text-left"
                >
                  <Pencil size={12} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onArchive(meta) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-surface3 text-left"
                  disabled={meta.status !== 'ativa'}
                >
                  <Archive size={12} /> Arquivar
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onRemove(meta) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-surface3 text-left"
                >
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-2">
        <p className="font-display font-extrabold italic text-white text-2xl leading-none">
          {formatarMoeda(meta.lucroAtual)}
        </p>
        <p className="text-ink-muted text-xs font-semibold">
          de {formatarMoeda(meta.valor_alvo)}
        </p>
      </div>

      <ProgressBar value={meta.progressoPct} status={progressoStatus} showPercent />

      <div className="flex items-center justify-between mt-4 text-xs">
        <p className="text-ink-muted">
          {meta.status === 'ativa'
            ? `${meta.diasRestantes} ${meta.diasRestantes === 1 ? 'dia' : 'dias'} restantes`
            : `Até ${formatarDataCurta(meta.data_limite)}`}
        </p>
        {meta.status === 'ativa' && !meta.atingida && meta.diasRestantes > 0 && (
          <p className="text-white font-semibold">
            {formatarMoeda(meta.ritmoNecessario)}/dia
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar import de Badge funciona com prop `status` desconhecida**

Abrir `src/components/ui/Badge.jsx` e confirmar que aceita `status` arbitrário ou children livre. Se não aceitar, ajustar para usar children apenas (`<Badge>Arquivada</Badge>` deve renderizar como neutro).

Se `Badge` exigir um `status` específico, alterar os usos para:
- `<Badge status="atingida">Atingida</Badge>` (status conhecido)
- `<Badge status="atrasada">Expirada</Badge>`
- Para "Arquivada", usar `<span>` simples com classes do projeto: `<span className="label-caps text-ink-muted">Arquivada</span>`

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/MetaLucroCard.jsx
git commit -m "feat(ui): add MetaLucroCard with progress and actions menu"
```

---

## Task 5: Criar componente `HistoricoMetasLucroModal`

**Files:**
- Create: `src/components/dashboard/HistoricoMetasLucroModal.jsx`

- [ ] **Step 1: Criar o modal**

Conteúdo de `src/components/dashboard/HistoricoMetasLucroModal.jsx`:

```jsx
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { formatarMoeda, formatarDataCurta } from '../../lib/formatters'

const STATUS_BADGE = {
  concluida: { status: 'atingida', label: 'Concluída' },
  expirada: { status: 'atrasada', label: 'Expirada' },
  arquivada: { status: undefined, label: 'Arquivada' },
}

export function HistoricoMetasLucroModal({ isOpen, onClose, metas }) {
  const arquivadas = metas
    .filter(m => m.status !== 'ativa')
    .sort((a, b) => (a.data_limite < b.data_limite ? 1 : -1))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Histórico de metas de lucro" maxWidth="max-w-2xl">
      {arquivadas.length === 0 ? (
        <p className="text-ink-muted text-sm py-6 text-center">
          Nenhuma meta arquivada ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {arquivadas.map(m => {
            const badge = STATUS_BADGE[m.status] ?? STATUS_BADGE.arquivada
            return (
              <div key={m.id} className="border border-border rounded-lg p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {m.titulo ?? 'Sem título'}
                  </p>
                  <p className="text-ink-muted text-xs mt-0.5">
                    {formatarDataCurta(m.data_inicio)} → {formatarDataCurta(m.data_limite)}
                  </p>
                  <p className="text-ink-muted text-xs mt-1">
                    {formatarMoeda(m.lucroAtual)} de {formatarMoeda(m.valor_alvo)}
                  </p>
                </div>
                <Badge status={badge.status}>{badge.label}</Badge>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/HistoricoMetasLucroModal.jsx
git commit -m "feat(ui): add HistoricoMetasLucroModal"
```

---

## Task 6: Criar componente `MetasLucroSection` (orquestrador)

**Files:**
- Create: `src/components/dashboard/MetasLucroSection.jsx`

- [ ] **Step 1: Criar a seção**

Conteúdo de `src/components/dashboard/MetasLucroSection.jsx`:

```jsx
import { useState } from 'react'
import { useMetaLucro } from '../../hooks/useMetaLucro'
import { useToast } from '../ui/Toast'
import { Button } from '../ui/Button'
import { Modal, ConfirmModal } from '../ui/Modal'
import { EmptyState } from '../ui/EmptyState'
import { MetaLucroCard } from './MetaLucroCard'
import { MetaLucroForm } from './MetaLucroForm'
import { HistoricoMetasLucroModal } from './HistoricoMetasLucroModal'
import { Plus, Target, Loader2, History } from 'lucide-react'

/**
 * @param {Array} transacoes - transactions from useCaixa (parent passes them down to avoid double-fetch)
 */
export function MetasLucroSection({ transacoes }) {
  const { metas, loading, addMeta, updateMeta, archiveMeta, removeMeta } = useMetaLucro(transacoes)
  const toast = useToast()
  const [modalForm, setModalForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [arquivando, setArquivando] = useState(null)
  const [removendo, setRemovendo] = useState(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)

  const ativas = metas.filter(m => m.status === 'ativa')
  const temArquivadas = metas.some(m => m.status !== 'ativa')

  async function handleSubmit(data) {
    try {
      if (editando) {
        await updateMeta(editando.id, data)
        toast.addToast('Meta atualizada.')
      } else {
        await addMeta(data)
        toast.addToast('Meta criada.')
      }
      setModalForm(false)
      setEditando(null)
    } catch {
      toast.addToast('Erro ao salvar.', 'error')
    }
  }

  async function confirmArchive() {
    if (!arquivando) return
    try {
      await archiveMeta(arquivando.id)
      toast.addToast('Meta arquivada.', 'warning')
    } catch {
      toast.addToast('Erro ao arquivar.', 'error')
    } finally {
      setArquivando(null)
    }
  }

  async function confirmRemove() {
    if (!removendo) return
    try {
      await removeMeta(removendo.id)
      toast.addToast('Meta excluída.', 'warning')
    } catch {
      toast.addToast('Erro ao excluir.', 'error')
    } finally {
      setRemovendo(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-caps mb-1">Resultado</p>
          <h2 className="font-display font-extrabold italic text-white uppercase text-xl sm:text-2xl leading-none">
            METAS DE LUCRO
          </h2>
        </div>
        <div className="flex gap-2">
          {temArquivadas && (
            <Button variant="secondary" onClick={() => setHistoricoAberto(true)}>
              <History size={14} /> Histórico
            </Button>
          )}
          <Button onClick={() => { setEditando(null); setModalForm(true) }}>
            <Plus size={14} /> Nova meta
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={20} className="animate-spin text-brand" />
        </div>
      ) : ativas.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta ativa"
          description="Defina um valor alvo e uma data limite para acompanhar seu lucro."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ativas.map(meta => (
            <MetaLucroCard
              key={meta.id}
              meta={meta}
              onEdit={(m) => { setEditando(m); setModalForm(true) }}
              onArchive={(m) => setArquivando(m)}
              onRemove={(m) => setRemovendo(m)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalForm}
        onClose={() => { setModalForm(false); setEditando(null) }}
        title={editando ? 'Editar meta de lucro' : 'Nova meta de lucro'}
      >
        <MetaLucroForm
          inicial={editando}
          onSubmit={handleSubmit}
          onCancel={() => { setModalForm(false); setEditando(null) }}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!arquivando}
        onClose={() => setArquivando(null)}
        onConfirm={confirmArchive}
        title="Arquivar meta"
        message={`Arquivar "${arquivando?.titulo ?? 'esta meta'}"? Ela some do Dashboard mas continua no histórico.`}
      />

      <ConfirmModal
        isOpen={!!removendo}
        onClose={() => setRemovendo(null)}
        onConfirm={confirmRemove}
        title="Excluir meta"
        message={`Excluir "${removendo?.titulo ?? 'esta meta'}" permanentemente? Esta ação não pode ser desfeita.`}
      />

      <HistoricoMetasLucroModal
        isOpen={historicoAberto}
        onClose={() => setHistoricoAberto(false)}
        metas={metas}
      />
    </section>
  )
}
```

Nota sobre o `ConfirmModal`: ele tem botão fixo "Excluir" em vermelho. Para o arquivar, o texto fica como "Excluir" mas isso é aceitável temporariamente — ou, se for incômodo, criar uma variante `ActionModal` no futuro. Manter por ora (YAGNI).

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/MetasLucroSection.jsx
git commit -m "feat(ui): add MetasLucroSection orchestrator"
```

---

## Task 7: Montar `MetasLucroSection` no Dashboard

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Importar o componente**

Adicionar no topo de `src/pages/Dashboard.jsx`, junto aos outros imports de componentes:

```jsx
import { MetasLucroSection } from '../components/dashboard/MetasLucroSection'
```

- [ ] **Step 2: Renderizar a seção após o hero**

Localizar o `return` da função `Dashboard` (linha ~172). Após o bloco `{/* ── Hero ── */}` (fechamento do `</div>` do hero — provavelmente perto da linha 200, depende), inserir:

```jsx
{/* ── Metas de lucro ── */}
<MetasLucroSection transacoes={transacoes} />
```

Como `transacoes` já vem de `useCaixa()` (linha 144), só passar como prop. Posicionar a seção **antes** dos `BigMetric` financeiros para dar protagonismo.

- [ ] **Step 3: Verificar visualmente no dev server**

```bash
npm run dev
```

Abrir o app, fazer login, ir pro Dashboard. Esperado:
- Seção "METAS DE LUCRO" aparece após o hero, antes das métricas financeiras.
- Sem metas ainda → mostra empty state com botão "Nova meta".
- Sem erros no console.

Encerrar dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat(dashboard): mount MetasLucroSection above financial metrics"
```

---

## Task 8: Smoke test end-to-end manual

**Files:**
- None (apenas verificação)

- [ ] **Step 1: Subir dev server**

```bash
npm run dev
```

- [ ] **Step 2: Testar golden path**

Executar manualmente no browser, na seguinte ordem:

1. **Criar primeira meta:** clicar em "Nova meta" → preencher título "Teste E2E", valor 1000, data limite +30 dias → submit. Esperado: card aparece com R$ 0 / R$ 1.000, 0%, "30 dias restantes".
2. **Lançar receita no Caixa:** ir em `/caixa` → adicionar receita R$ 500 com data de hoje → voltar ao Dashboard. Esperado: card mostra R$ 500 / R$ 1.000, 50%.
3. **Lançar despesa:** voltar em `/caixa` → adicionar despesa R$ 200 com data de hoje → voltar ao Dashboard. Esperado: card mostra R$ 300 / R$ 1.000, 30%.
4. **Criar segunda meta:** "Nova meta" novamente, título "Meta 2", valor 500, data limite +60 dias. Esperado: dois cards lado a lado em desktop, empilhados em mobile.
5. **Editar meta:** abrir menu `[···]` no primeiro card → Editar → mudar valor para 1500 → salvar. Esperado: card recalcula para 20%.
6. **Arquivar:** abrir menu → Arquivar → confirmar. Esperado: card some, botão "Histórico" aparece.
7. **Ver histórico:** clicar "Histórico" → modal lista a meta arquivada. Fechar.
8. **Excluir:** menu → Excluir → confirmar. Esperado: meta some também do histórico.
9. **Validações:** abrir "Nova meta" → tentar criar com valor 0 → erro inline. Data passada → erro inline.
10. **Responsivo:** redimensionar para 375px → cards empilham em 1 coluna, ações continuam acessíveis.

- [ ] **Step 3: Limpar dados de teste**

Remover as transações de teste do Caixa e excluir todas as metas criadas no smoke test.

- [ ] **Step 4: Encerrar dev server, commit final se houver algo pendente**

Se houver qualquer ajuste detectado no smoke test:

```bash
git add -A
git commit -m "fix(meta-lucro): ajustes pós smoke test"
```

Caso contrário, pular.

---

## Task 9: Atualizar README / atividade no painel (opcional)

**Files:**
- Modify: nenhum obrigatório

- [ ] **Step 1: Confirmar que `activity_log` registra corretamente**

Ir em `/atividade` (ou onde quer que o `useActivity` seja exibido) e verificar que aparecem entradas com `entity_type='meta_lucro'` para criar/editar/arquivar/excluir.

Se o componente que renderiza o feed de atividades não conhecer o `entity_type='meta_lucro'`, ele provavelmente cai num fallback genérico — aceitável. Não modificar a menos que esteja visivelmente quebrado.

- [ ] **Step 2: Não fazer commit se nada mudou**

---

## Self-Review Check

Cobertura do spec:
- [x] Modelo de dados (Task 1)
- [x] RLS + trigger updated_at (Task 1)
- [x] Múltiplas metas ativas (sem unique constraint — Task 1)
- [x] Cálculo de progresso a partir de transações (Task 2, Step 2)
- [x] Auto-update de status expirada/concluída (Task 2, Step 4)
- [x] CRUD completo (Task 2, Step 3)
- [x] Card com título, progresso, dias restantes, ritmo, menu (Task 4)
- [x] Form com validação (Task 3)
- [x] Modal de histórico (Task 5)
- [x] Empty state + grid responsivo (Task 6)
- [x] Montagem no Dashboard acima das métricas (Task 7)
- [x] Smoke test do golden path (Task 8)
- [x] Activity log via `lib/activity.js` (Task 2)
- [x] Edge cases (Task 8, Step 2, item 9)

Sem placeholders. Tipos/nomes consistentes (`metas`, `addMeta`, `updateMeta`, `archiveMeta`, `removeMeta` aparecem com a mesma assinatura em todos os pontos).
