import React, { useEffect, useState } from 'react';
import {
  Heart,
  Sparkles,
  X,
  Building2,
  UserCircle,
  ChevronRight,
  Menu,
  LogOut,
} from 'lucide-react';
import ClinicOwnerRegistrationModal from './ClinicOwnerRegistrationModal';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useLikedTherapists } from '../context/LikedTherapistsContext';

interface HeaderProps {
  onOpenRegistration: () => void;
  onOpenLogin: () => void;
  onShowLiked: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onOpenRegistration,
  onOpenLogin,
  onShowLiked,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClinicRegisterOpen, setIsClinicRegisterOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { liked } = useLikedTherapists();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserRole(user?.user_metadata?.role || null);
    };
    getUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <header className="bg-white shadow-sm py-3 px-4 fixed top-0 left-0 right-0 z-30">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-[#004D4D] font-['Poppins'] font-bold text-2xl flex items-center">
              <Sparkles size={24} className="text-[#FFD700] mr-2" />
              <span>TheraWay</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onShowLiked}
              className="relative p-2 text-gray-600 hover:text-[#004D4D] hover:bg-gray-100 rounded-full transition-colors"
              title="View Liked Therapists"
            >
              <Heart size={22} />
              {liked.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {liked.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-[#004D4D] hover:bg-gray-100 rounded-full transition-colors"
              title="Professional Corner"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#004D4D]">Professional Corner</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {!userRole && (
              <div className="bg-[#004D4D]/5 rounded-lg p-4">
                <button
                  onClick={() => {
                    onOpenLogin();
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] transition-colors"
                >
                  <span>Sign In to Dashboard</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {userRole && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <span>Sign Out</span>
                <LogOut size={20} />
              </button>
            )}

            {userRole !== 'admin' && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCircle size={24} className="text-[#004D4D]" />
                    <h3 className="text-lg font-semibold">For Therapists</h3>
                  </div>
                  <button
                    onClick={() => {
                      onOpenRegistration();
                      setIsSidebarOpen(false);
                    }}
                    className="w-full py-2 px-4 text-left bg-white border border-[#004D4D] text-[#004D4D] rounded-lg hover:bg-[#004D4D]/5 transition-colors"
                  >
                    Register as Therapist
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 size={24} className="text-[#004D4D]" />
                    <h3 className="text-lg font-semibold">For Clinic Owners</h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsClinicRegisterOpen(true);
                      setIsSidebarOpen(false);
                    }}
                    className="w-full py-2 px-4 text-left bg-white border border-[#004D4D] text-[#004D4D] rounded-lg hover:bg-[#004D4D]/5 transition-colors"
                  >
                    List Your Clinic
                  </button>
                </div>
              </>
            )}

            {userRole === 'admin' && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Admin Panel</h3>
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsSidebarOpen(false);
                  }}
                  className="w-full py-2 px-4 text-left bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] transition-colors"
                >
                  Go to Admin Dashboard
                </button>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-gray-50 text-sm text-gray-600">
            Join our growing community of mental health professionals and clinic owners.
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <ClinicOwnerRegistrationModal
        isOpen={isClinicRegisterOpen}
        onClose={() => setIsClinicRegisterOpen(false)}
        onRegister={(data) => {
          console.log('Clinic registration data:', data);
          setIsClinicRegisterOpen(false);
        }}
      />
    </>
  );
};

export default Header;