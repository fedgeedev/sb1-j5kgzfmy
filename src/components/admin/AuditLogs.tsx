import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuditLog {
  id: string;
  actor_email: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

const PAGE_SIZE = 20;

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
      if (!error && data) {
        setLogs(data);
        setFilteredLogs(data);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, startDate, endDate, logs]);

  const applyFilters = () => {
    let filtered = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.actor_email.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.target.toLowerCase().includes(term) ||
          log.details.toLowerCase().includes(term)
      );
    }

    if (startDate) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(endDate));
    }

    setFilteredLogs(filtered);
    setPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Target', 'Details'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.actor_email,
      log.action,
      log.target,
      log.details
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${value}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'audit_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

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
        <h1 className="text-2xl font-semibold text-[#004D4D]">Audit Logs</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] transition-colors"
        >
          <Download size={20} />
          Export Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D4D] focus:border-transparent"
          />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D4D] focus:border-transparent"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D4D] focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.actor_email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004D4D] font-semibold">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.target}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 border rounded ${page === num ? 'bg-[#004D4D] text-white' : 'bg-white text-[#004D4D] border-[#004D4D]'} hover:bg-[#004D4D]/10`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
