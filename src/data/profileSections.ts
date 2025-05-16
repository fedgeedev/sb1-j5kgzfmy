import { supabase } from '../lib/supabaseClient';
import { ProfileSection } from '../types';

/**
 * Fetches dynamic profile sections and their fields from the database.
 */
export const fetchProfileSections = async (): Promise<ProfileSection[]> => {
  const { data, error } = await supabase
    .from('profile_sections')
    .select(`
      id,
      name,
      description,
      required,
      order,
      fields
    `)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error loading profile sections:', error.message);
    return [];
  }

  // Convert DB field naming to camelCase for frontend consistency
  return (data || []).map(section => ({
    id: section.id,
    name: section.name,
    description: section.description,
    required: section.required,
    order: section.order,
    fields: (section.fields || []).map(field => ({
      id: field.id,
      name: field.name,
      type: field.type,
      shortPrompt: field.short_prompt,
      required: field.required,
      options: field.options || [],
      filter: field.filter ?? false
    }))
  }));
};