/*
  # Create Therapists Table

  1. New Tables
    - `therapists`
      - `user_id` (uuid, primary key)
      - `profile_data` (jsonb)
      - `status` (text)
      - `is_visible` (boolean)
      - `rating` (numeric)
      - `likes` (integer)
      - `locations` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on therapists table
    - Add policies for:
      - Public read access for validated and visible therapists
      - Therapist can read/update their own profile
      - Admin can manage all therapists
*/

-- Create therapists table
CREATE TABLE IF NOT EXISTS public.therapists (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  profile_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'revoked')),
  is_visible boolean DEFAULT false,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  likes integer DEFAULT 0,
  locations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_therapists_status ON therapists(status);
CREATE INDEX IF NOT EXISTS idx_therapists_visibility ON therapists(is_visible);
CREATE INDEX IF NOT EXISTS idx_therapists_rating ON therapists(rating);

-- Enable RLS
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

-- Public can read validated and visible therapists
CREATE POLICY "Public can view validated therapists"
  ON therapists
  FOR SELECT
  TO public
  USING (status = 'validated' AND is_visible = true);

-- Therapists can read/update their own profile
CREATE POLICY "Therapists can manage their own profile"
  ON therapists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all therapists
CREATE POLICY "Admins can manage all therapists"
  ON therapists
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = auth.users.id
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ));