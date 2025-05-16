import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { logAudit } from '../utils/logAudit'; // ✅ Import audit logging utility

interface ClinicOwnerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: any) => void;
}

const AMENITIES = ['Wi-Fi', 'Parking', 'Accessible Entrance', 'Waiting Room'];

const ClinicOwnerRegistrationModal: React.FC<ClinicOwnerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ownerDetails: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      password: '',
      confirmPassword: '',
    },
    clinicDetails: {
      name: '',
      description: '',
      address: '',
      amenities: [] as string[],
      otherAmenity: '',
      photos: [] as File[],
      pricing: {
        hourly: '',
        daily: '',
        monthly: '',
      },
      is_visible: false,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState('');
  const [uploading, setUploading] = useState(false);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    const { ownerDetails, clinicDetails } = formData;

    if (currentStep === 1) {
      const { name, email, phone, whatsapp, password, confirmPassword } = ownerDetails;
      if (!name) newErrors.name = 'Name is required';
      if (!email) newErrors.email = 'Email is required';
      if (!phone) newErrors.phone = 'Phone is required';
      if (!whatsapp) newErrors.whatsapp = 'WhatsApp number is required';
      if (!password) newErrors.password = 'Password is required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    } else if (currentStep === 2) {
      const { name, description, address } = clinicDetails;
      if (!name) newErrors.clinicName = 'Clinic name is required';
      if (!description) newErrors.description = 'Description is required';
      if (!address) newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        clinicDetails: {
          ...prev.clinicDetails,
          photos: [...prev.clinicDetails.photos, ...newFiles],
        },
      }));
    }
  };

  const uploadPhotos = async (files: File[]) => {
    const urls: string[] = [];
    setUploading(true);

    for (const file of files) {
      const path = `clinics/photos/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('public-assets').upload(path, file);
      if (!error) {
        const url = supabase.storage.from('public-assets').getPublicUrl(path).data.publicUrl;
        urls.push(url);
      }
    }

    setUploading(false);
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    const { ownerDetails, clinicDetails } = formData;
    setSubmissionError('');

    try {
      const uploadedUrls = await uploadPhotos(clinicDetails.photos);

      const { data, error } = await supabase.auth.signUp({
        email: ownerDetails.email,
        password: ownerDetails.password,
        options: {
          data: {
            role: 'clinic_owner',
            name: ownerDetails.name,
            phone: ownerDetails.phone,
            whatsapp: ownerDetails.whatsapp,
            clinic: {
              ...clinicDetails,
              photos: uploadedUrls,
              amenities: [
                ...clinicDetails.amenities,
                ...(clinicDetails.otherAmenity ? [clinicDetails.otherAmenity] : []),
              ],
            },
          },
        },
      });

      if (error) {
        setSubmissionError('Registration failed. Please try again.');
        console.error('Supabase sign up error:', error);
        return;
      }

      // ✅ Centralized audit log
      await logAudit('Registered clinic', 'clinics', `Submitted clinic "${clinicDetails.name}"`);

      onRegister({ ownerDetails, clinicDetails });
      onClose();
    } catch (err) {
      console.error('Unexpected error during registration:', err);
      setSubmissionError('Unexpected error. Please try again later.');
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.clinicDetails.amenities.includes(amenity);
      const updated = exists
        ? prev.clinicDetails.amenities.filter((a) => a !== amenity)
        : [...prev.clinicDetails.amenities, amenity];

      return {
        ...prev,
        clinicDetails: { ...prev.clinicDetails, amenities: updated },
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#004D4D]">Register as Clinic Owner</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-4">
                {['name', 'email', 'phone', 'whatsapp', 'password', 'confirmPassword'].map((field) => (
                  <input
                    key={field}
                    type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                    placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    value={formData.ownerDetails[field as keyof typeof formData.ownerDetails]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ownerDetails: {
                          ...prev.ownerDetails,
                          [field]: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                ))}
                {Object.entries(errors).map(([key, val]) => (
                  <p key={key} className="text-red-500 text-sm">{val}</p>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Clinic Name"
                  value={formData.clinicDetails.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicDetails: { ...prev.clinicDetails, name: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Description"
                  value={formData.clinicDetails.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicDetails: { ...prev.clinicDetails, description: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Clinic Address"
                  value={formData.clinicDetails.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clinicDetails: { ...prev.clinicDetails, address: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['hourly', 'daily', 'monthly'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} Rate`}
                      value={formData.clinicDetails.pricing[key as keyof typeof formData.clinicDetails.pricing]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          clinicDetails: {
                            ...prev.clinicDetails,
                            pricing: {
                              ...prev.clinicDetails.pricing,
                              [key]: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  ))}
                </div>

                <div>
                  <p className="font-medium">Amenities</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {AMENITIES.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.clinicDetails.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                        />
                        {amenity}
                      </label>
                    ))}
                    <input
                      type="text"
                      placeholder="Other..."
                      value={formData.clinicDetails.otherAmenity}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          clinicDetails: { ...prev.clinicDetails, otherAmenity: e.target.value },
                        }))
                      }
                      className="mt-2 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Upload Photos</p>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {formData.clinicDetails.photos.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    checked={formData.clinicDetails.is_visible}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clinicDetails: {
                          ...prev.clinicDetails,
                          is_visible: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span className="text-sm text-gray-600">Request listing to be publicly visible</span>
                </label>
              </div>
            )}

            {submissionError && <p className="text-red-600 text-sm mt-4">{submissionError}</p>}
            {uploading && <p className="text-sm text-blue-600 mt-2">Uploading photos...</p>}

            <div className="flex justify-between mt-6 pt-6 border-t">
              {step === 2 ? (
                <>
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-2 text-gray-600 hover:text-gray-800">
                    Back
                  </button>
                  <button type="submit" className="px-6 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939]">
                    Complete Registration
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={onClose} className="px-6 py-2 text-gray-600 hover:text-gray-800">
                    Cancel
                  </button>
                  <button type="button" onClick={handleNext} className="px-6 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939]">
                    Next
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClinicOwnerRegistrationModal;