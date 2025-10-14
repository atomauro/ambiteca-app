import type { NextApiRequest, NextApiResponse } from 'next'
import { PrivyClient } from '@privy-io/server-auth'
import { supabaseAdmin } from '../../../lib/supabase/admin'
import type { User } from '@supabase/supabase-js'
import { createHash } from 'crypto'

// Nota: Para crear usuarios en Supabase Auth se requiere la Service Role Key
// Requiere: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_PRIVY_APP_ID, PRIVY_APP_SECRET

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const body = (req.body ?? {}) as any
    const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, '')
    const cookieAuthToken = req.cookies['privy-token']
    const authToken = cookieAuthToken || headerAuthToken
    if (!authToken) {
      console.warn('[link-supabase] Falta el token de autenticación')
      return res.status(401).json({ error: 'Falta el token de autenticación' })
    }

    const claims = await privy.verifyAuthToken(authToken)
    const user = await privy.getUser(claims.userId)

    console.info('[link-supabase] privy_user_id:', user.id, {
      hasEmail: Boolean(user.email?.address),
      hasPhone: Boolean(user.phone?.number)
    })

    // 1) Asegurar usuario en Supabase Auth (idempotente por privy_user_id)
    // Derivar email real de manera robusta desde Privy
    const linkedEmails: string[] = Array.isArray((user as any)?.linkedAccounts)
      ? ((user as any).linkedAccounts
          .map((acc: any) => acc?.email?.address || acc?.email)
          .filter(Boolean))
      : []
    const providerEmail = (user as any)?.google?.email || (user as any)?.apple?.email
    const derivedEmail = user.email?.address || providerEmail || linkedEmails[0]
    const email = derivedEmail || undefined
    const phone = user.phone?.number
    // Email sintético seguro: local-part hex hash (<= 64 chars) + dominio válido
    const syntheticLocal = `pv_${createHash('sha256').update(user.id).digest('hex').slice(0, 24)}`
    const syntheticEmail = `${syntheticLocal}@privy.example.com`

    let supabaseUserId: string | null = null

    // Buscadores con paginación mínima
    const listUsersPage = async (page: number) => {
      return await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 })
    }

    const findUserId = async (predicate: (u: User) => boolean): Promise<string | null> => {
      for (let page = 1; page <= 25; page++) {
        const { data, error } = await listUsersPage(page)
        if (error) break
        const users = (data?.users ?? []) as User[]
        const found = users.find(predicate)
        if (found) return found.id
        if ((data?.users?.length ?? 0) < 200) break // no más páginas
      }
      return null
    }

    // Buscar por metadata de privy primero
    supabaseUserId = await findUserId((u) => (u.user_metadata as any)?.privy_user_id === user.id)

    // Buscar por email / teléfono si no se halló por metadata
    if (!supabaseUserId && email) {
      supabaseUserId = await findUserId((u) => (u.email || '').toLowerCase() === email.toLowerCase())
    }
    if (!supabaseUserId && phone) {
      supabaseUserId = await findUserId((u) => u.phone === phone)
    }
    if (!supabaseUserId) {
      supabaseUserId = await findUserId((u) => (u.email || '').toLowerCase() === syntheticEmail.toLowerCase())
    }

    const creationErrors: Array<{ stage: string; message: string }> = []

    // Crear si no existe
    if (!supabaseUserId) {
      // Intentar primero con email sintético (más determinista)
      console.info('[link-supabase] crear por email sintético (primero)')
      const { data: createdSynthFirst, error: createSynthFirstErr } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        user_metadata: { privy_user_id: user.id },
      })
      if (createSynthFirstErr) {
        creationErrors.push({ stage: 'create_synthetic_first', message: createSynthFirstErr.message || String(createSynthFirstErr) })
        console.warn('[link-supabase] creación por sintético (primero) fallida, se buscará:', createSynthFirstErr)
      } else {
        supabaseUserId = createdSynthFirst?.user?.id || null
      }
    }

    if (!supabaseUserId && email) {
      console.info('[link-supabase] crear por email')
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { privy_user_id: user.id },
      })
      if (createErr) {
        creationErrors.push({ stage: 'create_email', message: createErr.message || String(createErr) })
        console.warn('[link-supabase] creación por email fallida, se buscará:', createErr)
      } else {
        supabaseUserId = created?.user?.id || null
      }
    }

    if (!supabaseUserId && phone) {
      console.info('[link-supabase] crear por teléfono')
      const { data: createdPhone, error: createPhoneErr } = await supabaseAdmin.auth.admin.createUser({
        phone,
        phone_confirm: true,
        user_metadata: { privy_user_id: user.id },
      })
      if (createPhoneErr) {
        creationErrors.push({ stage: 'create_phone', message: createPhoneErr.message || String(createPhoneErr) })
        console.warn('[link-supabase] creación por teléfono fallida, se buscará:', createPhoneErr)
      } else {
        supabaseUserId = createdPhone?.user?.id || null
      }
    }

    if (!supabaseUserId) {
      console.info('[link-supabase] crear por email sintético')
      const { data: createdSynth, error: createSynthErr } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        user_metadata: { privy_user_id: user.id },
      })
      if (createSynthErr) {
        creationErrors.push({ stage: 'create_synthetic', message: createSynthErr.message || String(createSynthErr) })
        console.warn('[link-supabase] creación por sintético fallida, se buscará:', createSynthErr)
      } else {
        supabaseUserId = createdSynth?.user?.id || null
      }
    }

    // Rebuscar por cualquier campo si seguimos sin id
    if (!supabaseUserId) {
      supabaseUserId = await findUserId((u) => (u.user_metadata as any)?.privy_user_id === user.id)
        || (email ? await findUserId((u) => (u.email || '').toLowerCase() === email.toLowerCase()) : null)
        || (phone ? await findUserId((u) => u.phone === phone) : null)
        || (await findUserId((u) => (u.email || '').toLowerCase() === syntheticEmail.toLowerCase()))
    }

    if (!supabaseUserId) {
      console.error('[link-supabase] No se pudo resolver el ID de usuario', { creationErrors })
      return res.status(500).json({ error: 'No se pudo resolver el ID de usuario', cause: creationErrors })
    }

    // 2) Asegurar profile en tabla public.profiles
    const fullName = (user as any).google?.name || (user as any).apple?.name || user.email?.address?.split('@')[0] || `Usuario ${user.id.slice(-6)}`

    // Si ya existe, hacemos update para evitar conflictos en llamadas concurrentes
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', supabaseUserId)
      .maybeSingle()

    let profile: any = null
    if (existingProfile) {
      // Fetch existing profile with email field to decide whether to overwrite
      const { data: profileRow } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('user_id', supabaseUserId)
        .maybeSingle()
      const isSynthetic = typeof profileRow?.email === 'string' && /@privy\.example\.com$/.test(profileRow.email)
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: fullName,
          email: (email || isSynthetic) ? (email ?? profileRow?.email ?? null) : profileRow?.email ?? null,
          phone: phone || null,
          privy_user_id: user.id,
          person_id: null,
        })
        .eq('user_id', supabaseUserId)
        .select()
        .single()
      if (updateErr) {
        console.error('Error al actualizar el perfil:', updateErr)
        return res.status(500).json({ error: 'Error al actualizar o insertar el perfil' })
      }
      profile = updated
    } else {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: supabaseUserId,
          role: 'citizen',
          full_name: fullName,
          email: email ?? null,
          phone: phone || null,
          privy_user_id: user.id,
          person_id: null,
        })
        .select()
        .single()
      if (insertErr) {
        console.error('Error al insertar el perfil:', insertErr)
        return res.status(500).json({ error: 'Error al actualizar o insertar el perfil' })
      }
      profile = inserted
    }

    // 3) Sincronizar wallets (servidor) si se envían desde el cliente
    const wallets: Array<{ address: string; chain_type: string; wallet_client_type: string; is_embedded?: boolean }> = Array.isArray(body?.wallets) ? body.wallets : []
    if (wallets.length) {
      for (const w of wallets) {
        const { error: uwErr } = await supabaseAdmin
          .from('user_wallets')
          .upsert({
            user_id: supabaseUserId,
            privy_user_id: user.id,
            address: w.address,
            chain_type: w.chain_type || 'ethereum',
            wallet_client_type: w.wallet_client_type,
            is_embedded: Boolean(w.is_embedded),
          }, { onConflict: 'user_id,address,chain_type' })
        if (uwErr) {
          console.warn('[link-supabase] fallo al insertar o actualizar la wallet:', w.address, uwErr)
        }
      }
    }

    // 4) Actualizar last_login_at
    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', supabaseUserId)

    // 5) Devolver vista completa si existe
    const { data: viewUser, error: viewErr } = await supabaseAdmin
      .from('v_user_complete')
      .select('*')
      .eq('privy_user_id', user.id)
      .single()
    if (viewErr) {
      console.warn('[link-supabase] fallo al obtener la vista, devolviendo perfil base:', viewErr)
    }

    console.info('[link-supabase] éxito → supabaseUserId:', supabaseUserId)
    return res.status(200).json({ ok: true, supabaseUserId, profile: viewUser || profile })
  } catch (e: any) {
    console.error('error en link-supabase:', e)
    return res.status(500).json({ error: e.message })
  }
}
