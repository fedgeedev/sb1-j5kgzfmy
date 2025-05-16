-- Create new consolidated user_accounts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'therapist', 'clinic_owner', 'admin', 'super_admin');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_accounts (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role user_role NOT NULL DEFAULT 'user',
  full_name text,
  phone text,
  avatar_url text,
  bio text,
  timezone text DEFAULT 'UTC',
  
  -- Professional fields
  qualifications text[],
  specializations text[],
  languages text[],
  session_types text[],
  session_fees jsonb,
  locations jsonb DEFAULT '[]'::jsonb,
  
  -- Ratings and metrics
  rating numeric DEFAULT 0,
  likes integer DEFAULT 0,
  review_count integer DEFAULT 0,
  
  -- Status fields
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  therapist_status text DEFAULT 'pending' CHECK (therapist_status IN ('pending', 'validated', 'rejected')),
  
  -- Clinic specific
  clinic_name text,
  clinic_description text,
  clinic_address text,
  clinic_photos jsonb DEFAULT '[]'::jsonb,
  clinic_amenities text[],
  clinic_status text CHECK (clinic_status IN ('pending', 'approved', 'rejected')),
  
  -- Preferences and metadata
  preferences jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- System fields
  last_login_at timestamptz,
  email_verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own account" ON public.user_accounts;
CREATE POLICY "Users can view their own account"
  ON public.user_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own account" ON public.user_accounts;
CREATE POLICY "Users can update their own account"
  ON public.user_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all accounts" ON public.user_accounts;
CREATE POLICY "Admins can manage all accounts"
  ON public.user_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_accounts
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Indexes for better query performance
DROP INDEX IF EXISTS idx_user_accounts_role;
DROP INDEX IF EXISTS idx_user_accounts_therapist_status;
DROP INDEX IF EXISTS idx_user_accounts_rating;
DROP INDEX IF EXISTS idx_user_accounts_likes;

CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON public.user_accounts(role);
CREATE INDEX IF NOT EXISTS idx_user_accounts_therapist_status ON public.user_accounts(therapist_status);
CREATE INDEX IF NOT EXISTS idx_user_accounts_rating ON public.user_accounts(rating DESC);
CREATE INDEX IF NOT EXISTS idx_user_accounts_likes ON public.user_accounts(likes DESC);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_accounts (
    id,
    email,
    role,
    full_name,
    therapist_status,
    clinic_status,
    email_verified_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role')::text = 'therapist' THEN 'pending'
      ELSE NULL
    END,
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role')::text = 'clinic_owner' THEN 'pending'
      ELSE NULL
    END,
    NEW.email_confirmed_at
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update related functions
CREATE OR REPLACE FUNCTION update_therapist_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_accounts
  SET 
    rating = (
      SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
      FROM therapist_reviews
      WHERE therapist_id = NEW.therapist_id
      AND is_verified = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM therapist_reviews
      WHERE therapist_id = NEW.therapist_id
      AND is_verified = true
    )
  WHERE id = NEW.therapist_id;
  RETURN NEW;
END;
$$;

-- Update likes handling function
CREATE OR REPLACE FUNCTION update_therapist_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_accounts
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = NEW.therapist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_accounts
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
    WHERE id = OLD.therapist_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Insert initial super admin account
INSERT INTO public.user_accounts (
  id,
  email,
  role,
  full_name,
  is_active,
  is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'geo.elnajjar@gmail.com',
  'super_admin',
  'System Administrator',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active,
  is_verified = EXCLUDED.is_verified;