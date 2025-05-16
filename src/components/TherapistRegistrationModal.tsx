import React, { useState, useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useDirectoryStore } from '../store/directoryStore';

interface TherapistRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTherapist?: (therapist: any) => void;
}

const TherapistRegistrationModal: React.FC<TherapistRegistrationModalProps> = ({
  isOpen,
  onClose,
  onNewTherapist,
}) => {
  const { sections, loadSectionsFromDB } = useDirectoryStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSectionsFromDB();
      setCurrentStep(0);
      setFormData({});
      setUploadedFiles({});
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      setSubmissionError('');
    }
  }, [isOpen, loadSectionsFromDB]);

  const handleFieldChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleFileUpload = async (id: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `therapist-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      handleFieldChange(id, publicUrl);
    } catch (err) {
      console.error('File upload error:', err);
      setErrors((prev) => ({
        ...prev,
        [id]: 'Failed to upload file. Please try again.'
      }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    const currentSection = sections[currentStep];

    if (currentStep === sections.length) {
      if (!password) newErrors.password = 'Password is required';
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    } else if (currentSection) {
      currentSection.fields.forEach((field) => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = `${field.name} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setSubmissionError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password,
        options: {
          data: {
            role: 'therapist',
            name: formData.fullName
          }
        }
      });

      if (signUpError || !user) throw signUpError;

      const { error: profileError } = await supabase
        .from('therapists')
        .insert({
          user_id: user.id,
          profile_data: formData,
          status: 'pending',
          is_visible: false
        });

      if (profileError) throw profileError;

      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        actor_email: formData.email,
        action: 'THERAPIST_REGISTRATION',
        target: 'therapists',
        details: `New therapist registration: ${formData.fullName}`
      });

      if (onNewTherapist) {
        onNewTherapist({
          userId: user.id,
          profile: formData,
          status: 'pending',
          is_visible: false
        });
      }

      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      setSubmissionError(err.message || 'Failed to complete registration');
    }
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
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.shortPrompt}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
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
                      : selected.filter((v: string) => v !== opt);
                    handleFieldChange(field.id, updated);
                  }}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(field.id, e.target.files[0]);
                }
              }}
              accept={field.accept || 'image/*'}
              className="w-full"
            />
            {value && field.type === 'file' && (
              <img
                src={value}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>
          )}
          <h2 className="text-xl font-semibold text-[#004D4D]">
            Therapist Registration
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {currentStep < sections.length ? (
            <>
              <h3 className="text-lg font-semibold">
                {sections[currentStep].name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {sections[currentStep].description}
              </p>
              {sections[currentStep].fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.name}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.id] && (
                    <p className="text-sm text-red-500">{errors[field.id]}</p>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">Create Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
                    placeholder="Enter a secure password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#004D4D]"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {submissionError && (
            <p className="text-sm text-red-600">{submissionError}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {currentStep < sections.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939]"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939]"
              >
                Complete Registration
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TherapistRegistrationModal;