import React from 'react';
import { Bell, AlertCircle, TrendingUp } from 'lucide-react';

const ClinicOwnerHeader: React.FC = () => {
  // This would eventually be fetched from a real clinic object
  const clinicStatus = {
    status: 'pending',
    message: 'Your clinic listing is pending admin verification. This usually takes 1-2 business days.',
  };

  const statusConfig = {
    pending: {
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      icon: AlertCircle,
    },
    active: {
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      icon: TrendingUp,
    },
    rejected: {
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      icon: AlertCircle,
    },
  }[clinicStatus.status];

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${statusConfig.color}`}>
          <statusConfig.icon className={`h-5 w-5 ${statusConfig.textColor}`} />
          <div>
            <span className={`font-medium ${statusConfig.textColor}`}>
              {clinicStatus.status.charAt(0).toUpperCase() + clinicStatus.status.slice(1)}
            </span>
            <span className="text-sm text-gray-600 ml-2">
              {clinicStatus.message}
            </span>
          </div>
        </div>

        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default ClinicOwnerHeader;
