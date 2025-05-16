import React, { useState } from 'react';
import {
  Award, Languages, MapPin, ArrowRight, ArrowLeft, ArrowUp, Globe, ChevronDown, ChevronUp, Heart
} from 'lucide-react';
import { Therapist, ProfileSection } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useLikedTherapists } from '../context/LikedTherapistsContext';

interface TherapistCardProps {
  therapist: Therapist;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  onOpenProfile: () => void;
  profileSections: ProfileSection[];
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onSwipe, onOpenProfile, profileSections }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { liked, toggleLike } = useLikedTherapists();
  const profile = therapist.profile || {};
  const isLiked = liked.includes(therapist.userId);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(therapist.userId);
  };

  const renderMultiselect = (items: string[] | undefined) => (
    items?.length ? (
      <div className="flex flex-wrap gap-1">
        {items.map((item, idx) => (
          <span key={idx} className="px-1.5 py-0.5 text-[10px] bg-white/20 text-white rounded-full">{item}</span>
        ))}
      </div>
    ) : <span className="text-xs text-gray-400">Not provided</span>
  );

  return (
    <div className="flex justify-center items-center p-0 mb-16 sm:mb-0">
      <div className="relative w-full max-w-md h-[75vh] sm:h-[70vh] rounded-2xl shadow-2xl overflow-hidden bg-white">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.profilePhoto || '/default-profile.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end">
          <div className="p-4 bg-black/20 backdrop-blur-[2px] rounded-t-2xl">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{profile.fullName || 'Unnamed Therapist'}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                  <span>{therapist.likes || 0} likes</span>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-gray-200 hover:text-white"
              >
                {isExpanded ? (
                  <React.Fragment>Less <ChevronUp size={14} /></React.Fragment>
                ) : (
                  <React.Fragment>More <ChevronDown size={14} /></React.Fragment>
                )}
              </button>
            </div>

            {/* Practice Location */}
            <div className="flex items-center gap-1 text-sm text-gray-200 mb-2">
              <MapPin size={14} />
              <span>{profile.practiceLocation || 'Location not provided'}</span>
            </div>

            {/* Expandable Info */}
            {isExpanded && (
              <div className="space-y-3 text-sm">
                {/* Specializations */}
                <div>
                  <div className="text-xs text-gray-300 mb-1">Specializations</div>
                  {renderMultiselect(profile.specializations)}
                </div>

                {/* Session Types */}
                <div>
                  <div className="text-xs text-gray-300 mb-1">Session Types</div>
                  {renderMultiselect(profile.sessionTypes)}
                </div>

                {/* Languages */}
                <div>
                  <div className="text-xs text-gray-300 mb-1">Languages</div>
                  {renderMultiselect(profile.languages)}
                </div>
              </div>
            )}

            {/* Swipe Actions */}
            <div className="flex justify-between items-center pt-4 mt-3 border-t border-white/10">
              <button
                onClick={() => onSwipe('left')}
                className="flex items-center gap-1 px-3 py-1 bg-red-500/30 hover:bg-red-600/30 text-white rounded-full text-xs"
              >
                <ArrowLeft size={14} /> Skip
              </button>
              <button
                onClick={() => {
                  onSwipe('up');
                  onOpenProfile();
                }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500/30 hover:bg-blue-600/30 text-white rounded-full text-xs"
              >
                <ArrowUp size={14} /> View Profile
              </button>
              <button
                onClick={(e) => {
                  handleLike(e);
                  onSwipe('right');
                }}
                className={`flex items-center gap-1 px-3 py-1 ${
                  isLiked ? 'bg-red-500/30' : 'bg-green-500/30 hover:bg-green-600/30'
                } text-white rounded-full text-xs`}
              >
                {isLiked ? 'Liked' : 'Like'} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;