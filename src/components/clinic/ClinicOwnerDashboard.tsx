import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClinicOwnerHeader from './ClinicOwnerHeader';
import ClinicOwnerSidebar from './ClinicOwnerSidebar';
import ClinicOverview from './ClinicOverview';
import ClinicListingManager from './ClinicListingManager';
import BookingRequests from './BookingRequests';
import ClinicSettings from './ClinicSettings';
import UserSettings from './UserSettings';
import ManageSubscription from './ManageSubscription';
import { useSessionUser } from '@/hooks/useSessionUser';
import { logUserActivity } from '@/utils/logUserActivity';

const ClinicOwnerDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = useSessionUser();

  useEffect(() => {
    if (user?.role !== 'clinic_owner') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_session');

    if (user?.email) {
      await logUserActivity({
        userEmail: user.email,
        action: 'SIGN_OUT',
      });
    }

    navigate('/');
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <ClinicOverview />;
      case 'listings':
        return <ClinicListingManager />;
      case 'bookings':
        return <BookingRequests />;
      case 'subscription':
        return <ManageSubscription />;
      case 'settings':
        return <UserSettings />;
      default:
        return <ClinicOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ClinicOwnerSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onSignOut={handleSignOut}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <ClinicOwnerHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-[1600px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClinicOwnerDashboard;