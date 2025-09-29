import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyPrivyToken } from '@/lib/auth/privy-server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const authed = await verifyPrivyToken(req)
    if (!authed) return res.status(401).json({ error: 'Unauthorized' })

    const { fileName } = req.body || {}
    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ error: 'fileName requerido' })
    }

    const ext = fileName.includes('.') ? fileName.split('.').pop() : 'png'
    const path = `${authed.id}/${Date.now()}.${ext}`

    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .createSignedUploadUrl(path)

    if (error || !data) {
      return res.status(500).json({ error: 'No se pudo generar URL de subida' })
    }

    const publicUrl = supabaseAdmin.storage.from('avatars').getPublicUrl(path).data.publicUrl

    return res.status(200).json({ ok: true, path, uploadUrl: data.signedUrl, publicUrl })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}


