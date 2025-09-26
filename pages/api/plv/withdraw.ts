import type { NextApiRequest, NextApiResponse } from 'next';
import { PrivyApi } from '@privy-io/server-auth';
import { ethers } from 'ethers';
import { PerlaVerdeClient } from '../../../lib/contracts/client';
import { getContractConfig, DEFAULT_CHAIN_ID } from '../../../lib/contracts/config';

const privy = new PrivyApi(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

// Endpoint para retiro de PLV: minta tokens directamente en la wallet del usuario
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amountPlv, targetChain, deliveryId } = req.body || {};
  
  // Validar parámetros
  if (!amountPlv || Number(amountPlv) <= 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  if (!deliveryId) {
    return res.status(400).json({ error: 'ID de entrega requerido' });
  }

  try {
    // Verificar token de autenticación de Privy
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }

    // Verificar el token con Privy
    const claims = await privy.verifyAuthToken(authToken);
    const userId = claims.userId;

    // Obtener información del usuario de Privy
    const user = await privy.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Buscar wallet embebida del usuario
    const embeddedWallet = user.linkedAccounts.find(
      account => account.type === 'wallet' && account.walletClientType === 'privy'
    );

    if (!embeddedWallet) {
      return res.status(400).json({ error: 'Wallet embebida no encontrada' });
    }

    const userAddress = embeddedWallet.address;
    const chainId = targetChain === 'optimism' ? 11155420 : DEFAULT_CHAIN_ID; // OP Sepolia o Base Sepolia

    // Configurar provider y contrato
    const config = getContractConfig(chainId);
    const provider = new ethers.JsonRpcProvider(config.RPC_URL);
    
    // Aquí necesitarías configurar un signer con permisos MINTER_ROLE
    // Por ahora, devolvemos una respuesta simulada
    const claimId = 'claim-' + Math.random().toString(36).slice(2, 10);
    
    // En producción, aquí harías:
    // 1. Crear registro en plv_claims en Supabase
    // 2. Usar un signer autorizado para mintear tokens
    // 3. Registrar la transacción en erc20_transfers
    
    // Simular respuesta exitosa
    const mockTxHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');

    return res.status(200).json({
      claimId,
      status: 'completed', // En producción sería 'pending' hasta confirmar tx
      request: {
        userId,
        userAddress,
        amountPlv: Number(amountPlv),
        targetChain: chainId === 11155420 ? 'optimism' : 'base',
        deliveryId,
      },
      txHash: mockTxHash,
      explorerUrl: `${config.EXPLORER_URL}/tx/${mockTxHash}`,
      message: 'Tokens PPV minteados exitosamente (simulado)'
    });

  } catch (error) {
    console.error('Error in PLV withdraw:', error);
    
    if (error instanceof Error && error.message.includes('Invalid token')) {
      return res.status(401).json({ error: 'Token de autorización inválido' });
    }
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}


