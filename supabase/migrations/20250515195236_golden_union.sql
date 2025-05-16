-- Create enum for user roles if not exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'therapist', 'clinic_owner', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role user_role PRIMARY KEY,
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  contact_email text,
  phone text,
  timezone text,
  preferences jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Roles policies
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Role Permissions policies
CREATE POLICY "Anyone can view role permissions"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage role permissions"
  ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- User Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
  ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permissions) VALUES
('user', '{"can_view_therapists": true, "can_book_sessions": true, "can_write_reviews": true}'::jsonb),
('therapist', '{"can_view_therapists": true, "can_manage_profile": true, "can_manage_availability": true, "can_manage_clients": true}'::jsonb),
('clinic_owner', '{"can_manage_clinic": true, "can_manage_therapists": true, "can_manage_services": true}'::jsonb),
('admin', '{"can_manage_all": true}'::jsonb),
('super_admin', '{"can_manage_all": true}'::jsonb)
ON CONFLICT (role) DO NOTHING;

-- Create function to automatically create user profile and role on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into user_roles first
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'user'::user_role
    )
  );

  -- Create user profile
  INSERT INTO public.user_profiles (user_id, full_name, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
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

-- Insert initial users and their roles
DO $$ 
BEGIN
  -- Super Admin
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'superadmin@theraway.com',
    crypt('SuperAdmin123!', gen_salt('bf')),
    now(),
    '{"role": "super_admin", "name": "System Administrator"}'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    'super_admin'
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Regular User
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'user@theraway.com',
    crypt('User123!', gen_salt('bf')),
    now(),
    '{"role": "user", "name": "Sarah Johnson"}'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    'user'
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Therapist
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'therapist@theraway.com',
    crypt('Therapist123!', gen_salt('bf')),
    now(),
    '{"role": "therapist", "name": "Dr. Michael Chen"}'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    '22222222-2222-2222-2222-222222222222',
    'therapist'
  ) ON CONFLICT (user_id) DO NOTHING;

  -- Clinic Owner
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'clinic@theraway.com',
    crypt('Clinic123!', gen_salt('bf')),
    now(),
    '{"role": "clinic_owner", "name": "Emma Wilson"}'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    '33333333-3333-3333-3333-333333333333',
    'clinic_owner'
  ) ON CONFLICT (user_id) DO NOTHING;

END $$;