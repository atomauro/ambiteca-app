import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Cron sin auth: en producción proteger con token/cron secret
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    // Buscar hasta 20 transacciones pendientes de onchain
    const { data: pendings, error } = await supabaseAdmin
      .from('ppv_transactions')
      .select('id, delivery_id, amount_plv')
      .eq('status', 'pending')
      .eq('reason', 'delivery')
      .order('created_at', { ascending: true })
      .limit(20)
    if (error) return res.status(500).json({ error: error.message })

    const results: any[] = []
    for (const tx of pendings || []) {
      // Simular intento de award: generar hash y actualizar
      const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0')
      const { error: upErr } = await supabaseAdmin
        .from('ppv_transactions')
        .update({ status: 'sent', tx_hash: txHash, note: `cron:${txHash}` })
        .eq('id', tx.id)
      if (!upErr) results.push({ id: tx.id, tx_hash: txHash })
    }

    return res.status(200).json({ processed: results.length, results })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Error' })
  }
}


