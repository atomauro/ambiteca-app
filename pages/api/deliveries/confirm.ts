import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/auth/privy-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Item = { material_id: string; weight_kg: number }

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse, user) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { personDoc, ambiteca_id, items } = (req.body || {}) as { personDoc?: string; ambiteca_id?: string; items?: Item[] }
    if (!personDoc || !ambiteca_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Parámetros inválidos' })
    }

    // Resolver assistant_user_id por privy_user_id
    const { data: assistantProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id, role')
      .eq('privy_user_id', user.id)
      .maybeSingle()

    if (!assistantProfile?.user_id) return res.status(401).json({ error: 'Perfil de asistente no encontrado' })

    // Resolver o crear persona por doc
    const [doc_type, ...rest] = String(personDoc).split('-')
    const doc_number = rest.join('-')
    let personId: string | null = null
    const { data: existingPerson } = await supabaseAdmin
      .from('persons')
      .select('id')
      .eq('doc_type', doc_type || 'CC')
      .eq('doc_number', doc_number || '')
      .maybeSingle()
    if (existingPerson?.id) {
      personId = existingPerson.id
    } else {
      const { data: inserted, error: insPersonErr } = await supabaseAdmin
        .from('persons')
        .insert({ full_name: doc_number || 'Sin nombre', doc_type: (doc_type || 'CC') as any, doc_number })
        .select('id')
        .single()
      if (insPersonErr) return res.status(500).json({ error: insPersonErr.message })
      personId = inserted?.id || null
    }
    if (!personId) return res.status(500).json({ error: 'No se pudo resolver persona' })

    // Crear entrega
    const { data: delivery, error: delErr } = await supabaseAdmin
      .from('deliveries')
      .insert({ person_id: personId, assistant_user_id: assistantProfile.user_id, ambiteca_id, status: 'confirmed' })
      .select('id, delivered_at')
      .single()
    if (delErr) return res.status(500).json({ error: delErr.message })

    // Insertar items
    const itemsData = items.map(it => ({ delivery_id: delivery.id, material_id: it.material_id, weight_kg: Number(it.weight_kg || 0) }))
    const { error: itemsErr } = await supabaseAdmin.from('delivery_items').insert(itemsData)
    if (itemsErr) return res.status(500).json({ error: itemsErr.message })

    // Calcular PPV total segun tarifas vigentes
    const today = new Date().toISOString().slice(0,10)
    let totalPPV = 0
    for (const it of items) {
      const { data: rates } = await supabaseAdmin
        .from('material_conversion_rates')
        .select('ppv_per_kg, ambiteca_id, valid_from, valid_to, created_at')
        .eq('material_id', it.material_id)
        .lte('valid_from', today)
        .order('valid_from', { ascending: false })
        .order('created_at', { ascending: false })
      const matchAmb = (rates || []).find(r => r.ambiteca_id === ambiteca_id && (!r.valid_to || r.valid_to >= today))
      const matchGlobal = (rates || []).find(r => !r.ambiteca_id && (!r.valid_to || r.valid_to >= today))
      const rate = Number(matchAmb?.ppv_per_kg ?? matchGlobal?.ppv_per_kg ?? 0)
      totalPPV += rate * Number(it.weight_kg || 0)
    }

    // Asegurar wallet de persona
    const { data: existingWallet } = await supabaseAdmin
      .from('ppv_wallets')
      .select('id')
      .eq('owner_type', 'person')
      .eq('owner_id', personId)
      .maybeSingle()
    let walletId = existingWallet?.id as string | undefined
    if (!walletId) {
      const { data: w, error: wErr } = await supabaseAdmin.from('ppv_wallets').insert({ owner_type: 'person', owner_id: personId }).select('id').single()
      if (wErr) return res.status(500).json({ error: wErr.message })
      walletId = w?.id
    }

    // Registrar crédito offchain (pendiente de onchain)
    const { error: txErr } = await supabaseAdmin.from('ppv_transactions').insert({
      wallet_id: walletId,
      tx_type: 'credit',
      amount_plv: Number(totalPPV.toFixed(6)),
      reason: 'delivery',
      delivery_id: delivery.id,
      note: 'pending-onchain',
      status: 'pending'
    })
    if (txErr) return res.status(500).json({ error: txErr.message })

    return res.status(200).json({ delivery_id: delivery.id, ppv_awarded: Number(totalPPV.toFixed(6)) })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Error' })
  }
})

import type { NextApiRequest, NextApiResponse } from 'next';

type Item = { materialId: string; weightKg: number };

// Mock: insertar entrega e items y devolver confirmación.
// En producción: usar Supabase RPC o consultas directas al Postgres con RLS/Row Security y auth server-side.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { personId, assistantUserId, ambitecaId, items, draftId } = req.body || {} as { personId: string; assistantUserId: string; ambitecaId: string; items: Item[]; draftId?: string };
  if (!personId || !assistantUserId || !ambitecaId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  const deliveryId = 'mock-' + Math.random().toString(36).slice(2, 10);
  const totalWeight = items.reduce((s, it) => s + Number(it.weightKg || 0), 0);

  const deletedDraft = Boolean(draftId);

  return res.status(200).json({
    deliveryId,
    status: 'confirmed',
    totalWeightKg: Number(totalWeight.toFixed(3)),
    awardedPlv: Number((totalWeight * 1.0).toFixed(6)), // mock: 1 PLV por kg
    items,
    draftId: draftId || null,
    deletedDraft,
    message: 'Entrega registrada y confirmada (mock)'
  });
}


