import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useSessionUser } from '@/hooks/useSessionUser'; // assumed hook

const AdminHeader: React.FC = () => {
  const user = useSessionUser();

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search therapists, users, or settings..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004D4D] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <img
              src="https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg"
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-sm">
              <div className="font-medium text-gray-700">{user?.full_name || 'Admin User'}</div>
              <div className="text-gray-500 text-xs">{user?.email || 'admin@theraway.com'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
