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
language sql
as $$
  select 
    p.*, u.email as user_email
  from payments p
  left join auth.users u on p.user_id = u.id
$$;
