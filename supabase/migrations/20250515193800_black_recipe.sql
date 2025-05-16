-- Drop existing functions and triggers first
DROP TRIGGER IF EXISTS update_therapist_likes_count_trigger ON therapist_likes;
DROP FUNCTION IF EXISTS update_therapist_likes_count();
DROP FUNCTION IF EXISTS increment_therapist_likes(UUID);
DROP FUNCTION IF EXISTS decrement_therapist_likes(UUID);
DROP FUNCTION IF EXISTS get_therapist_likes(UUID);

-- Function to increment therapist likes
CREATE FUNCTION increment_therapist_likes(therapist_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE therapists
  SET likes = COALESCE(likes, 0) + 1
  WHERE user_id = therapist_uuid;
END;
$$;

-- Function to decrement therapist likes
CREATE FUNCTION decrement_therapist_likes(therapist_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE therapists
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE user_id = therapist_uuid;
END;
$$;

-- Function to get therapist likes count
CREATE FUNCTION get_therapist_likes(therapist_uuid UUID)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  like_count integer;
BEGIN
  SELECT likes INTO like_count
  FROM therapists
  WHERE user_id = therapist_uuid;
  
  RETURN COALESCE(like_count, 0);
END;
$$;

-- Trigger function to update likes count
CREATE FUNCTION update_therapist_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_therapist_likes(NEW.therapist_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_therapist_likes(OLD.therapist_id);
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger on therapist_likes table
CREATE TRIGGER update_therapist_likes_count_trigger
AFTER INSERT OR DELETE ON therapist_likes
FOR EACH ROW
EXECUTE FUNCTION update_therapist_likes_count();