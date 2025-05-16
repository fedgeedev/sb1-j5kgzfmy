import { supabase } from '@/lib/supabase';

export async function logUserActivity({
  email,
  action
}: {
  email: string;
  action: string;
}) {
  const { error } = await supabase.from('user_activity').insert({
    user_email: email,
    action
  });

  if (error) {
    console.error('❌ Failed to log user activity:', error);
  }
}
