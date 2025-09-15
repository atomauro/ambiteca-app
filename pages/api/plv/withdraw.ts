import type { NextApiRequest, NextApiResponse } from 'next';

// Mock de retiro PLV: valida parámetros y devuelve un resultado ficticio
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { personId, amountPlv, targetChain, targetAddress } = req.body || {};
  if (!personId || !amountPlv || Number(amountPlv) <= 0) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  // Aquí normalmente validaríamos ownership con el access token (Privy customAuth)
  // y crearíamos un registro en plv_claims. Este endpoint solo mockea la respuesta.

  const claimId = 'mock-' + Math.random().toString(36).slice(2, 10);
  const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');

  return res.status(200).json({
    claimId,
    status: 'pending',
    request: {
      personId,
      amountPlv: Number(amountPlv),
      targetChain: targetChain || 'base',
      targetAddress: targetAddress || 'embedded-wallet',
    },
    // Para demo, devolvemos un hash ficticio
    txHash,
    message: 'Solicitud de retiro registrada (mock)'
  });
}


