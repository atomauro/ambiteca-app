import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/auth/privy-server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Inserta materiales, tarifas globales y recompensas base a partir de la info compartida
export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const today = new Date().toISOString().slice(0,10);

  // Residuos con PPV unitario (según tabla)
  const materials = [
    { name: 'Aceite de cocina usado', unit: 'litro', rate: 40 },
    { name: 'Botella de vidrio limpia', unit: 'unidad', rate: 25 },
    { name: 'Botella de amor / Ecobotella (PET rellena/compactada)', unit: 'unidad', rate: 15 },
  ];

  // Recompensas para canje (con stock y precio COP)
  const rewards = [
    { title: 'Café local (250 g)', cost_plv: 200, stock: 50, price_cop: 44125 },
    { title: 'Chocolate artesanal (100 g)', cost_plv: 250, stock: 125, price_cop: 7556 },
    { title: 'Jabón elaborado a partir de aceite usado', cost_plv: 60, stock: 150, price_cop: 11667 },
    { title: 'Panela (1 libra)', cost_plv: 150, stock: 100, price_cop: 7000 },
    { title: 'Vaso elaborado a partir de botella reciclada', cost_plv: 120, stock: 25, price_cop: 21875 },
    { title: 'Bolsa reutilizable (tela, logo Basura Cero)', cost_plv: 220, stock: 150, price_cop: 7500 },
  ];

  try {
    // Upsert materiales por nombre
    for (const m of materials) {
      const { data: existing } = await supabaseAdmin.from('materials').select('id,unit').eq('name', m.name).maybeSingle();
      let materialId = existing?.id as string | undefined;
      if (!materialId) {
        const { data: inserted, error: insErr } = await supabaseAdmin.from('materials').insert({ name: m.name, unit: m.unit, is_active: true }).select().single();
        if (insErr) throw insErr;
        materialId = inserted?.id;
      } else if (existing && (existing as any).unit !== m.unit) {
        await supabaseAdmin.from('materials').update({ unit: m.unit }).eq('id', materialId);
      }
      // Insertar tarifa global vigente
      const { error: rateErr } = await supabaseAdmin.from('material_conversion_rates').insert({ material_id: materialId, ppv_per_kg: m.rate, valid_from: today, ambiteca_id: null });
      if (rateErr) {
        // ignorar duplicados del mismo día
      }
    }

    // Upsert recompensas por título
    for (const r of rewards) {
      const { data: existing } = await supabaseAdmin.from('rewards_catalog').select('id').eq('title', r.title).maybeSingle();
      if (!existing) {
        const { error } = await supabaseAdmin.from('rewards_catalog').insert({ title: r.title, cost_plv: r.cost_plv, is_active: true, stock: r.stock, price_cop: r.price_cop });
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from('rewards_catalog').update({ cost_plv: r.cost_plv, stock: r.stock, price_cop: r.price_cop }).eq('id', (existing as any).id);
        if (error) throw error;
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});


