export interface ProfileField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file' | 'email' | 'url' | 'number';
  shortPrompt: string;
  required: boolean;
  options?: string[];
  value?: any;
  filter?: boolean;
}

export interface ProfileSection {
  id: string;
  name: string;
  description: string;
  fields: ProfileField[];
  required: boolean;
  order: number;
}

export interface TherapistProfile {
  [key: string]: any;
  fullName?: string;
  phone?: string;
  languages?: string[];
  specializations?: string[];
  qualifications?: string;
  bio?: string;
  profilePhoto?: string;
}

export interface TherapistLocation {
  title?: string;
  address: string;
  lat: number;
  lng: number;
  isMain?: boolean;
}

export interface Therapist {
  userId: string;
  profile: TherapistProfile;
  locations: TherapistLocation[];
  rating?: number;
  likes?: number;
  active?: boolean;
  is_visible?: boolean;
  status?: 'pending' | 'validated' | 'revoked';
}

export interface Review {
  id: string;
  therapistId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  date: string;
  approved: boolean;
}

export type UserRole = 'client' | 'therapist' | 'clinic_owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: UserRole;
  isVerified: boolean;
}

export type SwipeDirection = 'left' | 'right' | 'up' | null;

export interface SwipeAction {
  direction: SwipeDirection;
  therapist: Therapist;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  type: 'therapist' | 'clinic';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  notes?: string;
  metadata: Record<string, any>;
}