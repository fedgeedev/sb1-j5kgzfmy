import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Pencil, Trash2 } from 'lucide-react';
import { logUserActivity } from '@/utils/logUserActivity';

interface Clinic {
  id: string;
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
}

const ClinicListingManager: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);

  useEffect(() => {
    const fetchClinics = async () => {
      const { data, error } = await supabase.from('clinics').select('*');
      if (!error && data) setClinics(data);
    };
    fetchClinics();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this clinic?');
    if (confirmed) {
      const { error } = await supabase.from('clinics').delete().eq('id', id);
      if (!error) {
        setClinics((prev) => prev.filter((c) => c.id !== id));

        await logUserActivity({
          action: 'delete_clinic',
          target: `clinic:${id}`,
          details: `Clinic ${id} deleted from ClinicListingManager`,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Manage Your Clinics</h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clinics.map((clinic) => (
              <tr key={clinic.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{clinic.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{clinic.address}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{clinic.contact_email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{clinic.contact_phone}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button className="text-blue-600 hover:underline">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(clinic.id)}
                    className="text-red-600 hover:underline"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClinicListingManager;