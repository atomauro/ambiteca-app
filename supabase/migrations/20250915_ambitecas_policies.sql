-- Políticas de ambitecas (lectura para autenticados)
alter table public.ambitecas enable row level security;
drop policy if exists ambitecas_read on public.ambitecas;
create policy ambitecas_read on public.ambitecas for select using (auth.uid() is not null);

-- Escritura solo admin
drop policy if exists ambitecas_write_admin on public.ambitecas;
create policy ambitecas_write_admin on public.ambitecas for all using (
  exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='admin')
) with check (
  exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='admin')
);


