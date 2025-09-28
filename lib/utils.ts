import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PrivyClient } from "@privy-io/server-auth"
import type { NextApiRequest, NextApiResponse } from "next"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tipos para API errors
export interface APIError {
  error: string;
  cause?: string;
}

// Cliente Privy reutilizable
export function createPrivyClient() {
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
  
  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error('Missing Privy environment variables');
  }
  
  return new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);
}

// Función para verificar autorización
export async function fetchAndVerifyAuthorization(
  req: NextApiRequest,
  res: NextApiResponse,
  client: PrivyClient
) {
  try {
    const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, "");
    const cookieAuthToken = req.cookies["privy-token"];

    const authToken = cookieAuthToken || headerAuthToken;
    if (!authToken) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const claims = await client.verifyAuthToken(authToken);
    return claims;
  } catch (e: any) {
    return res.status(401).json({ error: e.message });
  }
}