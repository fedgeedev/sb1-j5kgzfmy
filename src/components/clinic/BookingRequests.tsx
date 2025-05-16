import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Check, X } from 'lucide-react';
import { logUserActivity } from '@/utils/logUserActivity';

interface BookingRequest {
  id: string;
  client_name: string;
  service: string;
  requested_date: string;
  status: string;
}

const BookingRequests: React.FC = () => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .order('requested_date', { ascending: true });
      if (!error && data) setRequests(data);
    };
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      await logUserActivity({
        action: `booking_${newStatus}`,
        target: `booking:${id}`,
        details: `Booking ${id} was ${newStatus} via admin panel`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Booking Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending booking requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req.id} className="bg-white p-4 shadow rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-[#004D4D]">{req.client_name}</p>
                  <p className="text-xs text-gray-600">Service: {req.service}</p>
                  <p className="text-xs text-gray-500">Requested Date: {new Date(req.requested_date).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'accepted')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'rejected')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingRequests;