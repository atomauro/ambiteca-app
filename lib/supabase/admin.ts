import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente admin (Service Role) - USO EXCLUSIVO EN SERVIDOR
// Requiere la variable de entorno: SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey)
