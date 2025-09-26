'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { useUserSync } from '../lib/hooks/useUserSync';

// Componente interno para manejar la sincronización
function UserSyncHandler({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useUserSync();
  
  // Mostrar error si hay problemas de sincronización (opcional)
  if (error) {
    console.warn('User sync error:', error);
  }
  
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        // Habilitar social logins sin wallet login
        loginMethods: ['google', 'apple', 'email'],
        // Crear wallets embebidas para todos los usuarios
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
        // Configuración de apariencia
        appearance: {
          theme: 'light',
          accentColor: '#10b981', // Verde AMBITECA
          logo: '/logos/privy-logo.png',
        },
        // Configurar legal links
        legal: {
          termsAndConditionsUrl: '/terms',
          privacyPolicyUrl: '/privacy',
        },
      }}
    >
      <UserSyncHandler>
        {children}
      </UserSyncHandler>
    </PrivyProvider>
  );
}


