import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Inicializar cliente de Supabase con service role (para bypassing RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Necesitarás esta variable
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Verificar firma del webhook de Privy
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar firma del webhook
    const signature = req.headers['privy-signature'] as string;
    const webhookSecret = process.env.PRIVY_WEBHOOK_SECRET!;
    const payload = JSON.stringify(req.body);

    if (!signature || !verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;
    console.log(`Received Privy webhook: ${event}`, data);

    switch (event) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      
      case 'wallet.created':
        await handleWalletCreated(data);
        break;
      
      case 'session.created':
        await handleSessionCreated(data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Manejar creación de usuario
async function handleUserCreated(userData: any) {
  const { id: privyUserId, email, phone, createdAt } = userData;
  
  try {
    // Crear perfil en Supabase
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        privy_user_id: privyUserId,
        email: email?.address || null,
        phone: phone?.number || null,
        role: 'citizen', // rol por defecto
        created_at: createdAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return;
    }

    console.log('Profile created:', data);

    // Crear wallet lógica para PLV si no existe
    await createPlvWallet(data.user_id, 'person');

  } catch (error) {
    console.error('Error in handleUserCreated:', error);
  }
}

// Manejar actualización de usuario
async function handleUserUpdated(userData: any) {
  const { id: privyUserId, email, phone } = userData;
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        email: email?.address || null,
        phone: phone?.number || null,
        updated_at: new Date().toISOString(),
      })
      .eq('privy_user_id', privyUserId);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    console.log('Profile updated for user:', privyUserId);

  } catch (error) {
    console.error('Error in handleUserUpdated:', error);
  }
}

// Manejar eliminación de usuario
async function handleUserDeleted(userData: any) {
  const { id: privyUserId } = userData;
  
  try {
    // Marcar como eliminado en lugar de borrar (para mantener historial)
    const { error } = await supabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('privy_user_id', privyUserId);

    if (error) {
      console.error('Error soft-deleting profile:', error);
      return;
    }

    console.log('Profile soft-deleted for user:', privyUserId);

  } catch (error) {
    console.error('Error in handleUserDeleted:', error);
  }
}

// Manejar creación de wallet
async function handleWalletCreated(walletData: any) {
  const { userId: privyUserId, address, chainType, walletClientType } = walletData;
  
  try {
    // Buscar el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('privy_user_id', privyUserId)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found for wallet creation:', privyUserId);
      return;
    }

    // Registrar la wallet en nuestra tabla
    const { error } = await supabase
      .from('user_wallets')
      .insert({
        user_id: profile.user_id,
        privy_user_id: privyUserId,
        address: address,
        chain_type: chainType,
        wallet_client_type: walletClientType,
        is_embedded: walletClientType === 'privy',
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating wallet record:', error);
      return;
    }

    console.log('Wallet registered:', { address, chainType, walletClientType });

  } catch (error) {
    console.error('Error in handleWalletCreated:', error);
  }
}

// Manejar inicio de sesión
async function handleSessionCreated(sessionData: any) {
  const { userId: privyUserId, createdAt } = sessionData;
  
  try {
    // Registrar el login para analytics
    const { error } = await supabase
      .from('user_sessions')
      .insert({
        privy_user_id: privyUserId,
        session_started_at: createdAt,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error logging session:', error);
      return;
    }

    // Actualizar last_login en el perfil
    await supabase
      .from('profiles')
      .update({ last_login_at: createdAt })
      .eq('privy_user_id', privyUserId);

    console.log('Session logged for user:', privyUserId);

  } catch (error) {
    console.error('Error in handleSessionCreated:', error);
  }
}

// Crear wallet lógica para PLV
async function createPlvWallet(userId: string, ownerType: 'person' | 'ambiteca' | 'system') {
  try {
    const { error } = await supabase
      .from('plv_wallets')
      .insert({
        owner_type: ownerType,
        owner_id: userId,
        created_at: new Date().toISOString(),
      });

    if (error && !error.message.includes('duplicate')) {
      console.error('Error creating PLV wallet:', error);
      return;
    }

    console.log('PLV wallet created for user:', userId);

  } catch (error) {
    console.error('Error in createPlvWallet:', error);
  }
}
