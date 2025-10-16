-- Agregar stock y precio en COP a rewards_catalog
alter table if exists public.rewards_catalog
  add column if not exists stock integer,
  add column if not exists price_cop numeric(18,2);


