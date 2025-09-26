import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/auth/privy-server';

const mockUsers = Array.from({ length: 12 }).map((_, i) => ({
  id: `user-${i+1}`,
  fullName: `Usuario ${i+1}`,
  email: `user${i+1}@mail.com`,
  role: i % 3 === 0 ? 'assistant' : i % 5 === 0 ? 'admin' : 'citizen',
  is_active: i % 7 !== 0,
  deliveries: Math.floor(Math.random()*50),
  plv: Number((Math.random()*300).toFixed(3)),
}));

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse, user) {
  if (req.method === 'GET') return res.status(200).json({ users: mockUsers });
  if (req.method === 'POST') {
    const { id, is_active } = req.body || {};
    return res.status(200).json({ id, is_active });
  }
  return res.status(405).json({ error: 'Method not allowed' });
});


