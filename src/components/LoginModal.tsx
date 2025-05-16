import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (loginError || !data?.user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Check if user exists in respective role table
      const role = data.user.user_metadata?.role;
      let userExists = false;

      switch (role) {
        case 'admin': {
          const { data: adminData } = await supabase
            .from('users_metadata')
            .select('user_id')
            .eq('user_id', data.user.id)
            .single();
          userExists = !!adminData;
          break;
        }
        case 'therapist': {
          const { data: therapistData } = await supabase
            .from('therapists')
            .select('user_id')
            .eq('user_id', data.user.id)
            .single();
          userExists = !!therapistData;
          break;
        }
        case 'clinic_owner': {
          const { data: clinicData } = await supabase
            .from('clinics')
            .select('owner_id')
            .eq('owner_id', data.user.id)
            .single();
          userExists = !!clinicData;
          break;
        }
        default:
          userExists = true; // Regular users don't need specific role check
      }

      if (!userExists) {
        setError('User profile not found. Please contact support.');
        setLoading(false);
        return;
      }

      // Log the successful login
      await supabase.from('user_activity').insert({
        user_email: credentials.email,
        action: 'LOGIN',
        metadata: { role }
      });

      // Redirect based on role
      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'therapist':
          navigate('/therapist');
          break;
        case 'clinic_owner':
          navigate('/clinic');
          break;
        default:
          navigate('/dashboard');
      }

      onClose();
    } catch (err) {
      console.error('Login error:', err);
      setError('Unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative p-6 border-b">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-8 w-8 text-[#FFD700]" />
              <h1 className="text-2xl font-bold text-[#004D4D]">TheraWay</h1>
            </div>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-[#004D4D] text-white rounded-lg font-medium shadow-md hover:bg-[#003939] transition-colors flex items-center justify-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <LogIn size={18} />
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;