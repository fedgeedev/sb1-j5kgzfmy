import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Therapist } from '../types';

interface MapViewProps {
  therapists: Therapist[];
  onSelectTherapist: (therapist: Therapist) => void;
}

const containerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '1rem',
};

const MapView: React.FC<MapViewProps> = ({ therapists, onSelectTherapist }) => {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
        }
      );
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
    const bounds = new window.google.maps.LatLngBounds();

    therapists.forEach((t) => {
      t.locations?.forEach((loc) => {
        bounds.extend({ lat: loc.lat, lng: loc.lng });
      });
    });

    if (userLocation) {
      bounds.extend(userLocation);
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, [therapists, userLocation]);

  const handleTherapistSelect = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    onSelectTherapist(therapist);
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-600">Map configuration is missing. Please check your environment variables.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] relative rounded-xl overflow-hidden shadow-xl">
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
          />
        )}

        <MarkerClusterer>
          {(clusterer) =>
            therapists.flatMap((therapist) =>
              therapist.locations?.map((loc, idx) => (
                <Marker
                  key={`${therapist.userId}-${idx}`}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  clusterer={clusterer}
                  onClick={() => handleTherapistSelect(therapist)}
                  icon={{
                    url:
                      selectedTherapist?.userId === therapist.userId
                        ? 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                        : loc.isMain
                        ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                        : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  }}
                />
              )) || []
            )
          }
        </MarkerClusterer>

        {selectedTherapist?.locations?.[0] && (
          <InfoWindow
            position={{
              lat: selectedTherapist.locations[0].lat,
              lng: selectedTherapist.locations[0].lng,
            }}
            onCloseClick={() => setSelectedTherapist(null)}
          >
            <div className="text-[#004D4D] font-['Poppins']">
              <h3 className="text-md font-bold mb-1">
                {selectedTherapist.profile?.fullName || 'Unnamed Therapist'}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {selectedTherapist.locations[0].address}
              </p>
              <button
                className="px-3 py-1 bg-[#004D4D] text-white text-xs rounded-full hover:bg-[#003939] transition-colors"
                onClick={() => onSelectTherapist(selectedTherapist)}
              >
                View Profile
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapView;
