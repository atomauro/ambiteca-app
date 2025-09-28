import { useEffect, useState } from 'react';
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
 * Hook para sincronizar usuario de Privy con Supabase
 * Se ejecuta automáticamente cuando el usuario se autentica
 */
export function useUserSync() {
  const { user, authenticated, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  
  const [state, setState] = useState<UserSyncState>({
    isLoading: false,
    isSynced: false,
    error: null,
    userProfile: null,
  });

  // Sincronizar usuario cuando se autentica
  useEffect(() => {
    if (authenticated && user && !state.isSynced && !state.isLoading) {
      syncUser();
    }
  }, [authenticated, user, state.isSynced, state.isLoading]);

  const syncUser = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Verificar si el usuario ya existe en Supabase
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('privy_user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let userProfile = existingProfile;

      // 2. Si no existe, crearlo
      if (!existingProfile) {
        const email = user.email?.address || null;
        const phone = user.phone?.number || null;

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            privy_user_id: user.id,
            email,
            phone,
            role: 'citizen',
            full_name: email ? email.split('@')[0] : `Usuario ${user.id.slice(-6)}`,
          })
          .select()
          .single();

        if (createError) throw createError;
        userProfile = newProfile;
      }

      // 3. Sincronizar wallets
      await syncWallets(userProfile.user_id);

      // 4. Actualizar last_login
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', userProfile.user_id);

      setState({
        isLoading: false,
        isSynced: true,
        error: null,
        userProfile,
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

  const syncWallets = async (userId: string) => {
    if (!wallets.length) return;

    try {
      // Sincronizar cada wallet
      for (const wallet of wallets) {
        const { error } = await supabase
          .from('user_wallets')
          .upsert({
            user_id: userId,
            privy_user_id: user!.id,
            address: wallet.address,
            chain_type: 'ethereum', // TODO: Determinar chain type correcto desde wallet
            wallet_client_type: wallet.walletClientType,
            is_embedded: wallet.walletClientType === 'privy',
          }, {
            onConflict: 'user_id,address,chain_type'
          });

        if (error) {
          console.error('Error syncing wallet:', wallet.address, error);
        }
      }
    } catch (error) {
      console.error('Error syncing wallets:', error);
    }
  };

  // Función para forzar re-sincronización
  const forceSync = async () => {
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
    plvBalance: state.userProfile?.plv_balance || 0,
  };
}