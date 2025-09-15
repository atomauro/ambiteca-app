-- RLS completa por roles

-- Helper: es admin
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='admin');
$$;

-- Helper: es assistant
create or replace function public.is_assistant()
returns boolean language sql stable as $$
  select exists(select 1 from public.profiles p where p.user_id = auth.uid() and p.role='assistant');
$$;

-- PROFILES
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (auth.uid() = user_id);
create policy profiles_admin_read on public.profiles for select using (public.is_admin());

-- PERSONS
drop policy if exists persons_read_self on public.persons;
create policy persons_read_self on public.persons for select using (
  exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = id)
);
create policy persons_admin_read on public.persons for select using (public.is_admin());

-- DELIVERIES
drop policy if exists deliveries_read_mine on public.deliveries;
create policy deliveries_read_mine on public.deliveries for select using (
  assistant_user_id = auth.uid() or
  exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = person_id) or
  public.is_admin()
);
create policy deliveries_insert_assistant on public.deliveries for insert with check (public.is_assistant() or public.is_admin());
create policy deliveries_update_assistant on public.deliveries for update using (public.is_assistant() or public.is_admin());

-- DELIVERY_ITEMS
drop policy if exists delivery_items_read_mine on public.delivery_items;
create policy delivery_items_read_mine on public.delivery_items for select using (
  exists(select 1 from public.deliveries d where d.id = delivery_id and (
    d.assistant_user_id = auth.uid() or
    exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = d.person_id) or
    public.is_admin()))
);
create policy delivery_items_write_assistant on public.delivery_items for all using (
  exists(select 1 from public.deliveries d where d.id = delivery_id and (public.is_assistant() or public.is_admin()))
) with check (
  exists(select 1 from public.deliveries d where d.id = delivery_id and (public.is_assistant() or public.is_admin()))
);

-- WALLETS
drop policy if exists wallets_read_owner on public.plv_wallets;
create policy wallets_read_owner on public.plv_wallets for select using (
  owner_type='person' and exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = owner_id) or public.is_admin()
);

-- TRANSACTIONS
drop policy if exists plv_tx_read_owner on public.plv_transactions;
create policy plv_tx_read_owner on public.plv_transactions for select using (
  exists(select 1 from public.plv_wallets w where w.id = wallet_id and (
    (w.owner_type='person' and exists(select 1 from public.profiles pr where pr.user_id = auth.uid() and pr.person_id = w.owner_id)) or public.is_admin()
  ))
);


