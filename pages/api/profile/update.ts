import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyPrivyToken } from '@/lib/auth/privy-server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const authed = await verifyPrivyToken(req)
    if (!authed) return res.status(401).json({ error: 'No autorizado' })

    const { full_name, phone, doc_type, doc_number, address, birth_date, avatar_url } = req.body || {}

    const clean = (v: any) => (v === '' || v === undefined ? null : v)
    const hasText = (v: any) => !(v === '' || v === undefined || v === null)
    const providedDoc = hasText(doc_type) && hasText(doc_number)
    const hasPersonPayload = providedDoc || hasText(address) || hasText(birth_date) || hasText(avatar_url)

    // Encontrar profile por privy_user_id
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('privy_user_id', authed.id)
      .single()

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' })
    }

    // Actualizar profiles básicos
    const { data: updatedProfile, error: updateProfileErr } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: clean(full_name) ?? profile.full_name,
        phone: clean(phone) ?? profile.phone,
      })
      .eq('user_id', profile.user_id)
      .select('*')
      .single()

    if (updateProfileErr) {
      return res.status(500).json({ error: 'Error al actualizar el perfil' })
    }

    // Asegurar persons (si hay payload de persona)
    let personId = profile.person_id as string | null
    if (hasPersonPayload) {
      if (!personId) {
        // Si se provee documento, intentar vincular o crear por (doc_type, doc_number)
        if (providedDoc) {
          const { data: existingByDoc } = await supabaseAdmin
            .from('persons')
            .select('id')
            .eq('doc_type', doc_type)
            .eq('doc_number', doc_number)
            .maybeSingle()

          if (existingByDoc?.id) {
            personId = existingByDoc.id
            // vincular perfil
            await supabaseAdmin.from('profiles').update({ person_id: personId }).eq('user_id', profile.user_id)
            // actualizar datos opcionales
            const { error: personUpdateErr } = await supabaseAdmin
              .from('persons')
              .update({
                full_name: full_name ?? profile.full_name ?? undefined,
                phone: clean(phone) ?? undefined,
                address: clean(address) ?? undefined,
                birth_date: clean(birth_date) ?? undefined,
                avatar_url: clean(avatar_url) ?? undefined,
              })
              .eq('id', personId)
            if (personUpdateErr) {
              return res.status(500).json({ error: 'No se pudieron actualizar tus datos', cause: personUpdateErr.message })
            }
          } else {
            // crear persona nueva solo si hay documento
            const { data: newPerson, error: personInsertErr } = await supabaseAdmin
              .from('persons')
              .insert({
                full_name: full_name ?? profile.full_name ?? 'Usuario',
                doc_type: doc_type,
                doc_number: String(doc_number),
                email: profile.email ?? null,
                phone: clean(phone) ?? profile.phone ?? null,
                address: clean(address),
                birth_date: clean(birth_date),
                avatar_url: clean(avatar_url),
              })
              .select('id')
              .single()
            if (personInsertErr) {
              return res.status(409).json({ error: 'No se pudieron actualizar tus datos', cause: personInsertErr.message })
            }
            personId = newPerson.id
            await supabaseAdmin.from('profiles').update({ person_id: personId }).eq('user_id', profile.user_id)
          }
        }
        // Si no hay documento, no creamos persona (campos opcionales)
      } else {
        // Actualizar persons existente
        // Si se intenta cambiar documento, validar conflicto
        if (providedDoc) {
          const { data: conflict } = await supabaseAdmin
            .from('persons')
            .select('id')
            .eq('doc_type', doc_type)
            .eq('doc_number', doc_number)
            .neq('id', personId)
            .maybeSingle()
          if (conflict?.id) {
            return res.status(409).json({ error: 'Ese documento ya está en uso por otra persona.' })
          }
        }
        const { error: personUpdateErr } = await supabaseAdmin
          .from('persons')
          .update({
            full_name: full_name ?? profile.full_name ?? undefined,
            doc_type: providedDoc ? (doc_type as any) : undefined,
            doc_number: providedDoc ? String(doc_number) : undefined,
            phone: clean(phone) ?? undefined,
            address: clean(address) ?? undefined,
            birth_date: clean(birth_date) ?? undefined,
            avatar_url: clean(avatar_url) ?? undefined,
          })
          .eq('id', personId)
        if (personUpdateErr) {
          return res.status(500).json({ error: 'No se pudieron actualizar tus datos', cause: personUpdateErr.message })
        }
      }
    }

    // Sincronizar metadata de auth.users (opcional pero visible en dashboard de Auth)
    try {
      await supabaseAdmin.auth.admin.updateUserById(profile.user_id, {
        user_metadata: {
          full_name: clean(full_name) ?? updatedProfile?.full_name ?? profile.full_name ?? undefined,
          phone: clean(phone) ?? updatedProfile?.phone ?? profile.phone ?? undefined,
        },
      })
    } catch (e) {
      console.warn('[profile/update] No se pudo actualizar user_metadata:', e)
    }

    // Devolver vista competa de usuario
    const { data: viewUser } = await supabaseAdmin
      .from('v_user_complete')
      .select('*')
      .eq('privy_user_id', authed.id)
      .single()

    return res.status(200).json({ ok: true, profile: viewUser, rawProfile: updatedProfile })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
