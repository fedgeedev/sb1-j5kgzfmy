import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Home, User, Users, BarChart2, LogOut } from 'lucide-react';

const TherapistSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<{ profile_photo: string; full_name: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('therapists')
        .select('profile_photo, full_name')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <Home size={16} />, path: '/dashboard' },
    { label: 'My Profile', icon: <User size={16} />, path: '/profile' },
    { label: 'Clients', icon: <Users size={16} />, path: '/clients' },
    { label: 'Analytics', icon: <BarChart2 size={16} />, path: '/analytics' },
  ];

  return (
    <aside className="bg-[#004D4D] text-white w-full max-w-[240px] h-screen flex flex-col justify-between p-4">
      <div>
        {/* Profile Section */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={profile?.profile_photo || '/default-profile.jpg'}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover border"
          />
          <div>
            <p className="text-sm font-semibold">{profile?.full_name || 'Therapist'}</p>
            <p className="text-xs text-white/70">Therapist</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 w-full text-left transition-colors ${
                location.pathname === item.path ? 'text-teal-300' : 'hover:text-teal-300'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </div>

      <button onClick={handleLogout} className="flex items-center gap-2 text-white/80 hover:text-red-400">
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
};

export default TherapistSidebar;
