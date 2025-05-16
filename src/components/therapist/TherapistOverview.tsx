import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProfileStore } from '../../store/profileStore';
import { useDirectoryStore } from '../../store/directoryStore';

interface Stat {
  id: string;
  type: string;
  count: number;
  created_at: string;
}

const TherapistOverview: React.FC = () => {
  const [stats, setStats] = useState<{ visits: number; likes: number }>({ visits: 0, likes: 0 });
  const [recentLogs, setRecentLogs] = useState<Stat[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { profile } = useProfileStore();
  const { getAllFields } = useDirectoryStore();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const uid = user.id;
      setUserId(uid);

      const { data: visitStats } = await supabase
        .from('therapist_stats')
        .select('type, count')
        .eq('therapist_id', uid);

      const { data: logs } = await supabase
        .from('therapist_activity')
        .select('id, type, created_at')
        .eq('therapist_id', uid)
        .order('created_at', { ascending: false })
        .limit(5);

      if (visitStats) {
        const visit = visitStats.find((s) => s.type === 'visit')?.count || 0;
        const like = visitStats.find((s) => s.type === 'like')?.count || 0;
        setStats({ visits: visit, likes: like });
      }

      if (logs) setRecentLogs(logs);
    };

    fetchData();
  }, []);

  const quickViewFields = getAllFields()
    .filter((field) => field.required || field.type === 'text') // basic example of prioritization
    .slice(0, 3); // limit preview

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Therapist Overview</h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Profile Visits</p>
          <p className="text-2xl font-bold text-[#004D4D]">{stats.visits}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Likes Received</p>
          <p className="text-2xl font-bold text-[#004D4D]">{stats.likes}</p>
        </div>
      </div>

      {/* Quick Profile Fields */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Quick Profile Info</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {quickViewFields.map((field) => (
            <li key={field.id}>
              <span className="font-medium">{field.name}:</span>{' '}
              {Array.isArray(profile[field.id])
                ? (profile[field.id] as string[]).join(', ')
                : profile[field.id] || <span className="text-gray-400">N/A</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <ul className="space-y-2 text-sm">
          {recentLogs.length ? (
            recentLogs.map((log) => (
              <li key={log.id} className="text-gray-700">
                {log.type.charAt(0).toUpperCase() + log.type.slice(1)} –{' '}
                {new Date(log.created_at).toLocaleString()}
              </li>
            ))
          ) : (
            <li className="text-gray-400">No recent activity.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TherapistOverview;
