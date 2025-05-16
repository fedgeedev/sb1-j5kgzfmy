/*
  # Fix Therapist Reviews and Rating System

  1. Changes
    - Add functions for calculating and updating therapist ratings
    - Handle duplicate reviews before adding unique constraint
    - Add RLS policies for review management
    
  2. Security
    - Enable RLS on therapist_reviews
    - Add policies for review creation and viewing
*/

-- Drop existing functions first
DROP FUNCTION IF EXISTS update_therapist_rating();
DROP FUNCTION IF EXISTS calculate_therapist_rating(UUID);

-- Function to calculate and update therapist rating
CREATE OR REPLACE FUNCTION calculate_therapist_rating(therapist_uuid UUID)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating numeric;
BEGIN
  SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
  INTO avg_rating
  FROM therapist_reviews
  WHERE therapist_id = therapist_uuid
  AND is_verified = true;
  
  -- Update therapist rating
  UPDATE therapists
  SET rating = avg_rating
  WHERE user_id = therapist_uuid;
  
  RETURN avg_rating;
END;
$$;

-- Trigger function to update rating on review changes
CREATE OR REPLACE FUNCTION update_therapist_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM calculate_therapist_rating(NEW.therapist_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM calculate_therapist_rating(OLD.therapist_id);
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS update_rating_trigger ON therapist_reviews;
CREATE TRIGGER update_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON therapist_reviews
FOR EACH ROW
EXECUTE FUNCTION update_therapist_rating();

-- Remove duplicate reviews (keep the most recent one)
DELETE FROM therapist_reviews a USING therapist_reviews b
WHERE a.reviewer_id = b.reviewer_id 
  AND a.therapist_id = b.therapist_id 
  AND a.created_at < b.created_at;

-- Now add unique constraint
ALTER TABLE therapist_reviews
DROP CONSTRAINT IF EXISTS unique_reviewer_therapist;

ALTER TABLE therapist_reviews
ADD CONSTRAINT unique_reviewer_therapist 
UNIQUE (reviewer_id, therapist_id);

-- Add RLS policies for therapist reviews
ALTER TABLE therapist_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create/update their own reviews" ON therapist_reviews;
CREATE POLICY "Users can create/update their own reviews"
ON therapist_reviews
FOR ALL
TO authenticated
USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Public can view verified reviews" ON therapist_reviews;
CREATE POLICY "Public can view verified reviews"
ON therapist_reviews
FOR SELECT
TO public
USING (is_verified = true);