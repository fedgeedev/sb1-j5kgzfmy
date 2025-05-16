/*
  # Create Demo Users

  1. Demo Users
    - Regular User
    - Therapist
    - Clinic Owner
    - Admin
    
  2. Associated Data
    - User metadata
    - Profile data
    - Clinic data
    - Reviews and ratings
*/

-- Regular User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'user@demo.com',
  crypt('Demo123!', gen_salt('bf')),
  now(),
  '{"role": "user", "name": "Sarah Johnson"}'::jsonb
);

INSERT INTO public.users_metadata (
  user_id,
  full_name,
  phone,
  avatar_url,
  preferences
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Sarah Johnson',
  '+1234567890',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
  '{"theme": "light", "notifications": true}'
);

-- Therapist
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'therapist@demo.com',
  crypt('Demo123!', gen_salt('bf')),
  now(),
  '{"role": "therapist", "name": "Dr. Michael Chen"}'::jsonb
);

INSERT INTO public.therapists (
  user_id,
  profile_data,
  status,
  is_visible,
  rating,
  likes
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '{
    "fullName": "Dr. Michael Chen",
    "qualifications": "Ph.D. Clinical Psychology, Licensed Psychotherapist",
    "specializations": ["Anxiety", "Depression", "Trauma"],
    "languages": ["English", "Mandarin"],
    "bio": "With over 10 years of experience, I specialize in helping individuals overcome anxiety, depression, and trauma. My approach combines cognitive-behavioral therapy with mindfulness techniques.",
    "phone": "+1987654321",
    "email": "therapist@demo.com",
    "profilePhoto": "https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg"
  }'::jsonb,
  'validated',
  true,
  4.8,
  42
);

-- Clinic Owner
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'clinic@demo.com',
  crypt('Demo123!', gen_salt('bf')),
  now(),
  '{"role": "clinic_owner", "name": "Emma Wilson"}'::jsonb
);

INSERT INTO public.clinics (
  id,
  owner_id,
  name,
  description,
  address,
  contact_email,
  contact_phone,
  photos,
  amenities,
  status,
  is_visible
) VALUES (
  'c1111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'Wellness Center',
  'A modern therapy center focused on holistic mental health care.',
  '123 Healing Street, Mindful City, MC 12345',
  'clinic@demo.com',
  '+1122334455',
  '["https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg", "https://images.pexels.com/photos/3255761/pexels-photo-3255761.jpeg"]',
  '["WiFi", "Wheelchair Accessible", "Private Parking", "Meditation Room"]',
  'approved',
  true
);

-- Admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'admin@demo.com',
  crypt('Demo123!', gen_salt('bf')),
  now(),
  '{"role": "admin", "name": "Alex Taylor"}'::jsonb
);

INSERT INTO public.users_metadata (
  user_id,
  full_name,
  phone,
  avatar_url
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Alex Taylor',
  '+1555666777',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
);

-- Add some sample reviews and activity
INSERT INTO public.therapist_reviews (
  therapist_id,
  reviewer_id,
  rating,
  content,
  is_verified
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  5,
  'Dr. Chen is an exceptional therapist. His approach combining CBT with mindfulness techniques has helped me tremendously.',
  true
);

INSERT INTO public.user_activity (
  user_email,
  action,
  metadata
) VALUES (
  'user@demo.com',
  'REVIEW_SUBMITTED',
  '{"therapist_id": "22222222-2222-2222-2222-222222222222"}'
);