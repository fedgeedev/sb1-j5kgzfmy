import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, user } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (user?.email && event) {
      await supabase.from('user_activity').insert({
        user_email: user.email,
        action: formatEventAction(event),
        timestamp: new Date().toISOString()
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error('Error logging user activity:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to log activity' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function formatEventAction(event: string): string {
  switch (event) {
    case 'SIGNED_IN':
      return 'Signed in';
    case 'SIGNED_OUT':
      return 'Signed out';
    case 'USER_UPDATED':
      return 'Updated profile';
    case 'PASSWORD_RECOVERY':
      return 'Requested password reset';
    default:
      return event;
  }
}