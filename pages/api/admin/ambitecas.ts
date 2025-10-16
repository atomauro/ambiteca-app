import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../lib/auth/privy-server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse, user) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('ambitecas').select('id,name,is_active').order('name');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ambitecas: data || [] });
  }
  if (req.method === 'POST') {
    const { id, is_active, name } = req.body || {};
    if (name) {
      const { data, error } = await supabaseAdmin.from('ambitecas').insert({ name, is_active: is_active ?? true }).select('id').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, id: data?.id });
    }
    if (!id || typeof is_active !== 'boolean') return res.status(400).json({ error: 'Parámetros inválidos' });
    const { error } = await supabaseAdmin.from('ambitecas').update({ is_active }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
});


