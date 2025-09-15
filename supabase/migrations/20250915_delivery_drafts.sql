-- Borradores de entregas (demo)
create table if not exists public.delivery_drafts (
  id uuid primary key default gen_random_uuid(),
  person_doc text not null,
  ambiteca_id text not null,
  material text not null,
  weight_kg numeric(18,3) not null,
  created_by uuid,
  created_at timestamptz default now()
);

alter table public.delivery_drafts enable row level security;

-- Políticas simples de demo (abrir lectura/escritura a usuarios autenticados)
drop policy if exists drafts_read_all on public.delivery_drafts;
create policy drafts_read_all on public.delivery_drafts for select using (auth.uid() is not null);
drop policy if exists drafts_write_all on public.delivery_drafts;
create policy drafts_write_all on public.delivery_drafts for all using (auth.uid() is not null) with check (auth.uid() is not null);


