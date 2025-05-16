import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Clinic {
  id: string;
  name: string;
  location: string;
  specialty: string;
  contact_email: string;
  status: string;
  is_visible: boolean;
}

const ClinicBrowser: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClinics = async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('status', 'approved')
        .eq('is_visible', true);

      if (!error && data) setClinics(data);
    };
    fetchClinics();
  }, []);

  const filteredClinics = clinics.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.specialty || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Explore Clinics</h1>

      <input
        type="text"
        placeholder="Search by name, specialty, or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold text-[#004D4D]">{clinic.name}</h3>
              <p className="text-sm text-gray-500">{clinic.specialty}</p>
              <p className="text-sm text-gray-500">{clinic.location}</p>
              <a
                href={`mailto:${clinic.contact_email}`}
                className="mt-4 inline-block text-sm text-blue-600 hover:underline"
              >
                Contact
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No clinics found.</p>
        )}
      </div>
    </div>
  );
};

export default ClinicBrowser;
