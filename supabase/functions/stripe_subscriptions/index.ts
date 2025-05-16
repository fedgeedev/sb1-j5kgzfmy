-- Create table to store Stripe subscription metadata
create table public.stripe_subscriptions (
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

-- Optional index to speed up admin queries
create index idx_stripe_subscriptions_status on public.stripe_subscriptions (status);

-- Optional: foreign key to your stripe_customers table, if present
-- alter table public.stripe_subscriptions
-- add constraint fk_stripe_subscriptions_customer
-- foreign key (customer_id) references public.stripe_customers(customer_id);
