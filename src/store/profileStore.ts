import { create } from 'zustand';
import { TherapistProfile } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ProfileState {
  profile: TherapistProfile;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<TherapistProfile>) => void;
  saveProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: {},
  userId: null,
  isLoading: true,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      set({ error: 'User not authenticated', isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('therapists')
      .select('profile_data')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      set({ error: 'Failed to fetch profile', isLoading: false });
      return;
    }

    set({
      userId: user.id,
      profile: data.profile_data || {},
      isLoading: false,
      error: null,
    });
  },

  updateProfile: (updates) => {
    set((state) => ({
      profile: {
        ...state.profile,
        ...updates,
      },
    }));
  },

  saveProfile: async () => {
    const { userId, profile } = get();

    if (!userId) {
      set({ error: 'Cannot save: no user ID' });
      return;
    }

    const { error } = await supabase
      .from('therapists')
      .update({ profile_data: profile })
      .eq('id', userId);

    if (!error) {
      await supabase.from('audit_logs').insert({
        actor_id: userId,
        actor_email: null, // optionally fetch again if needed
        action: 'UPDATE_PROFILE',
        target: userId,
        details: 'Saved profile changes from ProfileStore',
      });
    }

    set({ error: error?.message || null });
  },
}));
