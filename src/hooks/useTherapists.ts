import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Therapist } from '../types';

export const useTherapists = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('therapists')
        .select('id:user_id, profile:profile_data, locations, rating, likes')
        .eq('status', 'validated')
        .eq('is_visible', true);

      if (error) {
        setError('Failed to load therapists');
        setLoading(false);
        return;
      }

      setTherapists(data || []);
      setLoading(false);
    };

    fetchTherapists();
  }, []);

  return { therapists, loading, error };
};
