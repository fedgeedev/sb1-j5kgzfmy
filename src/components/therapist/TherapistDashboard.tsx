import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TherapistHeader from './TherapistHeader';
import TherapistSidebar from './TherapistSidebar';
import TherapistOverview from './TherapistOverview';
import ProfileSettings from './ProfileSettings';
import ClinicBrowser from './ClinicBrowser';
import LocationPin from './LocationPin';
import SubscriptionSettings from './SubscriptionSettings';
import Unauthorized from './Unauthorized';
import { supabase } from '../../lib/supabaseClient';
import { useDirectoryStore } from '../../store/directoryStore';

const TherapistDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const { setSections } = useDirectoryStore();

  useEffect(() => {
    const initTherapistContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const { data: therapistData, error } = await supabase
        .from('therapists')
        .select('profile_sections')
        .eq('id', user.id)
        .single();

      if (!error && therapistData?.profile_sections) {
        setSections(therapistData.profile_sections); // set admin-defined profile structure
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }

      setLoading(false);
    };

    initTherapistContext();
  }, [setSections]);

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_session');
    navigate('/');
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <TherapistOverview />;
      case 'profile':
        return <ProfileSettings />;
      case 'clinics':
        return <ClinicBrowser />;
      case 'location':
        return <LocationPin />;
      case 'subscription':
        return <SubscriptionSettings />;
      default:
        return <TherapistOverview />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  if (!authorized) {
    return <Unauthorized />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <TherapistSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onSignOut={handleSignOut}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <TherapistHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-[1600px] mx-auto">{renderView()}</div>
        </main>
      </div>
    </div>
  );
};

export default TherapistDashboard;
