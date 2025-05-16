/*
  # Therapist-Related Tables

  1. New Tables
    - `therapist_reviews`: Reviews for therapists
    - `therapist_availability`: Therapist availability slots
    - `therapist_specializations`: Therapist specializations
    - `therapist_likes`: Liked therapists tracking
    - `therapist_stats`: Therapist statistics

  2. Security
    - Enable RLS on all tables
    - Add appropriate security policies
*/

-- Therapist Reviews
CREATE TABLE IF NOT EXISTS public.therapist_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES public.therapists(user_id),
  reviewer_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  content text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Therapist Availability
CREATE TABLE IF NOT EXISTS public.therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES public.therapists(user_id),
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time,
  end_time time,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Therapist Specializations
CREATE TABLE IF NOT EXISTS public.therapist_specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES public.therapists(user_id),
  specialization text NOT NULL,
  years_experience integer DEFAULT 0,
  certification_url text,
  created_at timestamptz DEFAULT now()
);

-- Therapist Likes
CREATE TABLE IF NOT EXISTS public.therapist_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES public.therapists(user_id),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(therapist_id, user_id)
);

-- Therapist Stats
CREATE TABLE IF NOT EXISTS public.therapist_stats (
  therapist_id uuid PRIMARY KEY REFERENCES public.therapists(user_id),
  profile_views integer DEFAULT 0,
  total_likes integer DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.therapist_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view verified reviews"
  ON public.therapist_reviews
  FOR SELECT
  TO public
  USING (is_verified = true);

CREATE POLICY "Users can manage their own reviews"
  ON public.therapist_reviews
  FOR ALL
  TO authenticated
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Public can view therapist availability"
  ON public.therapist_availability
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Therapists can manage their availability"
  ON public.therapist_availability
  FOR ALL
  TO authenticated
  USING (auth.uid() = therapist_id);

CREATE POLICY "Public can view therapist specializations"
  ON public.therapist_specializations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Therapists can manage their specializations"
  ON public.therapist_specializations
  FOR ALL
  TO authenticated
  USING (auth.uid() = therapist_id);

CREATE POLICY "Users can manage their likes"
  ON public.therapist_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view therapist stats"
  ON public.therapist_stats
  FOR SELECT
  TO public
  USING (true);