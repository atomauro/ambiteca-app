'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        // Habilitar social logins sin wallet login
        loginMethods: ['google', 'apple', 'facebook', 'email'],
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
      {children}
    </PrivyProvider>
  );
}


