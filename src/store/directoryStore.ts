import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProfileSection, ProfileField } from '../types';
import { fetchProfileSections } from '../data/profileSections';

interface DirectoryState {
  sections: ProfileSection[];
  editMode: boolean;
  currentValues: Record<string, any>;
  setSections: (sections: ProfileSection[]) => void;
  setEditMode: (mode: boolean) => void;
  updateValue: (fieldId: string, value: any) => void;
  saveChanges: () => void;
  discardChanges: () => void;
  updateSection: (sectionId: string, updates: Partial<ProfileSection>) => void;
  addSection: (section: ProfileSection) => void;
  removeSection: (sectionId: string) => void;
  updateField: (sectionId: string, fieldId: string, updates: Partial<ProfileField>) => void;
  addField: (sectionId: string, field: ProfileField) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  getFieldById: (fieldId: string) => ProfileField | undefined;
  getAllFields: () => ProfileField[];
  getFilterableFields: () => ProfileField[];
  loadSectionsFromDB: () => Promise<void>;
}

export const useDirectoryStore = create<DirectoryState>()(
  persist(
    (set, get) => ({
      sections: [],
      editMode: false,
      currentValues: {},
      setSections: (sections) => set({ sections }),
      setEditMode: (mode) => set({ editMode: mode }),
      updateValue: (fieldId, value) =>
        set((state) => ({
          currentValues: {
            ...state.currentValues,
            [fieldId]: value,
          },
        })),
      saveChanges: () =>
        set((state) => ({
          editMode: false,
          currentValues: {},
        })),
      discardChanges: () => set({ editMode: false, currentValues: {} }),
      updateSection: (sectionId, updates) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId ? { ...section, ...updates } : section
          ),
        })),
      addSection: (section) =>
        set((state) => ({
          sections: [...state.sections, section],
        })),
      removeSection: (sectionId) =>
        set((state) => ({
          sections: state.sections.filter((section) => section.id !== sectionId),
        })),
      updateField: (sectionId, fieldId, updates) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  fields: section.fields.map((field) =>
                    field.id === fieldId ? { ...field, ...updates } : field
                  ),
                }
              : section
          ),
        })),
      addField: (sectionId, field) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, fields: [...section.fields, field] }
              : section
          ),
        })),
      removeField: (sectionId, fieldId) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  fields: section.fields.filter((field) => field.id !== fieldId),
                }
              : section
          ),
        })),
      getFieldById: (fieldId) => {
        const state = get();
        for (const section of state.sections) {
          const field = section.fields.find((f) => f.id === fieldId);
          if (field) return field;
        }
        return undefined;
      },
      getAllFields: () => {
        return get().sections.flatMap((section) => section.fields);
      },
      getFilterableFields: () => {
        return get()
          .sections.flatMap((section) => section.fields)
          .filter(
            (field) =>
              (field.type === 'select' || field.type === 'multiselect') &&
              (field as any).filter === true
          );
      },
      loadSectionsFromDB: async () => {
        const sections = await fetchProfileSections();
        set({ sections });
      },
    }),
    {
      name: 'directory-store',
      version: 3,
    }
  )
);
