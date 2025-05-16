import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { logAuditAction } from '@/utils/logAuditAction';
import { User } from '@supabase/supabase-js';

type TherapistStatus = 'pending' | 'validated' | 'revoked';

interface Therapist {
  id: string;
  name: string;
  email: string;
  status: TherapistStatus;
}

const TherapistManagement: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user ?? null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTherapists = async () => {
      const { data, error } = await supabase.from('therapists').select('*');
      if (error) {
        console.error('Failed to fetch therapists:', error);
      } else {
        setTherapists(data);
      }
    };
    fetchTherapists();
  }, []);

  const updateStatus = async (
    id: string,
    newStatus: TherapistStatus,
    name: string
  ) => {
    const { error } = await supabase
      .from('therapists')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setTherapists((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );

      const action = newStatus === 'validated' ? 'VALIDATE_THERAPIST' : 'REVOKE_THERAPIST';
      const details = `Therapist '${name}' (${id}) was ${newStatus} by admin.`;

      if (currentUser?.user_metadata?.role === 'admin') {
        await logAuditAction({
          actorEmail: currentUser.email ?? 'unknown',
          action,
          target: name,
          details
        });
      }
    } else {
      console.error('Failed to update therapist status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Therapist Management</h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {therapists.map((therapist) => (
              <tr key={therapist.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{therapist.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{therapist.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700 capitalize">{therapist.status}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {therapist.status === 'pending' && (
                    <Button
                      onClick={() =>
                        updateStatus(therapist.id, 'validated', therapist.name)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Validate
                    </Button>
                  )}
                  {therapist.status === 'validated' && (
                    <Button
                      onClick={() =>
                        updateStatus(therapist.id, 'revoked', therapist.name)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TherapistManagement;
