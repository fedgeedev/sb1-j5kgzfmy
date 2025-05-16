import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Download, Loader } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { logUserActivity } from '@/utils/logUserActivity'; // ✅ Step 2 import

interface Payment {
  id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  payment_status: string;
  type: 'one_time' | 'subscription';
  created_at: string;
  user_email: string | null;
}

const RevenueManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    email: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user?.user_metadata?.role !== 'admin') return navigate('/unauthorized');

      const { data, error } = await supabase.rpc('get_payments_with_email');
      if (error) console.error(error);
      if (data) {
        setPayments(data);
        setFiltered(data);

        // ✅ Step 2: Log user activity
        await logUserActivity({
          action: 'VIEW_REVENUE_MANAGEMENT',
          user_email: user.user?.email ?? 'unknown',
        });
      }

      setLoading(false);
    };

    load();
  }, [navigate]);

  useEffect(() => {
    let filteredData = [...payments];
    const { email, type, startDate, endDate } = filters;

    if (email) {
      filteredData = filteredData.filter(p =>
        p.user_email?.toLowerCase().includes(email.toLowerCase())
      );
    }

    if (type) {
      filteredData = filteredData.filter(p => p.type === type);
    }

    if (startDate) {
      filteredData = filteredData.filter(p => new Date(p.created_at) >= new Date(startDate));
    }

    if (endDate) {
      filteredData = filteredData.filter(p => new Date(p.created_at) <= new Date(endDate));
    }

    setFiltered(filteredData);
  }, [filters, payments]);

  const setQuickFilter = (range: '7d' | 'month' | 'year' | 'all') => {
    const now = new Date();
    let start = '';

    if (range === '7d') {
      start = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (range === 'year') {
      start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    }

    setFilters(prev => ({
      ...prev,
      startDate: range === 'all' ? '' : start,
      endDate: ''
    }));
  };

  const chartData = {
    labels: filtered.map(p => new Date(p.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue',
        data: filtered.map(p => p.amount),
        fill: false,
        borderColor: '#004D4D',
        tension: 0.3
      }
    ]
  };

  const exportToCSV = () => {
    const rows = filtered.map(p => [
      new Date(p.created_at).toLocaleString(),
      p.user_email ?? '',
      p.type,
      `$${p.amount.toFixed(2)}`,
      p.payment_status
    ]);

    const headers = ['Date', 'User Email', 'Type', 'Amount', 'Status'];
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004D4D]">Revenue Management</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-[#004D4D] text-white px-4 py-2 rounded-lg hover:bg-[#003939]"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setQuickFilter('7d')} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Last 7 Days</button>
        <button onClick={() => setQuickFilter('month')} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">This Month</button>
        <button onClick={() => setQuickFilter('year')} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">This Year</button>
        <button onClick={() => setQuickFilter('all')} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">All</button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded shadow">
        <input
          type="text"
          value={filters.email}
          onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
          placeholder="User Email"
          className="border px-3 py-2 rounded"
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Types</option>
          <option value="one_time">One-Time</option>
          <option value="subscription">Subscription</option>
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
        <Line data={chartData} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">User Email</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">{new Date(p.created_at).toLocaleString()}</td>
                <td className="px-6 py-3">{p.user_email ?? 'N/A'}</td>
                <td className="px-6 py-3 capitalize">{p.type}</td>
                <td className="px-6 py-3">${p.amount.toFixed(2)}</td>
                <td className="px-6 py-3">{p.payment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueManagement;
