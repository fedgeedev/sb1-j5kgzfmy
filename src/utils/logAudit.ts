import { supabase } from '../lib/supabaseClient';

export const logAudit = async ({
  actor_id,
  actor_email,
  action,
  target,
  details
}: {
  actor_id: string;
  actor_email: string;
  action: string;
  target: string;
  details: string;
}) => {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      actor_id,
      actor_email,
      action,
      target,
      details
    });

    if (error) {
      console.error('Failed to log audit event:', error.message);
    }
  } catch (err) {
    console.error('Unexpected error logging audit:', err);
  }
};
