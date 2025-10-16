import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/auth/privy-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { fileName } = req.body || {}
  if (!fileName || typeof fileName !== 'string') return res.status(400).json({ error: 'fileName requerido' })
  const ext = fileName.includes('.') ? fileName.split('.').pop() : 'png'
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabaseAdmin.storage.from('ambitecas').createSignedUploadUrl(path)
  if (error || !data) return res.status(500).json({ error: 'No se pudo firmar' })
  const publicUrl = supabaseAdmin.storage.from('ambitecas').getPublicUrl(path).data.publicUrl
  return res.status(200).json({ ok: true, path, uploadUrl: data.signedUrl, publicUrl })
})


