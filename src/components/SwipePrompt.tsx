import React, { useEffect, useState } from 'react';

const SwipePrompt: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000); // Hide after 10 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Left Swipe Prompt */}
      <div className="fixed left-2 md:left-6 top-1/2 transform -translate-y-1/2 rotate-[-20deg] z-40 flex flex-col items-center space-y-2">
        <div className="relative flex flex-col items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-wave" />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-wave delay-1" />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-wave delay-2" />
        </div>
        <div className="bg-gray-800/50 text-white px-3 py-1 rounded-full shadow-md text-xs font-bold animate-fade-in">
          Swipe Left to Pass
        </div>
      </div>

      {/* Right Swipe Prompt */}
      <div className="fixed right-2 md:right-6 top-1/2 transform -translate-y-1/2 rotate-[20deg] z-40 flex flex-col items-center space-y-2">
        <div className="relative flex flex-col items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-wave" />
          <span className="w-2 h-2 bg-green-500 rounded-full animate-wave delay-1" />
          <span className="w-2 h-2 bg-green-500 rounded-full animate-wave delay-2" />
        </div>
        <div className="bg-gray-800/50 text-white px-3 py-1 rounded-full shadow-md text-xs font-bold animate-fade-in">
          Swipe Right to Like
        </div>
      </div>

      {/* Up Swipe Prompt */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center space-y-2">
        <div className="relative flex flex-col items-center">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-wave" />
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-wave delay-1" />
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-wave delay-2" />
        </div>
        <div className="bg-gray-800/50 text-white px-4 py-1 rounded-full shadow-md text-xs font-bold animate-fade-in">
          Swipe Up to Connect
        </div>
      </div>
    </>
  );
};

export default SwipePrompt;
