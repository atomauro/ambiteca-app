-- Estado y hash onchain para transacciones PPV
alter table if exists public.ppv_transactions
  add column if not exists status text default 'pending',
  add column if not exists tx_hash text;

-- Índice único para evitar doble recompensa por entrega
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'uniq_ppv_tx_delivery_reason'
  ) then
    create unique index uniq_ppv_tx_delivery_reason
      on public.ppv_transactions (delivery_id)
      where reason = 'delivery';
  end if;
end $$;


