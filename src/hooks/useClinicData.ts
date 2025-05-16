import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ClinicOwner, Clinic } from '../types/clinic';

export const useClinicData = () => {
  const [owner, setOwner] = useState<ClinicOwner | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      // Fetch clinic owner profile
      const { data: ownerData, error: ownerError } = await supabase
        .from('clinic_owners')
        .select('*')
        .eq('id', user.id)
        .single();

      if (ownerError || !ownerData) {
        setError('Clinic owner not found');
        setLoading(false);
        return;
      }

      setOwner(ownerData);

      // Fetch clinics associated with owner
      const { data: clinicsData, error: clinicsError } = await supabase
        .from('clinics')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (clinicsError) {
        setError('Failed to fetch clinics');
      } else {
        setClinics(clinicsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return { owner, clinics, loading, error };
};
