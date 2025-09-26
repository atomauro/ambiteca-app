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

    // Usar la función de Supabase para manejar webhooks
    const { data: result, error } = await supabase.rpc('handle_privy_webhook', {
      event_type: event,
      user_data: data,
      wallet_data: event === 'wallet.created' ? data : null
    });

    if (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ error: 'Error processing webhook' });
    }

    console.log('Webhook processed successfully:', result);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
