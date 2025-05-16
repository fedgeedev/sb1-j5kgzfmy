/*
  # Fix Therapist Rating Functions Search Path

  1. Changes
    - Add fixed search paths to rating functions
    - Set appropriate security contexts
    - Maintain existing functionality
*/

-- Drop existing functions and trigger first
DROP TRIGGER IF EXISTS update_rating_trigger ON therapist_reviews;
DROP FUNCTION IF EXISTS update_therapist_rating();
DROP FUNCTION IF EXISTS calculate_therapist_rating(UUID);

-- Function to calculate and update therapist rating
CREATE OR REPLACE FUNCTION calculate_therapist_rating(therapist_uuid UUID)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
SECURITY DEFINER
SET search_path = public
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
CREATE TRIGGER update_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON therapist_reviews
FOR EACH ROW
EXECUTE FUNCTION update_therapist_rating();