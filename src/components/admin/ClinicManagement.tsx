import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { logAuditAction } from '@/utils/logAuditAction'; // 🆕 Audit logging utility

interface Clinic {
  id: string;
  name: string;
  owner_email: string;
  status: string;
}

const ClinicManagement: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchClinics = async () => {
      const { data, error } = await supabase.from('clinics').select('*');
      if (!error && data) setClinics(data);
    };
    fetchClinics();
  }, []);

  const updateClinicStatus = async (id: string, status: string, name: string) => {
    const { error } = await supabase.from('clinics').update({ status }).eq('id', id);

    if (!error) {
      setClinics((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );

      const isApproved = status === 'approved';
      const action = isApproved ? 'APPROVE_CLINIC' : 'REVOKE_CLINIC';
      const details = `Clinic '${name}' (${id}) was ${isApproved ? 'approved' : 'revoked'} by admin.`;

      if (currentUser?.user_metadata?.role === 'admin') {
        await logAuditAction({
          actorEmail: currentUser.email,
          action,
          target: name,
          details,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Clinic Management</h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clinics.map((clinic) => (
              <tr key={clinic.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{clinic.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{clinic.owner_email}</td>
                <td className="px-6 py-4 text-sm text-gray-700 capitalize">{clinic.status}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  {clinic.status === 'pending' && (
                    <Button
                      onClick={() => updateClinicStatus(clinic.id, 'approved', clinic.name)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </Button>
                  )}
                  {clinic.status === 'approved' && (
                    <Button
                      onClick={() => updateClinicStatus(clinic.id, 'revoked', clinic.name)}
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

export default ClinicManagement;
