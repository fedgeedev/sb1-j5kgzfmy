import React from 'react';
import { 
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCog,
  CreditCard
} from 'lucide-react';

interface Props {
  currentView: string;
  setCurrentView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onSignOut: () => void;
}

const ClinicOwnerSidebar: React.FC<Props> = ({ 
  currentView, 
  setCurrentView,
  isCollapsed,
  setIsCollapsed,
  onSignOut
}) => {
  const menuItems = [
    {
      title: 'Dashboard Overview',
      icon: LayoutDashboard,
      view: 'overview'
    },
    {
      title: 'Clinic Listings',
      icon: Building2,
      view: 'listings'
    },
    {
      title: 'Booking Requests',
      icon: CalendarCheck,
      view: 'bookings'
    },
    {
      title: 'Manage Subscription',
      icon: CreditCard,
      view: 'subscription'
    },
    {
      title: 'Settings',
      icon: UserCog,
      view: 'settings'
    }
  ];

  return (
    <div className={`fixed top-0 left-0 h-screen bg-white shadow-lg flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[#FFD700]" />
          {!isCollapsed && <span className="text-xl font-bold text-[#004D4D]">TheraWay</span>}
        </div>
        {!isCollapsed && (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#004D4D] rounded-full flex items-center justify-center text-white font-medium">
                HC
              </div>
              <div>
                <div className="font-medium text-gray-900">Healing Center</div>
                <div className="text-sm text-gray-500">Clinic Owner</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center text-left px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.view
                    ? 'bg-[#004D4D] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={isCollapsed ? item.title : ''}
              >
                <item.icon className="h-5 w-5 min-w-[20px]" />
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onSignOut}
          className="w-full flex items-center text-left px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? 'Sign Out' : ''}
        >
          <LogOut className="h-5 w-5 min-w-[20px]" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default ClinicOwnerSidebar;
