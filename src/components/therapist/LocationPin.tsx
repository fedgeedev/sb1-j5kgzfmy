import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  Marker,
  StandaloneSearchBox,
} from '@react-google-maps/api';
import {
  Plus,
  Save,
  X,
  Star,
  Trash2,
  MapPin,
  Search,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { logAudit } from '../../utils/logAudit.ts' ;

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];
const containerStyle = { width: '100%', height: '400px' };

const LocationPin: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [newLocation, setNewLocation] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndLocations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setUserEmail(user.email);

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('therapist_id', user.id);
      if (!error && data) setLocations(data);
    };

    fetchUserAndLocations();
  }, []);

  const onMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!isAdding || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        setNewLocation({
          lat,
          lng,
          address: results[0].formatted_address,
          title: '',
          description: '',
        });
      }
    });
  };

  const handleSearchBoxLoad = (ref: google.maps.places.SearchBox) => setSearchBox(ref);

  const onPlaceChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places?.[0]?.geometry?.location) {
        const lat = places[0].geometry.location.lat();
        const lng = places[0].geometry.location.lng();
        setMapCenter({ lat, lng });
        setNewLocation({
          ...newLocation,
          lat,
          lng,
          address: places[0].formatted_address,
        });
      }
    }
  };

  const saveLocation = async () => {
    if (!userId || !newLocation?.title || !newLocation.lat || !newLocation.lng) return;

    const is_main = locations.length === 0;
    const { data, error } = await supabase
      .from('locations')
      .insert({
        ...newLocation,
        therapist_id: userId,
        is_main,
      })
      .select('*');

    if (!error && data?.[0]) {
      setLocations([...locations, data[0]]);
      await logAudit('Added location', 'locations', `Therapist added: ${newLocation.title}`);
      setNewLocation(null);
      setIsAdding(false);
    }
  };

  const deleteLocation = async (id: string) => {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (!error) {
      setLocations(locations.filter((l) => l.id !== id));
      await logAudit('Deleted location', 'locations', `Therapist deleted location ID: ${id}`);
    }
  };

  const setMain = async (id: string) => {
    if (!userId) return;
    await supabase.from('locations').update({ is_main: false }).eq('therapist_id', userId);
    await supabase.from('locations').update({ is_main: true }).eq('id', id);

    setLocations(locations.map((loc) => ({
      ...loc,
      is_main: loc.id === id,
    })));

    await logAudit('Set main location', 'locations', `Therapist set main location ID: ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#004D4D]">Manage Your Locations</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[#004D4D] text-white px-4 py-2 rounded-lg hover:bg-[#003939] flex items-center gap-2"
          >
            <Plus size={18} /> Add Location
          </button>
        )}
      </div>

      <StandaloneSearchBox onLoad={handleSearchBoxLoad} onPlacesChanged={onPlaceChanged}>
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search location..."
            className="pl-10 pr-4 py-2 border w-full rounded-lg"
          />
        </div>
      </StandaloneSearchBox>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={10}
        onClick={onMapClick}
      >
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={{ lat: loc.lat, lng: loc.lng }}
            icon={{
              url: loc.is_main
                ? 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
          />
        ))}
        {newLocation && (
          <Marker
            position={{ lat: newLocation.lat, lng: newLocation.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            }}
          />
        )}
      </GoogleMap>

      {isAdding && newLocation && (
        <div className="space-y-4 bg-white p-4 rounded shadow">
          <input
            type="text"
            placeholder="Location Title"
            value={newLocation.title}
            onChange={(e) => setNewLocation({ ...newLocation, title: e.target.value })}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={newLocation.description || ''}
            onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            disabled
            value={newLocation.address || ''}
            className="w-full border rounded p-2 bg-gray-100"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewLocation(null);
              }}
              className="text-gray-600 hover:text-red-600"
            >
              Cancel
            </button>
            <button
              onClick={saveLocation}
              className="bg-[#004D4D] text-white px-4 py-2 rounded hover:bg-[#003939]"
            >
              <Save size={16} className="inline-block mr-1" />
              Save
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="p-4 border rounded shadow bg-white relative">
            <h3 className="text-lg font-semibold text-[#004D4D]">{loc.title}</h3>
            <p className="text-sm text-gray-600">{loc.address}</p>
            <p className="text-xs text-gray-500 mt-1">{loc.description}</p>
            <div className="absolute top-3 right-3 flex gap-2">
              {!loc.is_main && (
                <button
                  onClick={() => setMain(loc.id)}
                  className="text-yellow-500 hover:text-yellow-600"
                  title="Set as Main"
                >
                  <Star size={18} />
                </button>
              )}
              <button
                onClick={() => deleteLocation(loc.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationPin;
