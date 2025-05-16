import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const UserSettings: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    photo_url: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session?.user) return;

      const { user } = session;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile({
          name: data.name || '',
          email: user.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          photo_url: data.photo_url || '',
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = (await supabase.auth.getSession()).data.session;
    if (!session?.user) return;

    await supabase.from('profiles').upsert({
      id: session.user.id,
      name: profile.name,
      phone: profile.phone,
      bio: profile.bio,
      photo_url: profile.photo_url,
    });
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading user profile...</div>;

  return (
    <div className="space-y-6 max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">User Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
            className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Profile Picture URL</label>
          <input
            type="text"
            name="photo_url"
            value={profile.photo_url}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <button type="submit" className="bg-[#004D4D] text-white px-4 py-2 rounded hover:bg-[#003939]">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UserSettings;
