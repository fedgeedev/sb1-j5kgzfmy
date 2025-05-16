/*
  # Create Stripe subscriptions table and related functions

  1. New Tables
    - `stripe_subscriptions`
      - `customer_id` (text, primary key)
      - `subscription_id` (text)
      - `price_id` (text)
      - `current_period_start` (bigint)
      - `current_period_end` (bigint)
      - `cancel_at_period_end` (boolean)
      - `payment_method_brand` (text)
      - `payment_method_last4` (text)
      - `status` (text, with check constraint)
      - `created_at` (timestamptz)

  2. Functions
    - `create_stripe_subscriptions_table`: Creates the stripe_subscriptions table if it doesn't exist
*/

-- Function to create the stripe_subscriptions table
create or replace function create_stripe_subscriptions_table()
returns void
language plpgsql
as $$
begin
  -- Create the table if it doesn't exist
  create table if not exists public.stripe_subscriptions (
    customer_id text primary key,
    subscription_id text,
    price_id text,
    current_period_start bigint,
    current_period_end bigint,
    cancel_at_period_end boolean,
    payment_method_brand text,
    payment_method_last4 text,
    status text check (status in (
      'incomplete', 'incomplete_expired', 'trialing', 'active',
      'past_due', 'canceled', 'unpaid', 'paused', 'not_started'
    )),
    created_at timestamptz default now()
  );

  -- Create index if it doesn't exist
  create index if not exists idx_stripe_subscriptions_status 
    on public.stripe_subscriptions (status);
end;
$$;

-- Create the table immediately
select create_stripe_subscriptions_table();