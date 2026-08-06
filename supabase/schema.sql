-- =====================================================================
-- painel-sales-lab — recriação do banco
--
-- ATENÇÃO à procedência: o schema do projeto Supabase antigo NÃO pôde
-- ser extraído (o acesso à conta antiga caiu junto com o GitHub
-- deletado). Este script foi RECONSTRUÍDO a partir do código do repo
-- `zenite-studio/painel-sales-lab` em 06/08/2026:
--   - metas_lucro veio da migration versionada em supabase/migrations/
--   - as outras 6 tabelas vieram dos hooks em src/hooks/ e dos
--     formulários em src/pages/ (colunas, defaults e valores de check)
--
-- Isso significa que colunas nunca usadas pelo front podem estar
-- faltando. As tabelas estavam vazias, então não há perda de dado —
-- mas se algum campo antigo fizer falta, é só adicionar.
--
-- Para subir um projeto do zero: rode este arquivo inteiro, de uma vez,
-- no SQL Editor do Supabase. A pasta migrations/ fica como histórico —
-- este arquivo é o retrato do banco como ele está hoje.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABELAS
-- ---------------------------------------------------------------------

create table public.funcionarios (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  cargo       text,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.metas (
  id              uuid primary key default gen_random_uuid(),
  funcionario_id  uuid not null references public.funcionarios (id) on delete cascade,
  titulo          text not null,
  valor_alvo      numeric(12,2) not null,
  valor_atual     numeric(12,2) not null default 0,
  unidade         text not null default 'unidade',
  status          text not null default 'em_andamento'
                  check (status in ('em_andamento', 'atingida', 'atrasada')),
  mes_referencia  date not null,
  created_at      timestamptz not null default now()
);

create table public.leads (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  empresa         text,
  email           text,
  telefone        text,
  origem          text,
  estagio         text not null default 'lead'
                  check (estagio in ('lead', 'em_negociacao', 'proposta_enviada', 'cliente', 'perdido')),
  valor_estimado  numeric(12,2),
  notas           text,
  data_entrada    date not null default current_date,
  created_at      timestamptz not null default now()
);

create table public.transacoes (
  id                uuid primary key default gen_random_uuid(),
  tipo              text not null check (tipo in ('receita', 'despesa')),
  categoria         text not null,
  descricao         text not null,
  valor             numeric(12,2) not null,
  data              date not null default current_date,
  comprovante_path  text,
  comprovante_nome  text,
  created_at        timestamptz not null default now()
);

create table public.campanhas (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null,
  plataforma       text not null default 'Meta Ads',
  orcamento_total  numeric(12,2) not null default 0,
  valor_investido  numeric(12,2) not null default 0,
  receita_gerada   numeric(12,2) not null default 0,
  data_inicio      date,
  data_fim         date,
  status           text not null default 'ativa'
                   check (status in ('ativa', 'pausada', 'encerrada')),
  notas            text,
  created_at       timestamptz not null default now()
);

create table public.activity_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete set null,
  user_email   text,
  action       text not null,
  entity_type  text not null,
  entity_name  text not null default '',
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create table public.metas_lucro (
  id           uuid primary key default gen_random_uuid(),
  titulo       text,
  valor_alvo   numeric(12,2) not null check (valor_alvo > 0),
  data_inicio  date not null default current_date,
  data_limite  date not null,
  status       text not null default 'ativa'
               check (status in ('ativa', 'concluida', 'expirada', 'arquivada')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint metas_lucro_data_check check (data_limite > data_inicio)
);

-- ---------------------------------------------------------------------
-- 2. ÍNDICES
-- ---------------------------------------------------------------------

create index metas_funcionario_mes_idx        on public.metas (funcionario_id, mes_referencia);
create index metas_mes_referencia_idx         on public.metas (mes_referencia);
create index leads_estagio_idx                on public.leads (estagio);
create index leads_data_entrada_idx           on public.leads (data_entrada desc);
create index transacoes_data_idx              on public.transacoes (data desc);
create index transacoes_tipo_idx              on public.transacoes (tipo);
create index campanhas_created_at_idx         on public.campanhas (created_at desc);
create index activity_log_created_at_idx      on public.activity_log (created_at desc);
create index metas_lucro_status_data_limite_idx on public.metas_lucro (status, data_limite);

-- ---------------------------------------------------------------------
-- 3. FUNÇÃO E TRIGGER
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_metas_lucro_updated_at
  before update on public.metas_lucro
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. RLS — painel interno, tudo exige login; anon não enxerga nada
-- ---------------------------------------------------------------------

alter table public.funcionarios  enable row level security;
alter table public.metas         enable row level security;
alter table public.leads         enable row level security;
alter table public.transacoes    enable row level security;
alter table public.campanhas     enable row level security;
alter table public.activity_log  enable row level security;
alter table public.metas_lucro   enable row level security;

do $$
declare t text;
begin
  foreach t in array array['funcionarios','metas','leads','transacoes','campanhas','metas_lucro']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (true)', t||'_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (true)', t||'_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (true) with check (true)', t||'_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (true)', t||'_delete', t);
  end loop;
end $$;

-- activity_log é histórico: escreve e lê, mas não edita nem apaga.
-- O insert exige que o user_id seja o próprio usuário logado.
create policy activity_log_select on public.activity_log
  for select to authenticated using (true);
create policy activity_log_insert on public.activity_log
  for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5. REALTIME (feed de atividade do dashboard)
-- ---------------------------------------------------------------------

alter publication supabase_realtime add table public.activity_log;

-- ---------------------------------------------------------------------
-- 6. STORAGE — comprovantes do caixa
-- ---------------------------------------------------------------------

-- Bucket privado: o app gera link temporário de 1h com createSignedUrl.
-- Limite e tipos batem com a validação do TransacaoForm.jsx (5 MB,
-- PDF/JPEG/PNG/WebP).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprovantes',
  'comprovantes',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy comprovantes_select on storage.objects
  for select to authenticated using (bucket_id = 'comprovantes');
create policy comprovantes_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'comprovantes');
create policy comprovantes_update on storage.objects
  for update to authenticated using (bucket_id = 'comprovantes');
create policy comprovantes_delete on storage.objects
  for delete to authenticated using (bucket_id = 'comprovantes');
