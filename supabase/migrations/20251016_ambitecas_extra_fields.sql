-- Campos extra para ambitecas
alter table if exists public.ambitecas
  add column if not exists contact_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists opening_hours text,
  add column if not exists notes text,
  add column if not exists image_url text;

-- Bucket de imágenes para ambitecas
insert into storage.buckets (id, name, public)
values ('ambitecas','ambitecas', true)
on conflict (id) do nothing;


