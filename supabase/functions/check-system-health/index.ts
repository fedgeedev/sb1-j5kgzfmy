import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const components = [
  { name: 'Database', check: async () => (await supabase.rpc('ping')).error === null },
  { name: 'Auth', check: async () => (await supabase.auth.admin.listUsers({ limit: 1 })).error === null },
  { name: 'Storage', check: async () => (await supabase.storage.listBuckets()).error === null }
];

Deno.serve(async () => {
  for (const { name, check } of components) {
    let status: 'healthy' | 'degraded' | 'offline' = 'offline';
    let message = '';

    try {
      const isHealthy = await check();
      status = isHealthy ? 'healthy' : 'degraded';
      message = isHealthy ? 'Component is responsive' : 'Component responded with issues';
    } catch (err) {
      message = `Error checking ${name}: ${err.message || err}`;
    }

    await supabase.from('system_health').insert({
      component: name,
      status,
      message
    });
  }

  return new Response(JSON.stringify({ status: 'OK' }), { status: 200 });
});
