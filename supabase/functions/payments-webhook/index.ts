import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
  }
  return _supabase;
}

async function handleTransactionCompleted(data: any) {
  const bookingId = data.customData?.bookingId;
  if (!bookingId) {
    console.warn('transaction.completed without bookingId in customData');
    return;
  }
  const { error } = await getSupabase()
    .from('bookings')
    .update({
      payment_status: 'completed',
      paddle_transaction_id: data.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);
  if (error) console.error('Failed to update booking:', error);
}

async function handleTransactionFailed(data: any) {
  const bookingId = data.customData?.bookingId;
  if (!bookingId) return;
  // Leave as pending; admin can cancel manually. Log for visibility.
  console.log('Payment failed for booking:', bookingId, 'txn:', data.id);
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.eventType) {
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data);
      break;
    case EventName.TransactionPaymentFailed:
      await handleTransactionFailed(event.data);
      break;
    default:
      console.log('Unhandled event:', event.eventType);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
  try {
    await handleWebhook(req, env);
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});
