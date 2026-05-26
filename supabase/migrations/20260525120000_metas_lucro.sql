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
