import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const DashboardOverview: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [therapistStatusData, setTherapistStatusData] = useState<any>(null);
  const [clinicData, setClinicData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;

      if (role !== 'admin') {
        navigate('/unauthorized');
        return;
      }

      await Promise.all([
        fetchNewUsersPerDay(),
        fetchTherapistStatus(),
        fetchClinicSignups(),
        fetchRevenueByDate(),
        fetchRecentActivities()
      ]);
    };

    fetchInitialData();
  }, [navigate]);

  const fetchNewUsersPerDay = async () => {
    const { data, error } = await supabase.from('users').select('created_at');
    if (error || !data) return;

    const dateCounts: Record<string, number> = {};
    data.forEach(({ created_at }) => {
      const date = new Date(created_at).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const sorted = Object.keys(dateCounts).sort();
    setUserData({
      labels: sorted,
      datasets: [{
        label: 'New Users per Day',
        data: sorted.map(d => dateCounts[d]),
        backgroundColor: '#004D4D'
      }]
    });
  };

  const fetchTherapistStatus = async () => {
    const { data, error } = await supabase.from('therapists').select('status');
    if (error || !data) return;

    const statusCount = { validated: 0, pending: 0 };
    data.forEach(({ status }) => {
      if (status === 'validated') statusCount.validated++;
      else statusCount.pending++;
    });

    setTherapistStatusData({
      labels: ['Validated', 'Pending'],
      datasets: [{
        label: 'Therapist Status',
        data: [statusCount.validated, statusCount.pending],
        backgroundColor: ['#007373', '#FFC107']
      }]
    });
  };

  const fetchClinicSignups = async () => {
    const { data, error } = await supabase.from('clinics').select('created_at');
    if (error || !data) return;

    const dateCounts: Record<string, number> = {};
    data.forEach(({ created_at }) => {
      const date = new Date(created_at).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const sorted = Object.keys(dateCounts).sort();
    setClinicData({
      labels: sorted,
      datasets: [{
        label: 'Clinic Signups',
        data: sorted.map(d => dateCounts[d]),
        backgroundColor: '#00B3B3'
      }]
    });
  };

  const fetchRevenueByDate = async () => {
    const { data, error } = await supabase.from('payments').select('amount, created_at');
    if (error || !data) return;

    const dateSums: Record<string, number> = {};
    data.forEach(({ amount, created_at }) => {
      const date = new Date(created_at).toISOString().split('T')[0];
      dateSums[date] = (dateSums[date] || 0) + amount;
    });

    const sorted = Object.keys(dateSums).sort();
    setRevenueData({
      labels: sorted,
      datasets: [{
        label: 'Revenue by Day',
        data: sorted.map(d => dateSums[d]),
        backgroundColor: '#17B978'
      }]
    });
  };

  const fetchRecentActivities = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (!error && data) setActivityLogs(data);
  };

  return (
    <div className="space-y-8 px-4 pb-16">
      <h1 className="text-2xl font-bold text-[#004D4D]">Dashboard Overview</h1>

      {/* User Signups */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">New User Signups</h3>
        {userData ? <Bar data={userData} /> : <p className="text-sm text-gray-500">Loading user chart...</p>}
      </div>

      {/* Therapist Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Therapist Validation Status</h3>
        {therapistStatusData ? <Doughnut data={therapistStatusData} /> : <p className="text-sm text-gray-500">Loading therapist status chart...</p>}
      </div>

      {/* Clinic Signups */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Clinic Signups Over Time</h3>
        {clinicData ? <Line data={clinicData} /> : <p className="text-sm text-gray-500">Loading clinic signup chart...</p>}
      </div>

      {/* Revenue */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
        {revenueData ? <Line data={revenueData} /> : <p className="text-sm text-gray-500">Loading revenue chart...</p>}
      </div>

      {/* Audit Logs */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Link to="/admin/audit-logs" className="text-sm text-[#004D4D] font-medium hover:underline">
            View All Activity
          </Link>
        </div>
        <ul className="divide-y divide-gray-200 text-sm">
          {activityLogs.length ? (
            activityLogs.map((log) => (
              <li key={log.id} className="py-3">
                <div className="text-gray-700">
                  <strong>{log.actor_email}</strong> performed <strong>{log.action}</strong> on <strong>{log.target}</strong>
                </div>
                <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
                <div className="text-xs text-gray-400 italic">{log.details}</div>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity available.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardOverview;
