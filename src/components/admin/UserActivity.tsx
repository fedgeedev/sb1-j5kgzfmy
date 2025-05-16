import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader, RefreshCw, Download, Search } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  timestamp: string;
}

const UserActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const role = data.user?.user_metadata?.role;
      if (role !== 'admin') navigate('/unauthorized');
    };
    checkAdmin();
    fetchActivities();
  }, [navigate]);

  const fetchActivities = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setActivities(data);
      setFilteredActivities(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = activities.filter(
      (log) =>
        log.user_email.toLowerCase().includes(term.toLowerCase()) ||
        log.action.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredActivities(filtered);
  };

  const exportToCSV = () => {
    const headers = ['User Email', 'Action', 'Timestamp'];
    const rows = filteredActivities.map(log => [
      log.user_email,
      log.action,
      new Date(log.timestamp).toLocaleString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'user_activity_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin text-[#004D4D]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#004D4D]">User Activity Logs</h1>
        <div className="flex gap-4">
          <button
            onClick={fetchActivities}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939]"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by email or action..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D4D] focus:border-transparent"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredActivities.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{log.user_email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserActivity;
