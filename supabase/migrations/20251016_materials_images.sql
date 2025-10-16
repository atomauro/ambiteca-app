-- Agregar columna de imagen a materiales
alter table if exists public.materials
  add column if not exists image_url text;

-- Crear buckets públicos para recompensas y materiales (idempotente)
insert into storage.buckets (id, name, public)
values ('rewards','rewards', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('materials','materials', true)
on conflict (id) do nothing;


