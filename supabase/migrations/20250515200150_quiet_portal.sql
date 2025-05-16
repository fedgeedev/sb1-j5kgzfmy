/*
  # Update Superadmin Credentials

  Updates the superadmin email and password to the specified values
*/

-- Update superadmin credentials
UPDATE auth.users
SET 
  email = 'geo.elnajjar@gmail.com',
  encrypted_password = crypt('123456', gen_salt('bf')),
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Update email in user_accounts table
UPDATE public.user_accounts
SET 
  email = 'geo.elnajjar@gmail.com',
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Add audit log entry
INSERT INTO public.audit_logs (
  actor_id,
  actor_email,
  action,
  target,
  details
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'geo.elnajjar@gmail.com',
  'UPDATE_CREDENTIALS',
  'superadmin',
  'Superadmin credentials updated'
);