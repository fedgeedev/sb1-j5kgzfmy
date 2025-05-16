import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLikedTherapists } from '../context/LikedTherapistContext';
import { Heart } from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  specialty: string;
  location: string;
  email: string;
  bio: string;
  is_visible: boolean;
  status: string;
}

const TherapistDirectory: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toggleLike, isLiked } = useLikedTherapists();

  useEffect(() => {
    const fetchTherapists = async () => {
      const { data, error } = await supabase
        .from('therapists')
        .select('id, name, specialty, location, email, bio, is_visible, status')
        .eq('status', 'validated')
        .eq('is_visible', true);

      if (!error && data) setTherapists(data);
      else console.error('Failed to fetch therapists:', error);
    };

    fetchTherapists();
  }, []);

  const filteredTherapists = therapists.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Therapist Directory</h1>

      <input
        type="text"
        placeholder="Search by name, specialty, or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredTherapists.length > 0 ? (
          filteredTherapists.map((therapist) => (
            <div key={therapist.id} className="bg-white p-4 rounded shadow relative">
              <button
                onClick={() => toggleLike(therapist.id)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
                title={isLiked(therapist.id) ? 'Unlike' : 'Like'}
              >
                <Heart
                  size={20}
                  className={isLiked(therapist.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                />
              </button>

              <h3 className="text-lg font-semibold text-[#004D4D]">{therapist.name}</h3>
              <p className="text-sm text-gray-500">{therapist.specialty}</p>
              <p className="text-sm text-gray-500">{therapist.location}</p>
              <p className="text-sm text-gray-600 mt-2">{therapist.bio}</p>
              <a
                href={`mailto:${therapist.email}`}
                className="mt-4 inline-block text-sm text-blue-600 hover:underline"
              >
                Contact
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No therapists found.</p>
        )}
      </div>
    </div>
  );
};

export default TherapistDirectory;
