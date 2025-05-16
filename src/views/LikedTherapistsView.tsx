import React from 'react';
import { ChevronLeft, Heart, MessageSquare, User } from 'lucide-react';
import { Therapist } from '../types';
import { useLikedTherapists } from '../context/LikedTherapistsContext';
import { useTherapists } from '../hooks/useTherapists';

interface LikedTherapistsViewProps {
  onClose: () => void;
  onSelectTherapist: (therapist: Therapist) => void;
  onConnect: (whatsAppLink: string) => void;
}

const LikedTherapistsView: React.FC<LikedTherapistsViewProps> = ({
  onClose,
  onSelectTherapist,
  onConnect
}) => {
  const { liked, toggleLike } = useLikedTherapists();
  const { therapists } = useTherapists();
  
  // Filter therapists to only show liked ones
  const likedTherapists = therapists.filter(t => liked.includes(t.userId));

  const handleConnect = (therapist: Therapist) => {
    const name = therapist.profile?.fullName?.split(' ')[0] || 'Therapist';
    const phone = therapist.profile?.phone?.replace(/\D/g, '') || '';
    const message = `Hi ${name}! 👋 I found your profile on TheraWay and I'm interested in scheduling a consultation. Looking forward to hearing from you!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    onConnect(whatsappUrl);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#F9FAFB]">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center bg-white shadow-sm">
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="ml-2 font-['Poppins'] font-semibold text-xl">
            Liked Therapists ({likedTherapists.length})
          </h2>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4">
          {likedTherapists.length > 0 ? (
            <div className="space-y-4">
              {likedTherapists.map((therapist) => (
                <div 
                  key={therapist.userId}
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition hover:shadow-md"
                >
                  <div className="flex items-start p-4">
                    <img 
                      src={therapist.profile?.profilePhoto || '/default-profile.jpg'}
                      alt={therapist.profile?.fullName || 'Therapist'}
                      className="w-20 h-20 rounded-full object-cover mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-['Poppins'] font-semibold text-lg text-[#004D4D]">
                          {therapist.profile?.fullName || 'Unnamed Therapist'}
                        </h3>
                        <button
                          onClick={() => toggleLike(therapist.userId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Heart size={18} className="fill-red-500" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {therapist.profile?.specializations?.join(', ') || 'No specialties listed'}
                      </p>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {therapist.profile?.qualifications || 'No qualifications listed'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1 mb-3">
                        {therapist.profile?.languages?.map((lang, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-[#004D4D]/10 text-[#004D4D] rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectTherapist(therapist)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#004D4D] bg-[#004D4D]/10 rounded-full hover:bg-[#004D4D]/20 transition-colors"
                        >
                          <User size={16} />
                          View Profile
                        </button>
                        <button
                          onClick={() => handleConnect(therapist)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#004D4D] rounded-full hover:bg-[#003333] transition-colors"
                        >
                          <MessageSquare size={16} />
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Heart size={48} className="mb-4" />
              <p className="text-lg font-semibold">No liked therapists yet</p>
              <p className="text-sm">Like therapists to see them here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedTherapistsView;