-- Políticas de materiales y tarifas
alter table public.materials enable row level security;
alter table public.material_conversion_rates enable row level security;

-- Lectura abierta a usuarios autenticados
drop policy if exists materials_read on public.materials;
create policy materials_read on public.materials for select using (auth.uid() is not null);

drop policy if exists rates_read on public.material_conversion_rates;
create policy rates_read on public.material_conversion_rates for select using (auth.uid() is not null);

-- Escritura solo admin
drop policy if exists materials_write_admin on public.materials;
create policy materials_write_admin on public.materials for all using (
  exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='admin')
) with check (
  exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='admin')
);

drop policy if exists rates_write_admin on public.material_conversion_rates;
create policy rates_write_admin on public.material_conversion_rates for all using (
  exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='admin')
) with check (
  exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='admin')
);


