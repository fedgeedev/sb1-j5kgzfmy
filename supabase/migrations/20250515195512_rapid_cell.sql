/*
  # Unified User Tables System

  1. Changes
    - Create unified user_accounts table
    - Add role-specific profile columns
    - Migrate existing data
    - Update triggers and functions
    - Update RLS policies
*/

-- Create unified user_accounts table
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  email text,
  full_name text,
  phone text,
  avatar_url text,
  
  -- Common fields
  bio text,
  timezone text,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  preferences jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Therapist specific fields
  qualifications text,
  specializations text[],
  languages text[],
  session_types text[],
  session_fees jsonb,
  locations jsonb DEFAULT '[]'::jsonb,
  rating numeric DEFAULT 0,
  likes integer DEFAULT 0,
  therapist_status text CHECK (therapist_status IN ('pending', 'validated', 'rejected')),
  
  -- Clinic specific fields
  clinic_name text,
  clinic_description text,
  clinic_address text,
  clinic_photos jsonb DEFAULT '[]'::jsonb,
  clinic_amenities text[],
  clinic_status text CHECK (clinic_status IN ('pending', 'approved', 'rejected')),
  
  -- System fields
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own account"
  ON public.user_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own account"
  ON public.user_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all accounts"
  ON public.user_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_accounts
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_accounts (
    id,
    role,
    email,
    full_name,
    therapist_status,
    clinic_status
  ) VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role')::text = 'therapist' THEN 'pending'
      ELSE NULL
    END,
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role')::text = 'clinic_owner' THEN 'pending'
      ELSE NULL
    END
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Migrate existing data
DO $$ 
BEGIN
  -- Migrate therapists
  INSERT INTO public.user_accounts (
    id,
    role,
    email,
    full_name,
    qualifications,
    specializations,
    languages,
    session_types,
    session_fees,
    locations,
    rating,
    likes,
    therapist_status,
    bio,
    metadata
  )
  SELECT 
    t.user_id,
    'therapist'::user_role,
    u.email,
    t.profile_data->>'fullName',
    t.profile_data->>'qualifications',
    ARRAY(SELECT jsonb_array_elements_text(t.profile_data->'specializations')),
    ARRAY(SELECT jsonb_array_elements_text(t.profile_data->'languages')),
    ARRAY(SELECT jsonb_array_elements_text(t.profile_data->'sessionTypes')),
    t.profile_data->'sessionFees',
    t.locations,
    t.rating,
    t.likes,
    t.status,
    t.profile_data->>'bio',
    t.profile_data
  FROM public.therapists t
  JOIN auth.users u ON u.id = t.user_id
  ON CONFLICT (id) DO UPDATE
  SET 
    qualifications = EXCLUDED.qualifications,
    specializations = EXCLUDED.specializations,
    languages = EXCLUDED.languages,
    session_types = EXCLUDED.session_types,
    session_fees = EXCLUDED.session_fees,
    locations = EXCLUDED.locations,
    rating = EXCLUDED.rating,
    likes = EXCLUDED.likes,
    therapist_status = EXCLUDED.therapist_status,
    bio = EXCLUDED.bio,
    metadata = EXCLUDED.metadata;

  -- Migrate clinic owners
  INSERT INTO public.user_accounts (
    id,
    role,
    email,
    full_name,
    clinic_name,
    clinic_description,
    clinic_address,
    clinic_photos,
    clinic_amenities,
    clinic_status
  )
  SELECT 
    c.owner_id,
    'clinic_owner'::user_role,
    u.email,
    u.raw_user_meta_data->>'name',
    c.name,
    c.description,
    c.address,
    c.photos,
    ARRAY(SELECT jsonb_array_elements_text(c.amenities)),
    c.status
  FROM public.clinics c
  JOIN auth.users u ON u.id = c.owner_id
  ON CONFLICT (id) DO UPDATE
  SET 
    clinic_name = EXCLUDED.clinic_name,
    clinic_description = EXCLUDED.clinic_description,
    clinic_address = EXCLUDED.clinic_address,
    clinic_photos = EXCLUDED.clinic_photos,
    clinic_amenities = EXCLUDED.clinic_amenities,
    clinic_status = EXCLUDED.clinic_status;
END $$;