import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/auth/privy-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Mock: marcar transacción como enviada onchain con un hash simulado
export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { delivery_id } = (req.body || {}) as { delivery_id?: string }
    if (!delivery_id) return res.status(400).json({ error: 'Falta delivery_id' })

    // Buscar tx pendiente
    const { data: tx } = await supabaseAdmin
      .from('ppv_transactions')
      .select('id, status')
      .eq('delivery_id', delivery_id)
      .eq('reason', 'delivery')
      .order('created_at', { ascending: false })
      .maybeSingle()
    if (!tx?.id) return res.status(404).json({ error: 'Transacción no encontrada' })
    if (tx.status === 'sent') return res.status(200).json({ ok: true, already_sent: true })

    const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0')
    const { error } = await supabaseAdmin
      .from('ppv_transactions')
      .update({ note: `onchain:${txHash}`, tx_hash: txHash, status: 'sent' })
      .eq('id', tx.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, tx_hash: txHash })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Error' })
  }
})


