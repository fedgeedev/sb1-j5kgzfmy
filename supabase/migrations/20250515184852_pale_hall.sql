/*
  # Add Likes Management Functions

  1. New Functions
    - increment_therapist_likes: Increment likes count
    - decrement_therapist_likes: Decrement likes count
    - get_therapist_likes: Get total likes for a therapist

  2. Triggers
    - Update therapist stats on like/unlike
*/

-- Function to increment therapist likes
CREATE OR REPLACE FUNCTION increment_therapist_likes(therapist_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE therapists
  SET likes = COALESCE(likes, 0) + 1
  WHERE user_id = therapist_id;

  -- Update therapist stats
  INSERT INTO therapist_stats (therapist_id, total_likes)
  VALUES (therapist_id, 1)
  ON CONFLICT (therapist_id)
  DO UPDATE SET total_likes = therapist_stats.total_likes + 1;
END;
$$;

-- Function to decrement therapist likes
CREATE OR REPLACE FUNCTION decrement_therapist_likes(therapist_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE therapists
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE user_id = therapist_id;

  -- Update therapist stats
  UPDATE therapist_stats
  SET total_likes = GREATEST(total_likes - 1, 0)
  WHERE therapist_id = therapist_id;
END;
$$;

-- Function to get total likes for a therapist
CREATE OR REPLACE FUNCTION get_therapist_likes(therapist_id UUID)
RETURNS INTEGER
LANGUAGE sql
AS $$
  SELECT COALESCE(likes, 0)
  FROM therapists
  WHERE user_id = therapist_id;
$$;