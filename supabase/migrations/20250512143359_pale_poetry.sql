/*
  # Clinic-Related Tables

  1. New Tables
    - `clinics`: Main clinics table
    - `clinic_therapists`: Therapists associated with clinics
    - `clinic_services`: Services offered by clinics
    - `clinic_availability`: Clinic operating hours
    - `clinic_reviews`: Reviews for clinics

  2. Security
    - Enable RLS on all tables
    - Add appropriate security policies
*/

-- Clinics
CREATE TABLE IF NOT EXISTS public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  address text,
  contact_email text,
  contact_phone text,
  photos jsonb DEFAULT '[]'::jsonb,
  amenities jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_visible boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Clinic Therapists
CREATE TABLE IF NOT EXISTS public.clinic_therapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  therapist_id uuid REFERENCES public.therapists(user_id),
  start_date date,
  end_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(clinic_id, therapist_id)
);

-- Clinic Services
CREATE TABLE IF NOT EXISTS public.clinic_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  name text NOT NULL,
  description text,
  duration integer,
  price numeric,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Clinic Availability
CREATE TABLE IF NOT EXISTS public.clinic_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time,
  close_time time,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Clinic Reviews
CREATE TABLE IF NOT EXISTS public.clinic_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id),
  reviewer_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  content text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view approved clinics"
  ON public.clinics
  FOR SELECT
  TO public
  USING (status = 'approved' AND is_visible = true);

CREATE POLICY "Owners can manage their clinics"
  ON public.clinics
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Public can view clinic therapists"
  ON public.clinic_therapists
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Clinic owners can manage therapists"
  ON public.clinic_therapists
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clinics
    WHERE clinics.id = clinic_therapists.clinic_id
    AND clinics.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view clinic services"
  ON public.clinic_services
  FOR SELECT
  TO public
  USING (is_available = true);

CREATE POLICY "Clinic owners can manage services"
  ON public.clinic_services
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clinics
    WHERE clinics.id = clinic_services.clinic_id
    AND clinics.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view clinic availability"
  ON public.clinic_availability
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Clinic owners can manage availability"
  ON public.clinic_availability
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clinics
    WHERE clinics.id = clinic_availability.clinic_id
    AND clinics.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view verified reviews"
  ON public.clinic_reviews
  FOR SELECT
  TO public
  USING (is_verified = true);

CREATE POLICY "Users can manage their clinic reviews"
  ON public.clinic_reviews
  FOR ALL
  TO authenticated
  USING (auth.uid() = reviewer_id);