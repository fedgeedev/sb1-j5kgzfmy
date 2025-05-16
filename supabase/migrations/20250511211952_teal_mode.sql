/*
  # Add Profile Sections and Therapists Tables

  1. New Tables
    - `profile_sections`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `required` (boolean)
      - `order` (integer)
      - `fields` (jsonb)
      - `created_at` (timestamp)
    
    - `therapists`
      - `user_id` (uuid, primary key, references auth.users)
      - `profile_data` (jsonb)
      - `locations` (jsonb)
      - `rating` (numeric)
      - `likes` (integer)
      - `status` (text)
      - `is_visible` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading and managing data
*/

-- Create profile_sections table
CREATE TABLE IF NOT EXISTS public.profile_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  required boolean DEFAULT false,
  "order" integer NOT NULL,
  fields jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create therapists table
CREATE TABLE IF NOT EXISTS public.therapists (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  profile_data jsonb DEFAULT '{}'::jsonb,
  locations jsonb DEFAULT '[]'::jsonb,
  rating numeric DEFAULT 0,
  likes integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
  is_visible boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

-- Policies for profile_sections
CREATE POLICY "Allow public read access to profile sections"
  ON public.profile_sections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage profile sections"
  ON public.profile_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for therapists
CREATE POLICY "Allow public read access to validated and visible therapists"
  ON public.therapists
  FOR SELECT
  TO public
  USING (status = 'validated' AND is_visible = true);

CREATE POLICY "Allow therapists to manage their own profiles"
  ON public.therapists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all therapist profiles"
  ON public.therapists
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_therapists_status ON public.therapists(status);
CREATE INDEX IF NOT EXISTS idx_therapists_visibility ON public.therapists(is_visible);
CREATE INDEX IF NOT EXISTS idx_profile_sections_order ON public.profile_sections("order");