import React from 'react';
import { X, Star, User, Share2, Heart } from 'lucide-react';
import { useLikedTherapists } from '../context/LikedTherapistsContext';
import { useTherapists } from '../hooks/useTherapists';

interface BrowseViewProps {
  onOpenProfile: (therapist: any) => void;
  onClearFilters: () => void;
}

const BrowseView: React.FC<BrowseViewProps> = ({
  onOpenProfile,
  onClearFilters,
}) => {
  const { likedTherapists, toggleLike, isLiked } = useLikedTherapists();
  const { therapists, loading, error } = useTherapists();

  const handleConnect = (therapist: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hi ${therapist.profile?.fullName?.split(' ')[0]}! 👋 I found your profile on TheraWay and I'm interested in scheduling a consultation.`;
    const whatsappUrl = `https://wa.me/${therapist.profile?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleRefer = (therapist: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Check out this therapist on TheraWay: ${therapist.profile?.fullName}\n\n${window.location.origin}/therapist/${therapist.userId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="w-full text-center py-10 text-[#004D4D] font-medium">
        Loading therapists...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-10 text-red-500">
        Failed to load therapists. Please try again.
      </div>
    );
  }

  return (
    <div className="px-2 pb-20">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#004D4D]">
            Browse Therapists
          </h2>
          <p className="text-xs text-gray-600">
            {therapists.length} therapists available
          </p>
        </div>
        {therapists.length > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
          >
            <X size={12} />
            Clear Filters
          </button>
        )}
      </div>

      {therapists.length > 0 ? (
        <div className="flex flex-col space-y-3 max-w-md mx-auto">
          {therapists.map((therapist) => {
            const liked = isLiked(therapist.userId);
            return (
              <div
                key={therapist.userId}
                className="bg-white rounded-xl shadow hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={therapist.profile?.profilePhoto}
                      alt={therapist.profile?.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <h3 className="font-['Poppins'] font-semibold text-base text-[#004D4D] truncate">
                            {therapist.profile?.fullName}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            {therapist.profile?.qualifications}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleLike(therapist)}
                          className="text-red-500 hover:text-red-600"
                          title={liked ? 'Unlike' : 'Like'}
                        >
                          <Heart
                            size={18}
                            className={liked ? 'fill-red-500' : ''}
                          />
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {(therapist.profile?.specializations ?? []).slice(0, 2).join(', ')}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {(therapist.profile?.languages ?? []).map((lang: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 text-[10px] bg-[#004D4D]/10 text-[#004D4D] rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-3 pt-3 border-t">
                    <button
                      onClick={(e) => handleConnect(therapist, e)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#25D366] text-white text-xs rounded-full hover:bg-[#22c35e] transition-colors"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                      </svg>
                      Connect
                    </button>
                    <button
                      onClick={() => onOpenProfile(therapist)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-[#004D4D] text-[#004D4D] text-xs rounded-full hover:bg-[#004D4D]/5 transition-colors"
                    >
                      <User size={14} />
                      Profile
                    </button>
                    <button
                      onClick={(e) => handleRefer(therapist, e)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 text-gray-600 hover:text-[#004D4D] hover:bg-gray-100 text-xs rounded-full transition-colors"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full text-center py-10">
          <p className="text-gray-600 font-['Lora'] text-sm">
            No therapists match your filters.
          </p>
          <button
            onClick={onClearFilters}
            className="mt-4 px-6 py-2 bg-[#004D4D] text-white text-sm rounded-full hover:bg-[#003939] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseView;
