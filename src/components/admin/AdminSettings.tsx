import React, { useState, useEffect } from 'react';
import { Save, Bell, Lock, Globe } from 'lucide-react';
import { useSessionUser } from '@/hooks/useSessionUser';
import { supabase } from '@/lib/supabase'; // assumes Supabase client setup
import { logUserActivity } from '@/utils/logUserActivity'; // ✅ added import

const AdminSettings = () => {
  const user = useSessionUser();
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    systemUpdates: true
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    ipWhitelist: false
  });

  const [general, setGeneral] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('notifications, security, general')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setNotifications(data.notifications || notifications);
      setSecurity(data.security || security);
      setGeneral(data.general || general);
    }

    setLoading(false);
  };

  const handleNotificationChange = (setting: string) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSecurityChange = (setting: string, value: string | boolean) => {
    setSecurity(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleGeneralChange = (setting: string, value: string) => {
    setGeneral(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        user_id: user.id,
        notifications,
        security,
        general,
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Failed to save admin settings:', error);
    } else {
      console.log('Settings saved successfully');

      // ✅ Log user activity (Step 2)
      await logUserActivity({
        action: 'UPDATE_ADMIN_SETTINGS',
        user_email: user.email,
      });
    }
  };

  if (loading) return <div className="p-6 text-center">Loading settings...</div>;
  if (user?.role !== 'admin') return <div className="p-6 text-center text-red-600">Access denied.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#004D4D]">Admin Settings</h2>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] transition-colors"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* Notifications Section */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={20} className="text-[#004D4D]" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value}
                  onChange={() => handleNotificationChange(key)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#004D4D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004D4D]"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} className="text-[#004D4D]" />
          <h3 className="text-lg font-semibold">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Two-Factor Authentication</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={security.twoFactorAuth}
                onChange={() => handleSecurityChange('twoFactorAuth', !security.twoFactorAuth)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#004D4D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004D4D]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Session Timeout (minutes)</span>
            <select
              value={security.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004D4D]"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="120">120</option>
            </select>
          </div>
        </div>
      </section>

      {/* General Settings Section */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} className="text-[#004D4D]" />
          <h3 className="text-lg font-semibold">General Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Language</span>
            <select
              value={general.language}
              onChange={(e) => handleGeneralChange('language', e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004D4D]"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Timezone</span>
            <select
              value={general.timezone}
              onChange={(e) => handleGeneralChange('timezone', e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004D4D]"
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="GMT">GMT</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Date Format</span>
            <select
              value={general.dateFormat}
              onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004D4D]"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;
