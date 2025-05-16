import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface TherapistProfileProps {
  therapistId: string;
  currentRating?: number;
}

const TherapistProfile: React.FC<TherapistProfileProps> = ({ therapistId, currentRating = 0 }) => {
  const [rating, setRating] = useState(currentRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  const handleRatingClick = async (selectedRating: number) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { error: submitError } = await supabase
        .from('therapist_reviews')
        .upsert({
          therapist_id: therapistId,
          rating: selectedRating,
        });

      if (submitError) throw submitError;

      setRating(selectedRating);
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
      console.error('Rating submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={isSubmitting}
            className={`transition-colors duration-200 ${
              isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => handleRatingClick(star)}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {isSubmitting && (
        <p className="mt-2 text-sm text-gray-600">Submitting rating...</p>
      )}
    </div>
  );
};

export default TherapistProfile;