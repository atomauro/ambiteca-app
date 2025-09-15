-- RLS y funciones de PLV

-- Habilitar RLS
alter table public.profiles enable row level security;
alter table public.persons enable row level security;
alter table public.ambitecas enable row level security;
alter table public.materials enable row level security;
alter table public.material_conversion_rates enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_items enable row level security;
alter table public.plv_wallets enable row level security;
alter table public.plv_transactions enable row level security;
alter table public.rewards_catalog enable row level security;
alter table public.redemptions enable row level security;
alter table public.plv_claims enable row level security;

-- Políticas básicas
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for select using (auth.uid() = user_id);
drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles
  for select using ( exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='admin') );

drop policy if exists persons_read_self on public.persons;
create policy persons_read_self on public.persons
  for select using (
    exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = id)
  );

drop policy if exists deliveries_read_mine on public.deliveries;
create policy deliveries_read_mine on public.deliveries
  for select using (
    assistant_user_id = auth.uid() or
    exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = person_id)
  );

drop policy if exists delivery_items_read_mine on public.delivery_items;
create policy delivery_items_read_mine on public.delivery_items
  for select using (
    exists(select 1 from public.deliveries d where d.id = delivery_id and (d.assistant_user_id = auth.uid() or exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = d.person_id)))
  );

drop policy if exists wallets_read_owner on public.plv_wallets;
create policy wallets_read_owner on public.plv_wallets
  for select using (
    owner_type='person' and exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = owner_id)
  );

drop policy if exists plv_tx_read_owner on public.plv_transactions;
create policy plv_tx_read_owner on public.plv_transactions
  for select using (
    exists(select 1 from public.plv_wallets w where w.id = wallet_id and w.owner_type='person' and exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = w.owner_id))
  );

-- Funciones utilitarias
create or replace function public.ensure_person_wallet(p_person_id uuid)
returns uuid
language plpgsql
as $$
declare v_wallet_id uuid;
begin
  select id into v_wallet_id from public.plv_wallets where owner_type='person' and owner_id=p_person_id;
  if v_wallet_id is null then
    insert into public.plv_wallets (owner_type, owner_id) values ('person', p_person_id) returning id into v_wallet_id;
  end if;
  return v_wallet_id;
end;$$;

create or replace function public.find_rate(p_material uuid, p_ambiteca uuid, p_at timestamptz)
returns numeric
language sql
stable
as $$
  with candidate as (
    select plv_per_kg, row_number() over(order by (ambiteca_id is not null) desc, valid_from desc) as rn
    from public.material_conversion_rates
    where material_id = p_material
      and (ambiteca_id is null or ambiteca_id = p_ambiteca)
      and valid_from <= p_at::date
      and (valid_to is null or valid_to >= p_at::date)
  )
  select plv_per_kg from candidate where rn=1;
$$;

create or replace function public.calculate_plv_for_delivery(p_delivery_id uuid)
returns numeric
language plpgsql
as $$
declare v_plv numeric := 0; v_person uuid; v_amb uuid; v_time timestamptz;
begin
  select person_id, ambiteca_id, delivered_at into v_person, v_amb, v_time from public.deliveries where id = p_delivery_id;
  if v_person is null then return 0; end if;

  for v_plv in
    select sum(di.weight_kg * coalesce(public.find_rate(di.material_id, v_amb, v_time), 0))
    from public.delivery_items di where di.delivery_id = p_delivery_id
  loop
    exit;
  end loop;

  return coalesce(v_plv,0);
end;$$;

create or replace function public.award_plv_on_delivery()
returns trigger
language plpgsql
as $$
declare v_amount numeric; v_wallet uuid; v_person uuid;
begin
  if NEW.status = 'confirmed' then
    v_amount := public.calculate_plv_for_delivery(NEW.id);
    v_person := NEW.person_id;
    v_wallet := public.ensure_person_wallet(v_person);
    if v_amount > 0 then
      insert into public.plv_transactions (wallet_id, tx_type, amount_plv, reason, delivery_id, note)
      values (v_wallet, 'credit', v_amount, 'delivery', NEW.id, 'Auto award on confirmed delivery');
    end if;
  end if;
  return NEW;
end;$$;

drop trigger if exists trg_award_plv_on_delivery on public.deliveries;
create trigger trg_award_plv_on_delivery
after insert or update of status on public.deliveries
for each row execute function public.award_plv_on_delivery();


