export interface Clinic {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  amenities: string[];
  photos: string[];
  pricing: {
    hourly?: number;
    daily?: number;
    monthly?: number;
    packages?: {
      name: string;
      description: string;
      price: number;
      duration: string;
    }[];
  };
  availability: {
    monday?: { start: string; end: string }[];
    tuesday?: { start: string; end: string }[];
    wednesday?: { start: string; end: string }[];
    thursday?: { start: string; end: string }[];
    friday?: { start: string; end: string }[];
    saturday?: { start: string; end: string }[];
    sunday?: { start: string; end: string }[];
  };
  is_visible?: boolean;
  status: 'pending' | 'active' | 'rejected';
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicBookingRequest {
  id: string;
  clinicId: string;
  therapistId: string;
  requestedDates: {
    start: string;
    end: string;
  }[];
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
