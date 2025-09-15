import { createServerClient } from '@supabase/ssr';
import type { NextApiRequest } from 'next';

export function createSupabaseServer(req?: NextApiRequest, token?: string) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return (req as any)?.cookies?.[name];
        },
        set() {},
        remove() {},
      },
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    }
  );
}


