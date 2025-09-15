'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SupabaseProvider, useSupabase } from './SupabaseProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <InnerPrivyProvider>{children}</InnerPrivyProvider>
    </SupabaseProvider>
  );
}

function InnerPrivyProvider({ children }: { children: React.ReactNode }) {
  const { loading, supabase, session } = useSupabase();

  async function getCustomAccessToken() {
    if (!session) return undefined;
    const { data, error } = await supabase.auth.getSession();
    if (error) return undefined;
    return data.session?.access_token || undefined;
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        customAuth: {
          isLoading: loading,
          getCustomAccessToken,
        },
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}


