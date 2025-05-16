import React, { useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import BrowseView from './views/BrowseView';
import ExploreView from './views/ExploreView';
import MapView from './views/MapView';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import TherapistRegistrationModal from './components/TherapistRegistrationModal';
import FilterModal from './components/FilterModal';
import AuthModal from './components/AuthModal';
import TherapistProfile from './components/TherapistProfile';
import LikedTherapistsView from './views/LikedTherapistsView';
import AdminDashboard from './components/admin/AdminDashboard';
import TherapistDashboard from './components/therapist/TherapistDashboard';
import ClinicOwnerDashboard from './components/clinic/ClinicOwnerDashboard';
import LoginModal from './components/LoginModal';

import { SwipeDirection, Therapist } from './types';
import { supabase } from './lib/supabaseClient';
import { LikedTherapistProvider, useLikedTherapists } from './context/LikedTherapistsContext';
import { useDirectoryStore } from './store/directoryStore';

const MainApp = () => {
  const [mode, setMode] = useState<'explore' | 'browse' | 'map'>('explore');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [whatsAppRedirect, setWhatsAppRedirect] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showLikedView, setShowLikedView] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [mapsError, setMapsError] = useState<string | null>(null);

  const { liked } = useLikedTherapists();
  const { loadSectionsFromDB } = useDirectoryStore();

  useEffect(() => {
    const fetchTherapists = async () => {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('status', 'validated')
        .eq('is_visible', true);

      if (!error && data) {
        setTherapists(data);
        setFilteredTherapists(data);
      } else {
        console.error('Failed to load therapists:', error);
      }

      setLoading(false);
    };

    fetchTherapists();
    loadSectionsFromDB(); // ✅ Load profile sections on app load
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, therapists]);

  const applyFilters = () => {
    if (Object.keys(filters).length === 0) {
      setFilteredTherapists(therapists);
      return;
    }

    const filtered = therapists.filter((therapist) => {
      return Object.entries(filters).every(([field, selectedValues]) => {
        const value = therapist.profile?.[field];
        if (!value) return false;

        return Array.isArray(value)
          ? selectedValues.every((v) => value.includes(v))
          : selectedValues.includes(value);
      });
    });

    setFilteredTherapists(filtered);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredTherapists(therapists);
  };

  const handleConnect = (link: string) => {
    if (user) {
      window.open(link, '_blank');
    } else {
      setWhatsAppRedirect(link);
      setIsAuthModalOpen(true);
    }
  };

  const likedTherapistObjects = therapists.filter((t) => liked.includes(t.userId));

  const mainContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-[70vh] text-[#004D4D] text-xl font-bold">
          Loading...
        </div>
      );
    }

    if (selectedTherapist) {
      return (
        <TherapistProfile
          therapist={selectedTherapist}
          onBack={() => setSelectedTherapist(null)}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          profileSections={useDirectoryStore.getState().sections}
        />
      );
    }

    if (showLikedView) {
      return (
        <LikedTherapistsView
          likedTherapists={likedTherapistObjects}
          onClose={() => setShowLikedView(false)}
          onSelectTherapist={(therapist) => {
            setSelectedTherapist(therapist);
            setShowLikedView(false);
          }}
          onConnect={handleConnect}
        />
      );
    }

    if (mode === 'map' && mapsError) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-[#004D4D] space-y-4">
          <p className="text-xl font-bold">Unable to load Google Maps</p>
          <p className="text-sm text-gray-600">{mapsError}</p>
          <button
            onClick={() => setMode('browse')}
            className="px-4 py-2 bg-[#004D4D] text-white rounded-lg hover:bg-[#003939] transition-colors"
          >
            Switch to Browse View
          </button>
        </div>
      );
    }

    return (
      <>
        {mode === 'explore' && (
          <ExploreView
            therapists={filteredTherapists}
            onSwipeAction={() => {}}
            onOutOfCards={() => {}}
            onOpenProfile={setSelectedTherapist}
            onModeChange={setMode}
          />
        )}
        {mode === 'browse' && (
          <BrowseView
            therapists={filteredTherapists}
            onOpenProfile={setSelectedTherapist}
            onClearFilters={clearFilters}
          />
        )}
        {mode === 'map' && (
          <MapView
            therapists={filteredTherapists}
            onSelectTherapist={setSelectedTherapist}
          />
        )}
      </>
    );
  };

  return (
    <Router>
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['places']}
        onError={() => setMapsError('Google Maps failed to load.')}
      >
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/therapist/*" element={<TherapistDashboard />} />
          <Route path="/clinic/*" element={<ClinicOwnerDashboard />} />
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gradient-to-b from-[#F0F7F7] to-[#E6F0F0]">
                <Header
                  mode={mode}
                  onModeChange={setMode}
                  likedCount={liked.length}
                  onShowLiked={() => setShowLikedView(true)}
                  onOpenFilter={() => setIsFilterOpen(true)}
                  onOpenRegistration={() => setIsRegistrationOpen(true)}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                />
                <main className="pt-20 pb-16">{mainContent()}</main>
                <BottomNavigation
                  mode={mode}
                  onModeChange={setMode}
                  likedCount={liked.length}
                  onOpenFilter={() => setIsFilterOpen(true)}
                  filtersActive={Object.keys(filters).length > 0}
                />
                <FilterModal
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                  onApply={setFilters}
                  therapists={therapists}
                  onClear={clearFilters}
                  activeFilters={filters}
                />
                <TherapistRegistrationModal
                  isOpen={isRegistrationOpen}
                  onClose={() => setIsRegistrationOpen(false)}
                  onNewTherapist={(newTherapist) => {
                    setTherapists((prev) => [newTherapist, ...prev]);
                    setIsRegistrationOpen(false);
                  }}
                />
                <AuthModal
                  isOpen={isAuthModalOpen}
                  onClose={() => setIsAuthModalOpen(false)}
                  selectedTherapist={selectedTherapist}
                  onCompleteAuth={() => {
                    setUser({ name: 'User' });
                    setIsAuthModalOpen(false);
                    if (whatsAppRedirect) {
                      window.open(whatsAppRedirect, '_blank');
                      setWhatsAppRedirect(null);
                    }
                  }}
                />
                <LoginModal
                  isOpen={isLoginModalOpen}
                  onClose={() => setIsLoginModalOpen(false)}
                />
              </div>
            }
          />
        </Routes>
      </LoadScript>
    </Router>
  );
};

const App = () => (
  <LikedTherapistProvider>
    <MainApp />
  </LikedTherapistProvider>
);

export default App;
