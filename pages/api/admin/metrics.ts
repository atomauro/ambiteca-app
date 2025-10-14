import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../lib/auth/privy-server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Usuarios totales
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('user_id', { count: 'exact', head: true });

    // Ambitecas activas
    const { count: totalAmbitecas } = await supabaseAdmin
      .from('ambitecas')
      .select('id', { count: 'exact', head: true });

    // Entregas totales
    const { count: totalDeliveries } = await supabaseAdmin
      .from('deliveries')
      .select('id', { count: 'exact', head: true });

    // PPV total (desde vista; mantener compatibilidad si aún es v_plv_balances)
    let totalPpv = 0;
    const { data: ppvBalances, error: ppvErr } = await supabaseAdmin
      .from('v_ppv_balances')
      .select('balance_plv');
    if (!ppvErr && Array.isArray(ppvBalances)) {
      totalPpv = (ppvBalances as any[]).reduce((acc, r: any) => acc + Number(r.balance_plv || 0), 0);
    } else {
      const { data: plvBalances } = await supabaseAdmin
        .from('v_plv_balances')
        .select('balance_plv');
      totalPpv = (plvBalances as any[] || []).reduce((acc, r: any) => acc + Number(r.balance_plv || 0), 0);
    }

    return res.status(200).json({
      users: totalUsers || 0,
      ambitecas: totalAmbitecas || 0,
      deliveries: totalDeliveries || 0,
      ppv: totalPpv,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load metrics' });
  }
});


