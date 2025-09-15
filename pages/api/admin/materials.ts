import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServer } from '../../../lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServer(req as any);

  if (req.method === 'GET') {
    const { data: mats, error } = await supabase.from('materials').select('id,name');
    if (error) return res.status(500).json({ error: error.message });
    const { data: ambs } = await supabase.from('ambitecas').select('id,name').eq('is_active', true);
    // Obtener tarifa vigente (simple: por material global, sin ambiteca)
    const { data: rates } = await supabase
      .from('material_conversion_rates')
      .select('material_id,plv_per_kg')
      .is('ambiteca_id', null)
      .lte('valid_from', new Date().toISOString().slice(0,10));
    const materials = (mats || []).map(m => ({
      id: m.id,
      name: m.name,
      plv_per_kg: rates?.find(r => r.material_id === m.id)?.plv_per_kg ?? 1.0
    }));
    return res.status(200).json({ materials, ambitecas: ambs || [] });
  }

  if (req.method === 'POST') {
    const { id, plv_per_kg, ambiteca_id } = req.body || {};
    if (!id || plv_per_kg == null) return res.status(400).json({ error: 'Parámetros inválidos' });
    // Insertar nueva tarifa vigente desde hoy (histórico)
    const today = new Date().toISOString().slice(0,10);
    const { error } = await supabase.from('material_conversion_rates').insert({
      material_id: id,
      plv_per_kg: Number(plv_per_kg),
      valid_from: today,
      ambiteca_id: ambiteca_id || null
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


