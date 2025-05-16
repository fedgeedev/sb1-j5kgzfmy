import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Booking {
  id: string;
  client_name: string;
  requested_date: string;
  status: string;
}

const ClinicOverview: React.FC = () => {
  const [stats, setStats] = useState({ clients: 0, bookings: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchStatsAndBookings = async () => {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, client_name, requested_date, status');

      if (!error && bookings) {
        const clientsSet = new Set(bookings.map((b) => b.client_name));
        const sorted = bookings.sort(
          (a, b) => new Date(b.requested_date).getTime() - new Date(a.requested_date).getTime()
        );
        setStats({ clients: clientsSet.size, bookings: bookings.length });
        setRecentBookings(sorted.slice(0, 5));
      }
    };

    fetchStatsAndBookings();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Clinic Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500">Total Clients</p>
          <p className="text-2xl font-semibold">{stats.clients}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500">Total Bookings</p>
          <p className="text-2xl font-semibold">{stats.bookings}</p>
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
        <ul className="space-y-2">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <li key={booking.id} className="text-sm text-gray-700">
                {booking.client_name} - {new Date(booking.requested_date).toLocaleDateString()} ({booking.status})
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500">No recent bookings.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ClinicOverview;