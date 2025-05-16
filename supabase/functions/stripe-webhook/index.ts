import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { appInfo: { name: 'Bolt Integration', version: '1.0.0' } });
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function logUserActivity(data: { user_email: string; action: string; details: string }) {
  await supabase.from('user_activity').insert([{
    user_email: data.user_email,
    action: data.action,
    metadata: { details: data.details }
  }]);
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const signature = req.headers.get('stripe-signature');
    if (!signature) return new Response('Missing Stripe Signature', { status: 400 });

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      return new Response(`Webhook error: ${err.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));
    return Response.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const data = event.data.object as any;
  const customerId = data.customer;

  const { data: customerRecord } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle();

  const userId = customerRecord?.user_id;
  if (!userId) return;

  const { data: userInfo } = await supabase.auth.admin.getUserById(userId);
  const email = userInfo?.user?.email || 'unknown';

  if (event.type === 'checkout.session.completed') {
    await logUserActivity({
      user_email: email,
      action: 'Checkout Completed',
      details: `Session ID: ${data.id}, Mode: ${data.mode}`,
    });
  }

  if (event.type === 'invoice.payment_succeeded') {
    await logUserActivity({
      user_email: email,
      action: 'Subscription Payment Succeeded',
      details: `Amount: ${data.amount_paid}, Currency: ${data.currency}`,
    });
  }

  if (event.type === 'invoice.payment_failed') {
    await logUserActivity({
      user_email: email,
      action: 'Subscription Payment Failed',
      details: `Amount Due: ${data.amount_due}`,
    });
  }
}