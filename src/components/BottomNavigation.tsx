import React from 'react';
import { Filter } from 'lucide-react';

interface BottomNavigationProps {
  mode: 'explore' | 'browse' | 'map';
  onModeChange: (mode: 'explore' | 'browse' | 'map') => void;
  likedCount: number;
  onOpenFilter: () => void;
  filtersActive: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  mode,
  onModeChange,
  onOpenFilter,
  filtersActive
}) => {
  return (
    <div className="fixed bottom-2 left-0 right-0 flex justify-center z-30">
      <div className="flex items-center gap-2">
        {/* Mode Toggle Group */}
        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-1">
          <div className="flex">
            <button
              onClick={() => onModeChange('explore')}
              className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${
                mode === 'explore'
                  ? 'bg-[#004D4D]/90 backdrop-blur-sm text-white'
                  : 'text-gray-600 hover:bg-gray-100/80'
              }`}
            >
              Swipe
            </button>
            <button
              onClick={() => onModeChange('browse')}
              className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${
                mode === 'browse'
                  ? 'bg-[#004D4D]/90 backdrop-blur-sm text-white'
                  : 'text-gray-600 hover:bg-gray-100/80'
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => onModeChange('map')}
              className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${
                mode === 'map'
                  ? 'bg-[#004D4D]/90 backdrop-blur-sm text-white'
                  : 'text-gray-600 hover:bg-gray-100/80'
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {/* Filter Button */}
        <button 
          onClick={onOpenFilter}
          className={`p-2 rounded-full transition-all duration-300 ${
            filtersActive 
              ? 'bg-[#004D4D]/90 backdrop-blur-sm text-white shadow-lg' 
              : 'bg-white/90 backdrop-blur-sm text-gray-600 shadow-lg hover:text-[#004D4D] hover:bg-white'
          }`}
        >
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;