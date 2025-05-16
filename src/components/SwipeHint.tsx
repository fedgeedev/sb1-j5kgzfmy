import React from 'react';

interface SwipeHintProps {
  type: 'like' | 'skip' | 'profile' | null;
}

const SwipeHint: React.FC<SwipeHintProps> = ({ type }) => {
  if (!type) return null;

  const config = {
    like: {
      text: 'Swipe Right to Like ❤️',
      bgColor: 'bg-green-500',
    },
    skip: {
      text: 'Swipe Left to Skip ❌',
      bgColor: 'bg-red-500',
    },
    profile: {
      text: 'Swipe Up to View Profile 👆',
      bgColor: 'bg-blue-500',
    },
  }[type];

  return (
    <div
      className="fixed bottom-24 left-0 right-0 flex justify-center z-40 transition-all duration-300"
      aria-live="polite"
    >
      <div
        className={`px-5 py-2 rounded-full shadow-md animate-pulse text-white text-sm font-bold ${config.bgColor}`}
      >
        {config.text}
      </div>
    </div>
  );
};

export default SwipeHint;
