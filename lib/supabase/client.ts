import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// Función para crear cliente (para compatibilidad)
export function createClient() {
  return supabase;
}
