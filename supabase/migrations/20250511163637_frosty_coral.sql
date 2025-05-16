/*
  # Create Payments Table and Function

  1. New Tables
    - payments: Stores payment records
      - id (uuid, primary key)
      - user_id (uuid, foreign key to auth.users)
      - customer_id (text)
      - payment_intent_id (text)
      - checkout_session_id (text)
      - amount (numeric)
      - currency (text)
      - payment_status (text)
      - type (text)
      - created_at (timestamptz)

  2. Functions
    - get_payments_with_email: Returns payment records with user email
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  customer_id text,
  payment_intent_id text,
  checkout_session_id text,
  amount numeric,
  currency text,
  payment_status text,
  type text,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Create function to get payments with email
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
AS $$
  SELECT 
    p.*, u.email as user_email
  FROM payments p
  LEFT JOIN auth.users u ON p.user_id = u.id;
$$;