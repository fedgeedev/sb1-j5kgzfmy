import React from 'react';
import SwipeableCards from '../components/SwipeableCards';
import { useTherapists } from '../hooks/useTherapists';
import { Therapist } from '../types';

interface ExploreViewProps {
  onSwipeAction: (direction: 'left' | 'right' | 'up', therapist: Therapist) => void;
  onOutOfCards: () => void;
  onOpenProfile: (therapist: Therapist) => void;
  onModeChange: (mode: 'browse' | 'map') => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({
  onSwipeAction,
  onOutOfCards,
  onOpenProfile,
  onModeChange,
}) => {
  const { therapists, loading, error } = useTherapists();

  if (loading) {
    return (
      <div className="fixed top-[5rem] bottom-[4rem] inset-x-4 flex items-center justify-center z-0">
        <p className="text-[#004D4D] font-medium text-sm">Loading therapists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-[5rem] bottom-[4rem] inset-x-4 flex items-center justify-center z-0">
        <p className="text-red-500 text-sm">Failed to load therapists. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="fixed top-[5rem] bottom-[4rem] inset-x-4 flex items-center justify-center z-0">
      {therapists.length > 0 ? (
        <div className="w-full max-w-md h-full flex flex-col justify-center">
          <SwipeableCards
            therapists={therapists}
            onSwipe={onSwipeAction}
            onOutOfCards={onOutOfCards}
            onModeChange={onModeChange}
            onOpenProfile={onOpenProfile}
          />
        </div>
      ) : (
        <div className="text-center px-4">
          <h3 className="text-lg text-gray-600 font-medium">No therapists found.</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4">
            Try adjusting or clearing your filters to explore more therapists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#004D4D] text-white px-4 py-2 rounded-full hover:bg-[#003333] transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreView;
