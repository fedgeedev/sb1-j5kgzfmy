-- Update user role in user_accounts table
UPDATE public.user_accounts
SET 
  role = 'super_admin',
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Update user metadata in auth.users table
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{role}',
    '"super_admin"'
  ),
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
  'UPDATE_ROLE',
  'superadmin',
  'User role updated to super_admin'
);