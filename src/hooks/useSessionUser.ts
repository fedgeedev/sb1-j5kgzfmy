import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SessionUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  [key: string]: any;
}

export function useSessionUser(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.warn('User not found or failed to fetch:', authError);
        setUser(null);
        return;
      }

      const { id, email, user_metadata } = authUser;
      const role = user_metadata?.role;

      // Check if user exists in their role-specific table
      let userExists = false;
      let userData = {};

      switch (role) {
        case 'admin': {
          const { data } = await supabase
            .from('users_metadata')
            .select('*')
            .eq('user_id', id)
            .single();
          if (data) {
            userExists = true;
            userData = data;
          }
          break;
        }
        case 'therapist': {
          const { data } = await supabase
            .from('therapists')
            .select('*')
            .eq('user_id', id)
            .single();
          if (data) {
            userExists = true;
            userData = data;
          }
          break;
        }
        case 'clinic_owner': {
          const { data } = await supabase
            .from('clinics')
            .select('*')
            .eq('owner_id', id)
            .single();
          if (data) {
            userExists = true;
            userData = data;
          }
          break;
        }
        default:
          userExists = true; // Regular users don't need specific role check
      }

      if (!userExists) {
        console.warn('User profile not found in role-specific table');
        setUser(null);
        return;
      }

      setUser({
        id,
        email,
        role,
        ...user_metadata,
        ...userData
      });
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        await fetchUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return user;
}