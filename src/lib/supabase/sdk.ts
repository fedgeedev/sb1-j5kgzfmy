// Auto-generated SDK for Supabase
import { createClient } from '@supabase/supabase-js';
import type { therapists, therapist_stats, therapist_activity, locations, audit_logs, profile_sections } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  therapists: () => supabase.from<therapists>('therapists'),
  therapist_stats: () => supabase.from<therapist_stats>('therapist_stats'),
  therapist_activity: () => supabase.from<therapist_activity>('therapist_activity'),
  locations: () => supabase.from<locations>('locations'),
  audit_logs: () => supabase.from<audit_logs>('audit_logs'),
  profile_sections: () => supabase.from<profile_sections>('profile_sections'),
};
