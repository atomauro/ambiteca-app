-- Perfil: campos adicionales para datos de usuario

-- Nuevos campos en persons
ALTER TABLE public.persons 
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Índices opcionales (si se consultan por fecha o dirección, pueden omitirse)
-- CREATE INDEX IF NOT EXISTS idx_persons_birth_date ON public.persons (birth_date);


