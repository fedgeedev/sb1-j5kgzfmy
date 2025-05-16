import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useDirectoryStore } from '../../store/directoryStore';
import { useProfileStore } from '../../store/profileStore';
import { supabase } from '../../lib/supabaseClient';

const ProfileSettings = () => {
  const { sections, loadSectionsFromDB } = useDirectoryStore();
  const { profile, updateProfile } = useProfileStore();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadSectionsFromDB();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  useEffect(() => {
    const defaults = sections.reduce((acc, section) => {
      acc[section.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSections(defaults);
  }, [sections]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setIsDirty(true);
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsDirty(false);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsDirty(false);

      if (user) {
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          actor_email: user.email,
          action: 'UPDATE_PROFILE',
          target: user.id,
          details: 'Updated profile via ProfileSettings'
        });
      }

      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  const handleFileUpload = (id: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [id]: file }));
    handleFieldChange(id, URL.createObjectURL(file));
  };

  const renderField = (field: any) => {
    const value = formData[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'number':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.shortPrompt}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
            placeholder={field.shortPrompt}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
          >
            <option value="">Select...</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'multiselect':
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((opt: string) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...selected, opt]
                      : selected.filter((v) => v !== opt);
                    handleFieldChange(field.id, updated);
                  }}
                  className="text-[#004D4D]"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-4">
            {value ? (
              <div className="relative">
                <img src={value} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                <button
                  onClick={() => handleFieldChange(field.id, null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-2 bg-[#004D4D] text-white rounded-lg cursor-pointer hover:bg-[#003939]">
                <Upload size={16} />
                <span>Upload</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleFileUpload(field.id, e.target.files[0])
                  }
                />
              </label>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#004D4D]">Profile Settings</h2>
        {isDirty && (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#004D4D] text-white rounded-lg">Save</button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-lg shadow">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#004D4D]">{section.name}</h3>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
              {expandedSections[section.id] ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections[section.id] && (
              <div className="px-6 pb-6 space-y-4">
                {section.fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-1">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSettings;
