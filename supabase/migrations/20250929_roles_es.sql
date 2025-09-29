-- Renombrar enum role a español: admin, assistant, citizen -> admin, asistente, ciudadano
DO $$
BEGIN
  -- agregar nuevos labels si no existen
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname='role' AND e.enumlabel='asistente') THEN
    ALTER TYPE role ADD VALUE IF NOT EXISTS 'asistente';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname='role' AND e.enumlabel='ciudadano') THEN
    ALTER TYPE role ADD VALUE IF NOT EXISTS 'ciudadano';
  END IF;
  -- migrar datos
  UPDATE public.profiles SET role='asistente' WHERE role='assistant';
  UPDATE public.profiles SET role='ciudadano' WHERE role='citizen';
END $$;

-- Opcional: políticas referencian 'admin' y 'assistant' por texto en funciones; mantener compat temporal
-- A futuro, actualizar funciones/políticas para usar 'asistente' en lugar de 'assistant'

