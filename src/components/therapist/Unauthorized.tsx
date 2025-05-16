import React from 'react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
      <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
    </div>
  );
};

export default Unauthorized;