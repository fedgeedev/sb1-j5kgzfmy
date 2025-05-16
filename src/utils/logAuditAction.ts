import { supabase } from '@/lib/supabase';

interface LogAuditParams {
  actorEmail: string;
  action: string;
  target: string;
  details?: string;
}

export async function logAuditAction({
  actorEmail,
  action,
  target,
  details = ''
}: LogAuditParams) {
  if (!actorEmail || !action || !target) {
    console.warn('⚠️ logAuditAction: Missing required parameters', {
      actorEmail,
      action,
      target
    });
    return;
  }

  const { error } = await supabase.from('audit_logs').insert({
    actor_email: actorEmail,
    action,
    target,
    details,
    timestamp: new Date().toISOString(), // override just to be sure
  });

  if (error) {
    console.error('❌ Failed to log audit action:', error.message, { actorEmail, action, target });
  }
}
