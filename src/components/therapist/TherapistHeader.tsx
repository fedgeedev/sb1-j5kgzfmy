import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TherapistHeader: React.FC = () => {
  const [status, setStatus] = useState<string>('loading');

  useEffect(() => {
    const fetchTherapistStatus = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return setStatus('unauthenticated');

      const { data, error } = await supabase
        .from('therapists')
        .select('status')
        .eq('id', user.id)
        .single();

      if (error || !data?.status) {
        setStatus('unknown');
      } else {
        setStatus(data.status);
      }
    };

    fetchTherapistStatus();
  }, []);

  const statusDisplay = {
    validated: {
      message: 'You are approved and visible to clients.',
      color: 'text-green-700',
    },
    pending: {
      message: 'Your profile is pending admin approval.',
      color: 'text-yellow-600',
    },
    revoked: {
      message: 'Access to your profile has been revoked.',
      color: 'text-red-600',
    },
    unknown: {
      message: 'Unable to determine your profile status.',
      color: 'text-gray-500',
    },
    loading: {
      message: 'Checking your profile status...',
      color: 'text-blue-500',
    },
    unauthenticated: {
      message: 'Not logged in.',
      color: 'text-gray-400',
    }
  }[status];

  return (
    <div className={`bg-white p-4 border-b ${statusDisplay.color}`}>
      <h1 className="text-xl font-semibold text-[#004D4D]">Welcome Therapist</h1>
      <p className="text-sm mt-1">{statusDisplay.message}</p>
    </div>
  );
};

export default TherapistHeader;
