import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
        <ShieldOff className="mx-auto text-red-500 mb-4" size={40} />
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 text-sm mb-6">
          You don’t have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#004D4D] text-white text-sm rounded-full hover:bg-[#003333] transition-colors"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
