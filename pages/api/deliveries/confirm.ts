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


