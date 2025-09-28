import { PrivyClient } from '@privy-io/server-auth';
import { NextApiRequest } from 'next';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
  throw new Error('Missing Privy environment variables');
}

const privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

/**
 * Verifica el token de Privy desde las cookies o Authorization header
 */
export async function verifyPrivyToken(req: NextApiRequest): Promise<AuthenticatedUser | null> {
  try {
    // Intentar obtener token de cookies primero
    let authToken = req.cookies['privy-token'];
    
    // Si no está en cookies, intentar Authorization header
    if (!authToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        authToken = authHeader.substring(7);
      }
    }

    if (!authToken) {
      return null;
    }

    // Verificar token con Privy
    const claims = await privyClient.verifyAuthToken(authToken);
    
    // Obtener datos del usuario desde Privy
    const user = await privyClient.getUser(claims.userId);
    
    return {
      id: user.id,
      email: user.email?.address,
      name: (user as any).google?.name || (user as any).apple?.name || user.id,
      avatar_url: (user as any).google?.profilePictureUrl || (user as any).apple?.profilePictureUrl,
    };
  } catch (error) {
    console.error('Error verifying Privy token:', error);
    return null;
  }
}

/**
 * Middleware para proteger rutas API que requieren autenticación
 */
export function withAuth<T = any>(
  handler: (req: NextApiRequest, res: any, user: AuthenticatedUser) => Promise<T>
) {
  return async (req: NextApiRequest, res: any) => {
    const user = await verifyPrivyToken(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res, user);
  };
}

/**
 * Middleware para proteger rutas que requieren rol de admin
 */
export function withAdminAuth<T = any>(
  handler: (req: NextApiRequest, res: any, user: AuthenticatedUser) => Promise<T>
) {
  return withAuth(async (req, res, user) => {
    // Aquí verificaríamos el rol en Supabase
    // Por ahora, permitimos acceso (se puede implementar después)
    return handler(req, res, user);
  });
}
