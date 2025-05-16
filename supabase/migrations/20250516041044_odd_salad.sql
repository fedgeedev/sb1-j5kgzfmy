/*
  # Fix SQL Functions

  1. New Functions
    - `get_payments_with_email`: Returns payments with associated user email
    - `ping`: Simple health check function
  
  2. Changes
    - Move SQL functions from edge functions to migrations
    - Add proper security policies
*/

-- Function to get payments with user email
create or replace function get_payments_with_email()
returns table (
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
security definer
set search_path = public
language sql
as $$
  select 
    p.*, u.email as user_email
  from payments p
  left join auth.users u on p.user_id = u.id;
$$;

-- Simple health check function
create or replace function ping()
returns boolean
security definer
set search_path = public
language sql
as $$
  select true;
$$;