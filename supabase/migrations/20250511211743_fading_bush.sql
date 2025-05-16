/*
  # Create Profile Sections Schema

  1. New Tables
    - profile_sections
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - required (boolean)
      - order (integer)
      - fields (jsonb)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on profile_sections table
    - Add policy for authenticated users to read
    - Add policy for admins to manage
*/

-- Create profile sections table
CREATE TABLE IF NOT EXISTS public.profile_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  required boolean DEFAULT false,
  "order" integer DEFAULT 0,
  fields jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for ordering
CREATE INDEX idx_profile_sections_order ON profile_sections("order");

-- Enable RLS
ALTER TABLE profile_sections ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow read access for all authenticated users"
  ON profile_sections
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow full access for admin users"
  ON profile_sections
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

-- Insert some default sections
INSERT INTO profile_sections (name, description, required, "order", fields) VALUES
(
  'Basic Information',
  'Essential profile information',
  true,
  1,
  '[
    {
      "id": "fullName",
      "name": "Full Name",
      "type": "text",
      "required": true,
      "shortPrompt": "Enter your full name"
    },
    {
      "id": "email",
      "name": "Email",
      "type": "email", 
      "required": true,
      "shortPrompt": "Enter your email address"
    },
    {
      "id": "phone",
      "name": "Phone",
      "type": "text",
      "required": true,
      "shortPrompt": "Enter your phone number"
    }
  ]'::jsonb
),
(
  'Professional Details',
  'Your qualifications and expertise',
  true,
  2,
  '[
    {
      "id": "qualifications",
      "name": "Qualifications",
      "type": "text",
      "required": true,
      "shortPrompt": "Enter your professional qualifications"
    },
    {
      "id": "specializations",
      "name": "Specializations",
      "type": "multiselect",
      "required": true,
      "options": ["Anxiety", "Depression", "Trauma", "Relationships", "Stress Management"],
      "filter": true
    },
    {
      "id": "languages",
      "name": "Languages",
      "type": "multiselect",
      "required": true,
      "options": ["English", "Spanish", "French", "German", "Mandarin"],
      "filter": true
    }
  ]'::jsonb
);