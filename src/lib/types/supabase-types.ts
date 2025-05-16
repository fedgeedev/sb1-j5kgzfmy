// Auto-generated from Supabase schema

export interface therapists {
  id: string;
  profile_data?: any;
  is_visible?: boolean;
  status?: string;
  created_at?: string;
}

export interface therapist_stats {
  id?: string;
  therapist_id: string;
  type: string;
  count?: number;
  updated_at?: string;
}

export interface therapist_activity {
  id?: string;
  therapist_id: string;
  type: string;
  metadata: any;
  created_at?: string;
}

export interface locations {
  id?: string;
  therapist_id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  is_main?: boolean;
  created_at?: string;
}

export interface audit_logs {
  id?: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target: string;
  details: string;
  created_at?: string;
}

export interface profile_sections {
  id?: string;
  name?: string;
  description: string;
  order_index?: number;
  fields?: any;
  created_at?: string;
}