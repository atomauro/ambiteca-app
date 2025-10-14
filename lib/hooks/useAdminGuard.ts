import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/client';

interface AdminGuardState {
  isLoading: boolean;
  isAuthorized: boolean;
  profile: any | null;
  error: string | null;
}

/**
 * Hook para proteger rutas de administrador
 * Verifica que el usuario esté autenticado y tenga rol de admin activo
 */
export function useAdminGuard() {
  const { user, authenticated, ready } = usePrivy();
  const router = useRouter();
  
  const [state, setState] = useState<AdminGuardState>({
    isLoading: true,
    isAuthorized: false,
    profile: null,
    error: null,
  });

  useEffect(() => {
    if (!ready) return;

    if (!authenticated || !user) return;

    checkAdminAccess();
  }, [ready, authenticated, user, router]);

  const checkAdminAccess = async () => {
    if (!user) {
      setState({
        isLoading: false,
        isAuthorized: false,
        profile: null,
        error: 'Usuario no autenticado',
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Buscar el perfil del usuario por privy_user_id
      const { data: profile, error: profileError } = await supabase
        .from('v_user_complete')
        .select('user_id, role, is_active')
        .eq('privy_user_id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        // Dirigir a dashboard para enlazar perfil si aún no existe
        router.push('/dashboard');
        setState({ isLoading: false, isAuthorized: false, profile: null, error: 'Perfil no encontrado' });
        return;
      }

      // Verificar que sea admin y esté activo
      const isAuthorized = profile.role === 'admin' && profile.is_active === true;

      if (!isAuthorized) {
        // Enviar a dashboard en lugar de loop a inicio
        router.push('/dashboard');
        setState({ isLoading: false, isAuthorized: false, profile, error: 'No tienes permisos de administrador' });
        return;
      }

      setState({
        isLoading: false,
        isAuthorized: true,
        profile,
        error: null,
      });

    } catch (error) {
      console.error('Error checking admin access:', error);
      
      setState({
        isLoading: false,
        isAuthorized: false,
        profile: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });

      // Evitar loop; enviar a dashboard para que sincronice
      router.push('/dashboard');
    }
  };

  // Función para refrescar permisos
  const refreshAccess = async () => {
    await checkAdminAccess();
  };

  return {
    ...state,
    refreshAccess,
    // Información derivada
    isAdmin: state.profile?.role === 'admin',
    isActive: state.profile?.is_active === true,
  };
}