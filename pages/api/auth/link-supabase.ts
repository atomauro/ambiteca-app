import type { NextApiRequest, NextApiResponse } from 'next'
import { PrivyClient } from '@privy-io/server-auth'
import { supabaseAdmin } from '../../../lib/supabase/admin'
import type { User } from '@supabase/supabase-js'

// Nota: Para crear usuarios en Supabase Auth se requiere la Service Role Key
// Requiere: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_PRIVY_APP_ID, PRIVY_APP_SECRET

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, '')
    const cookieAuthToken = req.cookies['privy-token']
    const authToken = cookieAuthToken || headerAuthToken
    if (!authToken) return res.status(401).json({ error: 'Missing auth token' })

    const claims = await privy.verifyAuthToken(authToken)
    const user = await privy.getUser(claims.userId)

    // 1) Asegurar usuario en Supabase Auth
    const email = user.email?.address || undefined

    let supabaseUserId: string | null = null

    if (email) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { privy_user_id: user.id }
      })

      if (createErr && !createErr.message?.includes('already registered')) {
        console.error('Error creating user in Supabase:', createErr)
        return res.status(500).json({ error: 'Failed to ensure Supabase user' })
      }

      supabaseUserId = created?.user?.id || null

      if (!supabaseUserId) {
        const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 })
        if (listErr) {
          console.error('Error listing users:', listErr)
          return res.status(500).json({ error: 'Failed to find Supabase user' })
        }
        const users: User[] = usersData?.users ?? []
        const existing = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase())
        supabaseUserId = existing?.id || null
      }
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        phone: user.phone?.number,
        user_metadata: { privy_user_id: user.id }
      })
      if (createErr && !createErr.message?.includes('already registered')) {
        console.error('Error creating user in Supabase (no email):', createErr)
        return res.status(500).json({ error: 'Failed to ensure Supabase user (no email)' })
      }
      supabaseUserId = created?.user?.id || null
      if (!supabaseUserId) {
        const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 })
        if (listErr) {
          console.error('Error listing users:', listErr)
          return res.status(500).json({ error: 'Failed to find Supabase user (no email)' })
        }
        const users: User[] = usersData?.users ?? []
        const existing = users.find(u => u.phone === user.phone?.number)
        supabaseUserId = existing?.id || null
      }
    }

    if (!supabaseUserId) {
      return res.status(500).json({ error: 'Unable to resolve Supabase user id' })
    }

    // 2) Asegurar profile en tabla public.profiles
    const fullName = (user as any).google?.name || (user as any).apple?.name || user.email?.address?.split('@')[0] || `Usuario ${user.id.slice(-6)}`

    const { data: profile, error: upsertErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: supabaseUserId,
        role: 'citizen',
        full_name: fullName,
        phone: user.phone?.number || null,
        person_id: null
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (upsertErr) {
      console.error('Error upserting profile:', upsertErr)
      return res.status(500).json({ error: 'Failed to upsert profile' })
    }

    return res.status(200).json({ ok: true, supabaseUserId, profile })
  } catch (e: any) {
    console.error('link-supabase error:', e)
    return res.status(500).json({ error: e.message })
  }
}
