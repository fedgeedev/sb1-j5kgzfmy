DO $$ 
BEGIN
  -- Super Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000') THEN
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
    );

    INSERT INTO public.users_metadata (
      user_id,
      full_name,
      phone,
      avatar_url,
      preferences
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'System Administrator',
      '+1111111111',
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      '{"theme": "dark", "notifications": true, "admin_dashboard": {"default_view": "overview"}}'
    );
  END IF;

  -- Regular User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111') THEN
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
      '{"theme": "light", "notifications": true, "preferred_languages": ["English", "Spanish"]}'
    );
  END IF;

  -- Therapist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '22222222-2222-2222-2222-222222222222') THEN
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
    );

    INSERT INTO public.therapists (
      user_id,
      profile_data,
      status,
      is_visible,
      rating,
      likes,
      locations
    ) VALUES (
      '22222222-2222-2222-2222-222222222222',
      '{
        "fullName": "Dr. Michael Chen",
        "qualifications": "Ph.D. Clinical Psychology, Licensed Psychotherapist",
        "specializations": ["Anxiety", "Depression", "Trauma", "Relationships", "Stress Management"],
        "languages": ["English", "Mandarin", "Cantonese"],
        "bio": "With over 10 years of experience, I specialize in helping individuals overcome anxiety, depression, and trauma. My approach combines cognitive-behavioral therapy with mindfulness techniques.",
        "phone": "+1987654321",
        "email": "therapist@theraway.com",
        "profilePhoto": "https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg",
        "education": [
          {
            "degree": "Ph.D. Clinical Psychology",
            "institution": "Stanford University",
            "year": 2012
          },
          {
            "degree": "M.A. Psychology",
            "institution": "UC Berkeley",
            "year": 2008
          }
        ],
        "certifications": [
          {
            "name": "Licensed Clinical Psychologist",
            "issuer": "California Board of Psychology",
            "year": 2013
          }
        ],
        "sessionTypes": ["Individual", "Couples", "Online"],
        "sessionDuration": 50,
        "sessionFees": {
          "individual": 150,
          "couples": 180,
          "online": 130
        }
      }'::jsonb,
      'validated',
      true,
      4.8,
      42,
      '[
        {
          "title": "Main Office",
          "address": "123 Healing Street, San Francisco, CA 94105",
          "lat": 37.7897,
          "lng": -122.3942,
          "isMain": true
        },
        {
          "title": "Secondary Location",
          "address": "456 Wellness Ave, San Jose, CA 95113",
          "lat": 37.3359,
          "lng": -121.8906,
          "isMain": false
        }
      ]'::jsonb
    );
  END IF;

  -- Clinic Owner
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '33333333-3333-3333-3333-333333333333') THEN
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
      'A modern therapy center focused on holistic mental health care. Our facility offers a calm and welcoming environment where clients can feel safe and supported on their healing journey.',
      '123 Healing Street, San Francisco, CA 94105',
      'clinic@theraway.com',
      '+1122334455',
      '[
        "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
        "https://images.pexels.com/photos/3255761/pexels-photo-3255761.jpeg",
        "https://images.pexels.com/photos/4046567/pexels-photo-4046567.jpeg"
      ]',
      '[
        "WiFi",
        "Wheelchair Accessible",
        "Private Parking",
        "Meditation Room",
        "Sound-Proof Rooms",
        "Water Service",
        "Air Conditioning"
      ]',
      'approved',
      true
    );

    -- Add clinic services
    INSERT INTO public.clinic_services (
      clinic_id,
      name,
      description,
      duration,
      price,
      is_available
    ) VALUES
    (
      'c1111111-1111-1111-1111-111111111111',
      'Individual Therapy',
      'One-on-one therapy sessions tailored to your needs',
      50,
      150.00,
      true
    ),
    (
      'c1111111-1111-1111-1111-111111111111',
      'Couples Counseling',
      'Professional guidance for couples seeking to improve their relationship',
      80,
      180.00,
      true
    ),
    (
      'c1111111-1111-1111-1111-111111111111',
      'Group Therapy',
      'Supportive group sessions led by experienced therapists',
      90,
      75.00,
      true
    );

    -- Add clinic availability
    INSERT INTO public.clinic_availability (
      clinic_id,
      day_of_week,
      open_time,
      close_time,
      is_closed
    ) VALUES
    (
      'c1111111-1111-1111-1111-111111111111',
      1,
      '09:00',
      '18:00',
      false
    ),
    (
      'c1111111-1111-1111-1111-111111111111',
      2,
      '09:00',
      '18:00',
      false
    ),
    (
      'c1111111-1111-1111-1111-111111111111',
      3,
      '09:00',
      '18:00',
      false
    ),
    (
      'c1111111-1111-1111-1111-111111111111',
      4,
      '09:00',
      '18:00',
      false
    ),
    (
      'c1111111-1111-1111-1111-111111111111',
      5,
      '09:00',
      '17:00',
      false
    ),
    (
      'c1111111-1111-1111-1111-111111111111',
      6,
      '10:00',
      '15:00',
      false
    ),
    (
      'c1111111-1111-1111-1111-111111111111',
      0,
      '00:00',
      '00:00',
      true
    );
  END IF;

  -- Associate therapist with clinic if both exist
  IF EXISTS (
    SELECT 1 FROM public.clinics WHERE id = 'c1111111-1111-1111-1111-111111111111'
  ) AND EXISTS (
    SELECT 1 FROM public.therapists WHERE user_id = '22222222-2222-2222-2222-222222222222'
  ) THEN
    INSERT INTO public.clinic_therapists (
      clinic_id,
      therapist_id,
      start_date,
      status
    ) VALUES (
      'c1111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      CURRENT_DATE,
      'active'
    ) ON CONFLICT (clinic_id, therapist_id) DO NOTHING;
  END IF;

  -- Add reviews if users exist
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111'
  ) THEN
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
      'Dr. Chen is an exceptional therapist. His approach combining CBT with mindfulness techniques has helped me tremendously with my anxiety. Highly recommended!',
      true
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.clinic_reviews (
      clinic_id,
      reviewer_id,
      rating,
      content,
      is_verified
    ) VALUES (
      'c1111111-1111-1111-1111-111111111111',
      '11111111-1111-1111-1111-111111111111',
      5,
      'The Wellness Center provides a peaceful and professional environment. The facilities are modern and the staff is very welcoming.',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Add notification preferences for all users
  INSERT INTO public.notification_preferences (
    user_id,
    email_enabled,
    push_enabled,
    types
  )
  SELECT
    id,
    true,
    true,
    CASE
      WHEN raw_user_meta_data->>'role' = 'super_admin' THEN '{"system": true, "security": true}'
      WHEN raw_user_meta_data->>'role' = 'user' THEN '{"message": true, "booking": true, "review": true}'
      ELSE '{"booking": true, "review": true, "system": true}'
    END::jsonb
  FROM auth.users
  WHERE id IN (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Add activity logs
  INSERT INTO public.user_activity (
    user_email,
    action,
    metadata
  ) VALUES
  (
    'user@theraway.com',
    'REVIEW_SUBMITTED',
    '{"therapist_id": "22222222-2222-2222-2222-222222222222", "rating": 5}'
  ),
  (
    'therapist@theraway.com',
    'PROFILE_UPDATED',
    '{"fields": ["specializations", "languages"]}'
  ),
  (
    'clinic@theraway.com',
    'SERVICE_ADDED',
    '{"service": "Individual Therapy"}'
  );

END $$;