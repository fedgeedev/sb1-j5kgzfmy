import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

async function logUserActivity(data: { user_email: string; action: string; details: string }) {
  await supabase.from('user_activity').insert([{
    user_email: data.user_email,
    action: data.action,
    metadata: { details: data.details }
  }]);
}

function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return corsResponse({}, 204);
    if (req.method !== 'POST') return corsResponse({ error: 'Method not allowed' }, 405);

    const { price_id, success_url, cancel_url, mode } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);
    if (getUserError || !user) return corsResponse({ error: 'Unauthorized' }, 401);

    let customerId = '';

    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!customer?.customer_id) {
      const newCustomer = await stripe.customers.create({ email: user.email });
      await supabase.from('stripe_customers').insert({ user_id: user.id, customer_id: newCustomer.id });

      if (mode === 'subscription') {
        await supabase.from('stripe_subscriptions').insert({ customer_id: newCustomer.id, status: 'not_started' });
      }

      customerId = newCustomer.id;
    } else {
      customerId = customer.customer_id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode,
      success_url,
      cancel_url,
    });

    await logUserActivity({
      user_email: user.email,
      action: `Initiated ${mode} checkout`,
      details: `Session ID: ${session.id}`,
    });

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error(err);
    return corsResponse({ error: err.message }, 500);
  }
});