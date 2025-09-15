import type { NextApiRequest, NextApiResponse } from 'next';

// Endpoint mock: persiste un borrador (en producción, usar supabase client server-side)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { personDoc, ambitecaId, material, weightKg } = req.body || {};
  if (!personDoc || !ambitecaId || !material || !weightKg) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }
  // Para demo devolvemos un id de borrador generado
  const draftId = 'draft-' + Math.random().toString(36).slice(2, 10);
  return res.status(200).json({ draftId, saved: true });
}


