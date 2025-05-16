/*
  # Fix Payments With Email Function Search Path

  1. Changes
    - Add fixed search path to get_payments_with_email function
    - Set appropriate security context
    - Maintain existing functionality while improving security
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS get_payments_with_email();

-- Recreate function with fixed search path
CREATE OR REPLACE FUNCTION get_payments_with_email()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  customer_id text,
  payment_intent_id text,
  checkout_session_id text,
  amount numeric,
  currency text,
  payment_status text,
  type text,
  created_at timestamptz,
  user_email text
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    p.*,
    u.email as user_email
  FROM payments p
  LEFT JOIN auth.users u ON p.user_id = u.id;
$$;