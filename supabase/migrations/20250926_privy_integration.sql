-- Migración para integración con Privy webhooks
-- Ejecutar en Supabase

-- Agregar columnas a profiles para integración con Privy
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privy_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Crear índice para búsquedas rápidas por privy_user_id
CREATE INDEX IF NOT EXISTS idx_profiles_privy_user_id ON public.profiles(privy_user_id);

-- Tabla para registrar wallets de usuarios
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  privy_user_id TEXT NOT NULL,
  address TEXT NOT NULL,
  chain_type TEXT NOT NULL, -- 'ethereum', 'solana', etc.
  wallet_client_type TEXT NOT NULL, -- 'privy', 'metamask', etc.
  is_embedded BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, address, chain_type)
);

-- Índices para user_wallets
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON public.user_wallets(address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_privy_user_id ON public.user_wallets(privy_user_id);

-- Tabla para tracking de sesiones (analytics)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_user_id TEXT NOT NULL,
  session_started_at TIMESTAMPTZ NOT NULL,
  session_ended_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_privy_user_id ON public.user_sessions(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(session_started_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_wallets
DROP TRIGGER IF EXISTS update_user_wallets_updated_at ON public.user_wallets;
CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para las nuevas tablas

-- Políticas para user_wallets
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias wallets
CREATE POLICY "Users can view own wallets" ON public.user_wallets
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Los usuarios pueden insertar sus propias wallets (via webhook)
CREATE POLICY "Service can insert wallets" ON public.user_wallets
  FOR INSERT WITH CHECK (true); -- Solo via service role

-- Políticas para user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver sesiones
CREATE POLICY "Admins can view sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Solo service role puede insertar sesiones
CREATE POLICY "Service can insert sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

-- Función para obtener wallet principal de un usuario
CREATE OR REPLACE FUNCTION get_user_primary_wallet(user_uuid UUID)
RETURNS TABLE (
  address TEXT,
  chain_type TEXT,
  is_embedded BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uw.address,
    uw.chain_type,
    uw.is_embedded
  FROM public.user_wallets uw
  WHERE uw.user_id = user_uuid 
    AND uw.is_active = true
    AND uw.is_embedded = true -- Priorizar wallets embebidas
  ORDER BY uw.created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para sincronizar PLV wallet con wallet de blockchain
CREATE OR REPLACE FUNCTION sync_plv_wallet_with_blockchain()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se crea una nueva wallet embebida, asegurar que existe PLV wallet
  IF NEW.is_embedded = true AND NEW.chain_type = 'ethereum' THEN
    INSERT INTO public.plv_wallets (owner_type, owner_id)
    VALUES ('person', NEW.user_id)
    ON CONFLICT (owner_type, owner_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar PLV wallets
DROP TRIGGER IF EXISTS sync_plv_wallet_trigger ON public.user_wallets;
CREATE TRIGGER sync_plv_wallet_trigger
  AFTER INSERT ON public.user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION sync_plv_wallet_with_blockchain();

-- Vista para información completa de usuarios
CREATE OR REPLACE VIEW public.v_user_complete AS
SELECT 
  p.user_id,
  p.privy_user_id,
  p.full_name,
  p.email,
  p.phone,
  p.role,
  p.is_active,
  p.created_at,
  p.last_login_at,
  
  -- Wallet principal
  uw.address as primary_wallet_address,
  uw.chain_type as primary_wallet_chain,
  uw.is_embedded as has_embedded_wallet,
  
  -- Balance PLV
  COALESCE(plv_bal.balance_plv, 0) as plv_balance
  
FROM public.profiles p
LEFT JOIN public.user_wallets uw ON (
  uw.user_id = p.user_id 
  AND uw.is_embedded = true 
  AND uw.is_active = true
)
LEFT JOIN public.plv_wallets plv_w ON (
  plv_w.owner_type = 'person' 
  AND plv_w.owner_id = p.user_id
)
LEFT JOIN public.v_plv_balances plv_bal ON (
  plv_bal.wallet_id = plv_w.id
)
WHERE p.is_active = true;

-- Comentarios para documentación
COMMENT ON TABLE public.user_wallets IS 'Wallets de blockchain asociadas a usuarios via Privy';
COMMENT ON TABLE public.user_sessions IS 'Tracking de sesiones de usuarios para analytics';
COMMENT ON FUNCTION get_user_primary_wallet IS 'Obtiene la wallet principal (embebida) de un usuario';
COMMENT ON VIEW public.v_user_complete IS 'Vista completa de usuarios con wallets y balance PLV';
