import React, { useState } from 'react';
import { X, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Therapist } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTherapist: Therapist | null;
  onCompleteAuth: (therapist: Therapist) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  selectedTherapist,
  onCompleteAuth
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (mode === 'register' && !formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: 'client'
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(signUpError.message);
          }
          return;
        }

        // Create user metadata entry
        if (data.user) {
          const { error: metadataError } = await supabase
            .from('users_metadata')
            .insert({
              user_id: data.user.id,
              full_name: formData.name,
              created_at: new Date().toISOString()
            });

          if (metadataError) {
            console.error('Error creating user metadata:', metadataError);
            setError('Failed to create user profile. Please try again.');
            return;
          }
        }

      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else {
            setError(signInError.message);
          }
          return;
        }

        if (!data.user) {
          setError('No user found with these credentials.');
          return;
        }
      }

      // Log the authentication action
      await supabase.from('user_activity').insert({
        user_email: formData.email,
        action: mode === 'register' ? 'REGISTER' : 'LOGIN',
        metadata: { via: 'auth_modal' }
      });

      if (selectedTherapist) onCompleteAuth(selectedTherapist);
      onClose();
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b">
          <h2 className="font-['Poppins'] font-semibold text-xl text-center text-[#004D4D]">
            {mode === 'register' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-center text-gray-600 font-['Lora'] mb-6">
            {mode === 'register' ? 'Sign up to connect with ' : 'Sign in to connect with '}
            <span className="font-medium text-[#004D4D]">
              {selectedTherapist?.name || 'your therapist'}
            </span>
          </p>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D4D] focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D4D] focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D4D] focus:border-transparent"
                placeholder={mode === 'register' ? 'Create a password (min. 6 characters)' : 'Enter your password'}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#004D4D] text-white rounded-lg font-medium shadow-md hover:bg-[#003939] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'register' ? (
                <>
                  <UserPlus size={18} className="mr-2" />
                  {loading ? 'Creating Account...' : 'Create Account & Connect'}
                </>
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  {loading ? 'Signing In...' : 'Sign In & Connect'}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'register'
                ? 'Already have an account? '
                : "Don't have an account? "}
              <button
                className="text-[#004D4D] font-medium hover:underline"
                onClick={() => {
                  setMode(mode === 'register' ? 'login' : 'register');
                  setError('');
                  setFormData({ name: '', email: '', password: '' });
                }}
              >
                {mode === 'register' ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t text-xs text-center text-gray-500">
            <p>
              By continuing, you agree to TheraWay's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;