import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Therapist } from '../types';
import TherapistCard from './TherapistCard';
import SwipeHint from './SwipeHint';
import { useLikedTherapists } from '../context/LikedTherapistsContext';
import { supabase } from '../lib/supabaseClient';

interface SwipeableCardsProps {
  therapists: Therapist[];
  onSwipe: (direction: 'left' | 'right' | 'up', therapist: Therapist) => void;
  onOutOfCards: () => void;
  onModeChange: (mode: 'browse' | 'map') => void;
  onOpenProfile: (therapist: Therapist) => void;
}

const SwipeableCards: React.FC<SwipeableCardsProps> = ({
  therapists,
  onSwipe,
  onOutOfCards,
  onModeChange,
  onOpenProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHint, setSwipeHint] = useState<'like' | 'skip' | 'profile' | null>(null);
  const { liked, toggleLike } = useLikedTherapists();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY);
      return 1 - Math.min(distance / 400, 0.5);
    }
  );

  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleDrag = (event: any, info: any) => {
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);

    if (absY > 80 && info.offset.y < 0) {
      setSwipeHint('profile');
    } else if (absX > 60) {
      setSwipeHint(info.offset.x > 0 ? 'like' : 'skip');
    } else {
      setSwipeHint(null);
    }
  };

  const persistLike = async (therapistId: string, liked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (liked) {
      await supabase.from('therapist_likes').insert({
        user_id: user.id,
        therapist_id: therapistId,
      }).onConflict('user_id, therapist_id').ignore();
    } else {
      await supabase.from('therapist_likes').delete()
        .eq('user_id', user.id)
        .eq('therapist_id', therapistId);
    }
  };

  const handleDragEnd = async (event: any, info: any) => {
    const threshold = 100;
    const velocity = 0.5;

    const isSwipedLeft = info.velocity.x < -velocity || info.offset.x < -threshold;
    const isSwipedRight = info.velocity.x > velocity || info.offset.x > threshold;
    const isSwipedUp = info.velocity.y < -velocity || info.offset.y < -threshold;

    const therapist = therapists[currentIndex];

    if (isSwipedLeft || isSwipedRight || isSwipedUp) {
      const direction = isSwipedLeft ? 'left' : isSwipedRight ? 'right' : 'up';
      const targetX = direction === 'left' ? -1000 : direction === 'right' ? 1000 : 0;
      const targetY = direction === 'up' ? -1000 : 0;

      animate(x, targetX, { duration: 0.5 });
      animate(y, targetY, { duration: 0.5 });

      if (direction === 'up') {
        onOpenProfile(therapist);
      } else {
        onSwipe(direction, therapist);

        if (direction === 'right') {
          toggleLike(therapist.userId);
          await persistLike(therapist.userId, true);
        } else if (direction === 'left') {
          await persistLike(therapist.userId, false);
        }
      }

      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < therapists.length) {
          setCurrentIndex(nextIndex);
          x.set(0);
          y.set(0);
        } else {
          onOutOfCards();
        }
      }, 500);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }

    setSwipeHint(null);
  };

  if (currentIndex >= therapists.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-[#F0F7F7] to-[#E6F0F0] px-6">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-[#004D4D] mb-3 font-['Poppins']">
            You're All Caught Up! 🌟
          </h2>
          <p className="text-gray-600 mb-8 font-['Lora'] leading-relaxed">
            You've seen all available therapists for now. Check back later for new profiles, or explore other ways to find your perfect match.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onModeChange('browse')}
              className="w-full px-6 py-3 bg-[#004D4D] text-white rounded-xl font-medium hover:bg-[#003333] transition-colors shadow-lg hover:shadow-xl"
            >
              Browse List View
            </button>
            <button
              onClick={() => onModeChange('map')}
              className="w-full px-6 py-3 bg-white text-[#004D4D] rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border border-[#004D4D]/10"
            >
              Explore Map View
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={constraintsRef} className="relative w-full h-full">
      {therapists
        .slice(currentIndex, currentIndex + 5)
        .reverse()
        .map((therapist, i, array) => {
          const isTop = i === array.length - 1;
          return (
            <motion.div
              key={therapist.userId}
              style={isTop ? { x, y, rotate, opacity } : {}}
              drag={isTop}
              dragConstraints={constraintsRef}
              onDrag={isTop ? handleDrag : undefined}
              onDragEnd={isTop ? handleDragEnd : undefined}
              className={`absolute top-0 left-0 w-full h-full touch-none select-none z-[${i}]`}
            >
              <TherapistCard
                therapist={therapist}
                onSwipe={(dir) => {
                  if (!isTop) return;
                  const targetX = dir === 'left' ? -1000 : dir === 'right' ? 1000 : 0;
                  const targetY = dir === 'up' ? -1000 : 0;

                  animate(x, targetX, { duration: 0.5 });
                  animate(y, targetY, { duration: 0.5 });

                  if (dir === 'up') onOpenProfile(therapist);
                  else {
                    onSwipe(dir, therapist);
                    if (dir === 'right') {
                      toggleLike(therapist.userId);
                      persistLike(therapist.userId, true);
                    } else if (dir === 'left') {
                      persistLike(therapist.userId, false);
                    }
                  }

                  setTimeout(() => {
                    setCurrentIndex((prev) => prev + 1);
                    x.set(0);
                    y.set(0);
                  }, 500);
                }}
                onOpenProfile={() => onOpenProfile(therapist)}
              />
            </motion.div>
          );
        })}
      <SwipeHint type={swipeHint} />
    </div>
  );
};

export default SwipeableCards;
