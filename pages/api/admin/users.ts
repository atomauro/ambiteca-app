import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../lib/auth/privy-server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('v_user_complete')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ users: data || [] });
  }

  if (req.method === 'PUT') {
    const { user_id, role } = req.body || {};
    if (!user_id || !role) return res.status(400).json({ error: 'Parámetros inválidos' });
    const { error } = await supabaseAdmin.from('profiles').update({ role }).eq('user_id', user_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'PATCH') {
    const { user_id, is_active } = req.body || {};
    if (!user_id || typeof is_active !== 'boolean') return res.status(400).json({ error: 'Parámetros inválidos' });
    const { error } = await supabaseAdmin.from('profiles').update({ is_active }).eq('user_id', user_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});


