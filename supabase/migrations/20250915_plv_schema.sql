-- AMBITECA APP - Esquema PLV, personas y reclamos
-- Ejecutar en Supabase (Postgres)

-- Extensiones necesarias
create extension if not exists postgis;

create type role as enum ('admin','assistant','citizen');
create type doc_type as enum ('CC','TI','PP','CE','NIT','OTRO');
create type delivery_status as enum ('draft','confirmed','cancelled');
create type tx_type as enum ('credit','debit');
create type tx_reason as enum ('delivery','adjustment','redemption');
create type redemption_status as enum ('pending','approved','rejected','cancelled');

-- profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role role not null default 'citizen',
  full_name text,
  phone text,
  person_id uuid unique,
  created_at timestamptz default now()
);

-- persons
create table if not exists public.persons (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  doc_type doc_type not null,
  doc_number text not null,
  email text,
  phone text,
  link_code text unique,
  preferred_chain text,
  preferred_wallet_address text,
  created_at timestamptz default now(),
  unique (doc_type, doc_number)
);

-- wallets lógicas (offchain / onchain)
create table if not exists public.plv_wallets (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('person','ambiteca','system')),
  owner_id uuid not null,
  created_at timestamptz default now(),
  unique (owner_type, owner_id)
);

-- catálogo
create table if not exists public.ambitecas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text default 'San Luis',
  state text default 'Antioquia',
  location geography(Point,4326),
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'kg',
  is_active boolean default true
);

create table if not exists public.material_conversion_rates (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id),
  ambiteca_id uuid references public.ambitecas(id) on delete cascade,
  plv_per_kg numeric(18,6) not null,
  valid_from date not null,
  valid_to date,
  created_by uuid references public.profiles(user_id),
  created_at timestamptz default now(),
  check (valid_to is null or valid_to >= valid_from)
);

-- operación
create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id),
  assistant_user_id uuid not null references public.profiles(user_id),
  ambiteca_id uuid not null references public.ambitecas(id),
  delivered_at timestamptz not null default now(),
  status delivery_status not null default 'confirmed'
);

create table if not exists public.delivery_items (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  material_id uuid not null references public.materials(id),
  weight_kg numeric(18,3) not null check (weight_kg > 0)
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null unique references public.deliveries(id) on delete cascade,
  receipt_number text unique,
  pdf_url text,
  created_at timestamptz default now()
);

-- ledger PLV
create table if not exists public.plv_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.plv_wallets(id) on delete cascade,
  tx_type tx_type not null,
  amount_plv numeric(18,6) not null check (amount_plv > 0),
  reason tx_reason not null,
  delivery_id uuid references public.deliveries(id) on delete set null,
  redemption_id uuid,
  note text,
  created_at timestamptz default now()
);

create or replace view public.v_plv_balances as
select wallet_id,
       sum(case when tx_type='credit' then amount_plv else -amount_plv end) as balance_plv
from public.plv_transactions
group by wallet_id;

-- canjes y reclamos
create table if not exists public.rewards_catalog (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cost_plv numeric(18,6) not null check (cost_plv > 0),
  is_active boolean default true,
  image_url text
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id),
  reward_id uuid not null references public.rewards_catalog(id),
  cost_plv numeric(18,6) not null,
  status redemption_status not null default 'pending',
  requested_at timestamptz default now(),
  decided_at timestamptz
);

create table if not exists public.plv_claims (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id),
  amount_plv numeric(18,6) not null check (amount_plv > 0),
  target_chain text,
  target_address text,
  status text not null default 'pending', -- pending|sent|failed
  tx_hash text,
  created_at timestamptz default now(),
  processed_at timestamptz
);

create table if not exists public.erc20_transfers (
  id uuid primary key default gen_random_uuid(),
  chain text,
  token_address text,
  from_address text,
  to_address text,
  amount numeric(38,18),
  tx_hash text,
  delivery_id uuid,
  redemption_id uuid,
  created_at timestamptz default now()
);

-- índices
create index if not exists idx_persons_doc on public.persons (doc_type, doc_number);
create index if not exists idx_deliveries_amb_date on public.deliveries (ambiteca_id, delivered_at);
create index if not exists idx_delivery_items_material on public.delivery_items (material_id);
create index if not exists idx_rates_valid on public.material_conversion_rates (material_id, valid_from, coalesce(valid_to, 'infinity'::date));
create index if not exists idx_plv_tx_wallet on public.plv_transactions (wallet_id, created_at);


