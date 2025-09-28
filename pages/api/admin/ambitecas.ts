import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../../lib/supabase/client';
import { withAdminAuth } from '../../../lib/auth/privy-server';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse, user) {
  const supabase = createClient();
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('ambitecas').select('id,name,is_active');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ambitecas: data || [] });
  }
  if (req.method === 'POST') {
    const { id, is_active, name } = req.body || {};
    if (name) {
      const { data, error } = await supabase.from('ambitecas').insert({ name, is_active: is_active ?? true }).select('id').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, id: data?.id });
    }
    if (!id || typeof is_active !== 'boolean') return res.status(400).json({ error: 'Parámetros inválidos' });
    const { error } = await supabase.from('ambitecas').update({ is_active }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
});


