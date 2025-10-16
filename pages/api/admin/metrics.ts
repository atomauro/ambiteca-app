import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../lib/auth/privy-server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const ambitecaId = (req.query?.ambiteca_id as string) || null;
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

    // PPV total desde vista (nombre correcto: v_plv_balances)
    let totalPpv = 0;
    try {
      const { data: ppvBalances } = await supabaseAdmin
        .from('v_plv_balances')
        .select('balance_plv');
      totalPpv = ((ppvBalances as any[]) || []).reduce((acc, r: any) => acc + Number(r?.balance_plv || 0), 0);
    } catch {}

    // Materiales con tarifa vigente (por ambiteca o global)
    const today = new Date().toISOString().slice(0,10);
    const { data: matsWithRate } = await supabaseAdmin
      .from('material_conversion_rates')
      .select('material_id,ambiteca_id,valid_from,valid_to', { head: false })
      .or(ambitecaId ? `ambiteca_id.eq.${ambitecaId},ambiteca_id.is.null` : 'ambiteca_id.is.null')
      .lte('valid_from', today);
    const materialsWithRate = new Set((matsWithRate || []).filter((r: any) => !r.valid_to || r.valid_to >= today).map((r: any) => r.material_id)).size;

    // Recompensas activas y sin stock
    const { count: rewardsActive } = await supabaseAdmin
      .from('rewards_catalog')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    const { count: rewardsOutOfStock } = await supabaseAdmin
      .from('rewards_catalog')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('stock', 0);

    // Top materiales: por simplicidad, devolvemos vacío si no hay función RPC definida
    const topMaterials: any[] = [];

    return res.status(200).json({
      users: totalUsers || 0,
      ambitecas: totalAmbitecas || 0,
      deliveries: totalDeliveries || 0,
      ppv: totalPpv,
      materialsWithRate,
      rewardsActive: rewardsActive || 0,
      rewardsOutOfStock: rewardsOutOfStock || 0,
      topMaterials,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load metrics' });
  }
});


