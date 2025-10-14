import { useEffect, useState, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

interface UserSyncState {
  isLoading: boolean;
  isSynced: boolean;
  error: string | null;
  userProfile: any | null;
}

/**
 * Hook para sincronizar usuario de Privy con Supabase (sin webhooks)
 * 1) Llama a /api/auth/link-supabase (Service Role) para asegurar usuario + profile
 * 2) Sincroniza wallets y marca last_login
 */
export function useUserSync() {
  const { user, authenticated, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const attemptedRef = useRef(false);
  
  const [state, setState] = useState<UserSyncState>({
    isLoading: false,
    isSynced: false,
    error: null,
    userProfile: null,
  });

  // Sincronizar usuario cuando se autentica
  useEffect(() => {
    if (authenticated && user && !state.isSynced && !state.isLoading && !attemptedRef.current) {
      attemptedRef.current = true;
      syncUser();
    }
  }, [authenticated, user, state.isSynced, state.isLoading]);

  const syncUser = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1) Asegurar usuario+perfil en Supabase vía endpoint server-side (sin webhooks)
      const privyToken = await getAccessToken();
      const resp = await fetch('/api/auth/link-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(privyToken ? { Authorization: `Bearer ${privyToken}` } : {}),
        },
        body: JSON.stringify({
          wallets: wallets.map(w => ({
            address: w.address,
            chain_type: 'ethereum',
            wallet_client_type: w.walletClientType,
            is_embedded: w.walletClientType === 'privy',
          }))
        })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error('link-supabase failed:', err);
        throw new Error(err.error || 'No se pudo enlazar con Supabase');
      }
      const { supabaseUserId } = await resp.json();

      // 2) Obtener perfil completo desde la vista
      const freshProfile = await refreshProfile();

      setState({
        isLoading: false,
        isSynced: true,
        error: null,
        userProfile: freshProfile,
      });

    } catch (error) {
      console.error('Error syncing user:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  };

  // Función para forzar re-sincronización
  const forceSync = async () => {
    attemptedRef.current = false;
    setState(prev => ({ ...prev, isSynced: false }));
    await syncUser();
  };

  // Función para obtener perfil actualizado
  const refreshProfile = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('v_user_complete')
        .select('*')
        .eq('privy_user_id', user.id)
        .single();

      if (error) throw error;

      setState(prev => ({ ...prev, userProfile: data }));
      return data;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  };

  return {
    ...state,
    forceSync,
    refreshProfile,
    // Información derivada
    hasEmbeddedWallet: state.userProfile?.has_embedded_wallet || false,
    primaryWalletAddress: state.userProfile?.primary_wallet_address || null,
    plvBalance: state.userProfile?.ppv_balance || state.userProfile?.plv_balance || 0,
  };
}