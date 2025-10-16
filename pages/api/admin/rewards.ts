import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/auth/privy-server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('rewards_catalog')
      .select('id,title,description,cost_plv,is_active,image_url,stock,price_cop')
      .order('title');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ rewards: data || [] });
  }

  if (req.method === 'POST') {
    const { title, description, cost_plv, is_active = true, image_url, stock, price_cop } = req.body || {};
    if (!title || !cost_plv) return res.status(400).json({ error: 'Faltan campos requeridos' });
    const { data, error } = await supabaseAdmin
      .from('rewards_catalog')
      .insert({ title, description: description || null, cost_plv: Number(cost_plv), is_active: Boolean(is_active), image_url: image_url || null, stock: stock == null ? null : Number(stock), price_cop: price_cop == null ? null : Number(price_cop) })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ reward: data });
  }

  if (req.method === 'PATCH') {
    const { id, ...fields } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Falta id' });
    if (fields.cost_plv != null) fields.cost_plv = Number(fields.cost_plv);
    if (fields.stock != null) fields.stock = Number(fields.stock);
    if (fields.price_cop != null) fields.price_cop = Number(fields.price_cop);
    const { error } = await supabaseAdmin
      .from('rewards_catalog')
      .update(fields)
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});


