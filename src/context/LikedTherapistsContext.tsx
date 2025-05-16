import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LikedTherapistContextType {
  liked: string[];
  likedCount: number;
  like: (id: string) => Promise<void>;
  unlike: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  isLiked: (id: string) => boolean;
  clearLiked: () => void;
}

const LikedTherapistContext = createContext<LikedTherapistContextType>({
  liked: [],
  likedCount: 0,
  like: async () => {},
  unlike: async () => {},
  toggleLike: async () => {},
  isLiked: () => false,
  clearLiked: () => {},
});

export const LikedTherapistProvider = ({ children }: { children: React.ReactNode }) => {
  const [liked, setLiked] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserAndLikes = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Fetch likes from database
        const { data: likes } = await supabase
          .from('therapist_likes')
          .select('therapist_id')
          .eq('user_id', user.id);
        
        if (likes) {
          const likedIds = likes.map(like => like.therapist_id);
          setLiked(likedIds);
          localStorage.setItem('liked_therapists', JSON.stringify(likedIds));
        }
      } else {
        // Load from localStorage for non-authenticated users
        try {
          const stored = JSON.parse(localStorage.getItem('liked_therapists') || '[]');
          setLiked(Array.isArray(stored) ? stored : []);
        } catch {
          setLiked([]);
        }
      }
    };

    loadUserAndLikes();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const user = session?.user;
        if (user) {
          setUserId(user.id);
          const { data: likes } = await supabase
            .from('therapist_likes')
            .select('therapist_id')
            .eq('user_id', user.id);
          
          if (likes) {
            const likedIds = likes.map(like => like.therapist_id);
            setLiked(likedIds);
            localStorage.setItem('liked_therapists', JSON.stringify(likedIds));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setLiked([]);
        localStorage.removeItem('liked_therapists');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const like = async (therapistId: string) => {
    if (!liked.includes(therapistId)) {
      const newLiked = [...liked, therapistId];
      setLiked(newLiked);
      localStorage.setItem('liked_therapists', JSON.stringify(newLiked));

      if (userId) {
        await supabase.from('therapist_likes').insert({
          user_id: userId,
          therapist_id: therapistId
        });
      }
    }
  };

  const unlike = async (therapistId: string) => {
    if (liked.includes(therapistId)) {
      const newLiked = liked.filter(id => id !== therapistId);
      setLiked(newLiked);
      localStorage.setItem('liked_therapists', JSON.stringify(newLiked));

      if (userId) {
        await supabase
          .from('therapist_likes')
          .delete()
          .eq('user_id', userId)
          .eq('therapist_id', therapistId);
      }
    }
  };

  const toggleLike = async (therapistId: string) => {
    if (isLiked(therapistId)) {
      await unlike(therapistId);
    } else {
      await like(therapistId);
    }
  };

  const isLiked = (id: string) => liked.includes(id);

  const clearLiked = () => {
    setLiked([]);
    localStorage.removeItem('liked_therapists');
  };

  return (
    <LikedTherapistContext.Provider
      value={{
        liked,
        likedCount: liked.length,
        like,
        unlike,
        toggleLike,
        isLiked,
        clearLiked,
      }}
    >
      {children}
    </LikedTherapistContext.Provider>
  );
};

export const useLikedTherapists = () => useContext(LikedTherapistContext);