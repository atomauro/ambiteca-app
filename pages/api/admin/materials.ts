import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../lib/auth/privy-server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse, user) {

  if (req.method === 'GET') {
    const materialId = (req.query?.id as string) || null;
    const ambitecaId = (req.query?.ambiteca_id as string) || null;
    if (materialId) {
      // Detalle de material + historial de tarifas
      const { data: material, error: mErr } = await supabaseAdmin
        .from('materials')
        .select('id,name,unit,is_active,image_url')
        .eq('id', materialId)
        .maybeSingle();
      if (mErr) return res.status(500).json({ error: mErr.message });
      if (!material) return res.status(404).json({ error: 'Material no encontrado' });

      const { data: ambs } = await supabaseAdmin.from('ambitecas').select('id,name').eq('is_active', true);
      const { data: rates } = await supabaseAdmin
        .from('material_conversion_rates')
        .select('id,material_id,ambiteca_id,ppv_per_kg,valid_from,valid_to,created_at')
        .eq('material_id', materialId)
        .order('valid_from', { ascending: false })
        .order('created_at', { ascending: false });

      // Calcular tarifa vigente priorizando ambiteca si viene en query
      const today = new Date().toISOString().slice(0,10);
      const currentAmb = ambitecaId ? (rates || []).find(r => r.ambiteca_id === ambitecaId && r.valid_from <= today && (!r.valid_to || r.valid_to >= today)) : null;
      const currentGlobal = (rates || []).find(r => !r.ambiteca_id && r.valid_from <= today && (!r.valid_to || r.valid_to >= today));
      const current_rate = Number(currentAmb?.ppv_per_kg ?? currentGlobal?.ppv_per_kg ?? 1.0);

      return res.status(200).json({
        material,
        ambitecas: ambs || [],
        rates: rates || [],
        current_rate,
      });
    }

    const { data: mats, error } = await supabaseAdmin.from('materials').select('id,name,is_active,unit,image_url');
    if (error) return res.status(500).json({ error: error.message });
    const { data: ambs } = await supabaseAdmin.from('ambitecas').select('id,name').eq('is_active', true);
    // Obtener tarifa vigente (simple: por material global, sin ambiteca)
    const { data: rates } = await supabaseAdmin
      .from('material_conversion_rates')
      .select('material_id,ppv_per_kg,valid_from,ambiteca_id,created_at')
      .or(ambitecaId ? `ambiteca_id.eq.${ambitecaId},ambiteca_id.is.null` : 'ambiteca_id.is.null')
      .lte('valid_from', new Date().toISOString().slice(0,10))
      .order('valid_from', { ascending: false })
      .order('created_at', { ascending: false });
    const materials = (mats || []).map(m => ({
      id: m.id,
      name: m.name,
      is_active: (m as any).is_active,
      unit: (m as any).unit,
      image_url: (m as any).image_url || null,
      // Elegimos tarifa: primero específica de ambiteca si existe, si no la global
      ppv_per_kg: (() => {
        const matchAmb = ambitecaId ? rates?.find(r => r.material_id === m.id && r.ambiteca_id === ambitecaId) : null;
        const matchGlobal = rates?.find(r => r.material_id === m.id && r.ambiteca_id == null);
        return (matchAmb?.ppv_per_kg ?? matchGlobal?.ppv_per_kg ?? 1.0);
      })()
    }));
    return res.status(200).json({ materials, ambitecas: ambs || [] });
  }

  if (req.method === 'POST') {
    const { id, plv_per_kg, ppv_per_kg, ambiteca_id } = req.body || {};
    const rate = ppv_per_kg ?? plv_per_kg;
    if (!id || rate == null) return res.status(400).json({ error: 'Parámetros inválidos' });
    // Insertar nueva tarifa vigente desde hoy (histórico)
    const today = new Date().toISOString().slice(0,10);
    const { error } = await supabaseAdmin.from('material_conversion_rates').insert({
      material_id: id,
      ppv_per_kg: Number(rate),
      valid_from: today,
      ambiteca_id: ambiteca_id || null
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'PUT') {
    const { name, unit = 'kg', is_active = true } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Falta nombre' });
    const { data, error } = await supabaseAdmin.from('materials').insert({ name, unit, is_active }).select('id').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ id: data?.id });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Falta id' });
    const { error } = await supabaseAdmin.from('materials').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'PATCH') {
    const { id, is_active, image_url } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Parámetros inválidos' });
    const fields: any = {};
    if (typeof is_active === 'boolean') fields.is_active = is_active;
    if (typeof image_url === 'string') fields.image_url = image_url;
    if (Object.keys(fields).length === 0) return res.status(400).json({ error: 'Nada para actualizar' });
    const { error } = await supabaseAdmin.from('materials').update(fields).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});


