import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Location {
  id: string;
  title: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  isMain: boolean;
}

interface LocationState {
  locations: Location[];
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  setMainLocation: (id: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      locations: [],
      addLocation: (location) =>
        set((state) => ({
          locations: [...state.locations, location],
        })),
      updateLocation: (id, updates) =>
        set((state) => ({
          locations: state.locations.map((loc) =>
            loc.id === id ? { ...loc, ...updates } : loc
          ),
        })),
      deleteLocation: (id) =>
        set((state) => ({
          locations: state.locations.filter((loc) => loc.id !== id),
        })),
      setMainLocation: (id) =>
        set((state) => ({
          locations: state.locations.map((loc) => ({
            ...loc,
            isMain: loc.id === id,
          })),
        })),
    }),
    {
      name: 'location-store',
      version: 1,
    }
  )
);