/*
  # Initial Database Schema Setup

  1. New Tables
    - `users_metadata`: Extended user information
    - `audit_logs`: System-wide audit logging
    - `user_activity`: User activity tracking
    - `system_health`: System health monitoring

  2. Security
    - Enable RLS on all tables
    - Add appropriate security policies
*/

-- Users Metadata
CREATE TABLE IF NOT EXISTS public.users_metadata (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  phone text,
  avatar_url text,
  preferences jsonb DEFAULT '{}'::jsonb,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  actor_email text,
  action text NOT NULL,
  target text,
  details text,
  created_at timestamptz DEFAULT now()
);

-- User Activity
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- System Health
CREATE TABLE IF NOT EXISTS public.system_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component text NOT NULL,
  status text CHECK (status IN ('healthy', 'degraded', 'offline')),
  message text,
  checked_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own metadata"
  ON public.users_metadata
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all metadata"
  ON public.users_metadata
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ));

CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ));

CREATE POLICY "Admins can read user activity"
  ON public.user_activity
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ));

CREATE POLICY "Admins can read system health"
  ON public.system_health
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ));