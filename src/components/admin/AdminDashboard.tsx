import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardOverview from './DashboardOverview';
import TherapistManagement from './TherapistManagement';
import ClinicManagement from './ClinicManagement';
import UserActivity from './UserActivity';
import SystemHealth from './SystemHealth';
import CommunicationCenter from './CommunicationCenter';
import RevenueManagement from './RevenueManagement';
import AuditLogs from './AuditLogs';
import AdminSettings from './AdminSettings';
import DirectoryManagement from './DirectoryManagement';
import ProfileBuilder from './ProfileBuilder';

// Hypothetical session hook
import { useSessionUser } from '@/hooks/useSessionUser';

type ViewType = 
  | 'overview' 
  | 'therapists' 
  | 'clinics'
  | 'users' 
  | 'system' 
  | 'communications' 
  | 'revenue'
  | 'audit' 
  | 'settings'
  | 'directory'
  | 'profile-builder';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = useSessionUser();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_session');
    navigate('/');
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'therapists':
        return <TherapistManagement />;
      case 'clinics':
        return <ClinicManagement />;
      case 'users':
        return <UserActivity />;
      case 'system':
        return <SystemHealth />;
      case 'communications':
        return <CommunicationCenter />;
      case 'revenue':
        return <RevenueManagement />;
      case 'audit':
        return <AuditLogs />;
      case 'settings':
        return <AdminSettings />;
      case 'directory':
        return <DirectoryManagement />;
      case 'profile-builder':
        return <ProfileBuilder />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onSignOut={handleSignOut}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-[1600px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
