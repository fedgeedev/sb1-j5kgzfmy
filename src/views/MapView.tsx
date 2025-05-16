import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Heart } from 'lucide-react';
import { useLikedTherapists } from '../context/LikedTherapistsContext';
import { useTherapists } from '../hooks/useTherapists';
import { Therapist } from '../types';

interface MapViewProps {
  onSelectTherapist: (therapist: Therapist) => void;
}

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 9rem)',
  borderRadius: '1rem',
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 };
const defaultZoom = 11;

const MapView: React.FC<MapViewProps> = ({ onSelectTherapist }) => {
  const { therapists, loading, error } = useTherapists();
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const { toggleLike, isLiked } = useLikedTherapists();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          if (mapRef) {
            mapRef.panTo(userPos);
            mapRef.setZoom(defaultZoom);
          }
        },
        (err) => console.error('Geolocation error:', err)
      );
    }
  }, [mapRef]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
    const bounds = new window.google.maps.LatLngBounds();
    therapists.forEach((therapist) =>
      therapist.locations?.forEach((loc) =>
        bounds.extend({ lat: loc.lat, lng: loc.lng })
      )
    );
    if (userLocation) bounds.extend(userLocation);
    if (bounds.isEmpty()) {
      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
    } else {
      map.fitBounds(bounds, { padding: 50 });
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  }, [therapists, userLocation]);

  const handleTherapistSelect = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    if (mapRef && therapist.locations?.[0]) {
      mapRef.panTo({
        lat: therapist.locations[0].lat,
        lng: therapist.locations[0].lng
      });
    }
  };

  const handleGetDirections = (loc: { lat: number; lng: number }) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, '_blank');
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-9rem)] flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#004D4D] border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-9rem)] flex items-center justify-center bg-gray-50 rounded-xl px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-semibold mb-2">Failed to load therapists.</p>
          <p className="text-gray-600 text-sm">Please try again later or check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4">
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        options={{
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#004D4D" }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#E6F0F0" }]
            }
          ],
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          minZoom: 3,
          maxZoom: 18,
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            }}
          />
        )}

        <MarkerClusterer>
          {(clusterer) =>
            therapists.flatMap((therapist) =>
              therapist.locations?.map((location, index) => (
                <Marker
                  key={`${therapist.userId}-${index}`}
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => handleTherapistSelect(therapist)}
                  clusterer={clusterer}
                  icon={{
                    url: selectedTherapist?.userId === therapist.userId
                      ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                      : location.isMain
                        ? 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                        : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  }}
                />
              ))
            )
          }
        </MarkerClusterer>

        {selectedTherapist && selectedTherapist.locations?.[0] && (
          <InfoWindow
            position={{
              lat: selectedTherapist.locations[0].lat,
              lng: selectedTherapist.locations[0].lng
            }}
            onCloseClick={() => setSelectedTherapist(null)}
          >
            <div className="p-2 min-w-[200px]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-[#004D4D] text-base">
                  {selectedTherapist.profile.fullName}
                </h3>
                <button
                  onClick={() => toggleLike(selectedTherapist)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Heart
                    size={18}
                    className={isLiked(selectedTherapist.userId) ? 'fill-red-500' : ''}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {selectedTherapist.locations[0].title}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {selectedTherapist.locations[0].address}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectTherapist(selectedTherapist)}
                  className="px-3 py-1.5 bg-[#004D4D] text-white text-sm rounded-full hover:bg-[#003939] transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleGetDirections(selectedTherapist.locations[0])}
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
                >
                  Get Directions
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapView;
