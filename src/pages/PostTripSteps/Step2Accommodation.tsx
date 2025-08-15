import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Link, Hash, RefreshCw } from 'lucide-react';
import { AccommodationPreview } from '../../components/AccommodationPreview';
import { iframelyService, type AccommodationPreview as AccommodationPreviewType } from '../../lib/iframely';
import { getAccommodationTypes, createDefaultRooms, BED_TYPES, type AccommodationType, type RoomConfiguration } from '../../lib/accommodationService';

// Remove local Room interface - use RoomConfiguration from service

interface Props {
  trip: any;
  setTrip: (t: any) => void;
  personalNote: string;
  setPersonalNote: (n: string) => void;
  back: () => void;
  next: () => void;
}

const Step2Accommodation: React.FC<Props> = ({
  trip,
  setTrip,
  personalNote,
  setPersonalNote,
  back,
  next,
}) => {
  const [accommodationTypes, setAccommodationTypes] = useState<AccommodationType[]>([]);
  const [accommodationTypeId, setAccommodationTypeId] = useState(trip.accommodationTypeId || '');
  const [accommodationLink, setAccommodationLink] = useState(trip.bookingUrl || '');
  const [numberOfRooms, setNumberOfRooms] = useState(trip.numberOfRooms || 3);
  const [rooms, setRooms] = useState<RoomConfiguration[]>(
    trip.rooms || createDefaultRooms(3)
  );
  const [accommodationPreview, setAccommodationPreview] = useState<AccommodationPreviewType>({
    title: '',
    description: '',
    image: '',
    site: '',
    author: '',
    url: '',
    favicon: '',
    isLoading: false,
    error: null,
  });

  // Load accommodation types from database
  useEffect(() => {
    const loadAccommodationTypes = async () => {
      try {
        const types = await getAccommodationTypes();
        setAccommodationTypes(types);
        // Set default if none selected
        if (!accommodationTypeId && types.length > 0) {
          setAccommodationTypeId(types[0].id);
        }
      } catch (error) {
        console.error('Failed to load accommodation types:', error);
        // Fallback to default types
        setAccommodationTypes([
          { id: 'villa', name: 'Villa', displayOrder: 1, createdAt: '', updatedAt: '' },
          { id: 'hotel', name: 'Hotel', displayOrder: 2, createdAt: '', updatedAt: '' },
        ]);
      }
    };
    loadAccommodationTypes();
  }, [accommodationTypeId]);

  // Update rooms when numberOfRooms changes
  useEffect(() => {
    if (numberOfRooms !== rooms.length) {
      setRooms(createDefaultRooms(numberOfRooms));
    }
  }, [numberOfRooms]);

  // Debounced accommodation preview fetching
  useEffect(() => {
    if (!accommodationLink || accommodationLink.trim() === '') {
      setAccommodationPreview({
        title: '',
        description: '',
        image: '',
        site: '',
        author: '',
        url: '',
        favicon: '',
        isLoading: false,
        error: null,
      });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setAccommodationPreview(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const preview = await iframelyService.getAccommodationPreview(accommodationLink);
        setAccommodationPreview(preview);
      } catch (error) {
        setAccommodationPreview(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load preview'
        }));
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [accommodationLink]);

  const updateRoom = (roomId: number, field: keyof RoomConfiguration, value: any) => {
    setRooms(rooms.map(room => 
      room.id === roomId ? { ...room, [field]: value } : room
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrip({
      ...trip,
      accommodationTypeId,
      bookingUrl: accommodationLink,
      numberOfRooms,
      rooms
    });
    next();
  };

  const handleRefreshPreview = async () => {
    if (!accommodationLink) return;
    
    // Clear cache and force refresh
    iframelyService.clearCache();
    setAccommodationPreview(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const preview = await iframelyService.getAccommodationPreview(accommodationLink);
      setAccommodationPreview(preview);
    } catch (error) {
      setAccommodationPreview(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load preview'
      }));
    }
  };
  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8 bg-white/90 rounded-2xl shadow-xl p-8"
    >
      {/* Accommodation Type */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          <Building2 className="inline w-5 h-5 mr-2 text-teal-600" />
          Accommodation Type <span className="text-red-500">*</span>
        </label>
        <select
          value={accommodationTypeId}
          onChange={(e) => setAccommodationTypeId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg bg-white"
          required
        >
          {accommodationTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      {/* Accommodation Link */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          <Link className="inline w-5 h-5 mr-2 text-purple-600" />
          Accommodation Link <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Paste a link from Booking.com, Airbnb, Hotels.com, or any accommodation booking site
        </p>
        <input
          type="url"
          value={accommodationLink}
          onChange={(e) => setAccommodationLink(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          placeholder="https://booking.com/hotel/... or https://airbnb.com/rooms/..."
          required
        />
        
        {/* Accommodation Preview */}
        {(accommodationPreview.isLoading || accommodationPreview.error || accommodationPreview.title) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Accommodation Preview</span>
              {accommodationLink && (
                <button
                  type="button"
                  onClick={handleRefreshPreview}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  disabled={accommodationPreview.isLoading}
                >
                  <RefreshCw className={`w-3 h-3 ${accommodationPreview.isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
            </div>
            <AccommodationPreview 
              preview={accommodationPreview} 
              imageAspectRatio="wide"
              className="max-w-lg"
            />
          </div>
        )}
      </div>

      {/* Number of Rooms */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          <Hash className="inline w-5 h-5 mr-2 text-green-600" />
          Number of Rooms <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={numberOfRooms}
          onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          required
        />
      </div>

      {/* Room Configuration */}
      <div className="space-y-6">
        {rooms.map((room, index) => (
          <div key={room.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Room {index + 1}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Number of Beds */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Number of Beds <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={room.numberOfBeds}
                  onChange={(e) => updateRoom(room.id, 'numberOfBeds', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Bed Type */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Bed Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={room.bedType}
                  onChange={(e) => updateRoom(room.id, 'bedType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  {BED_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ensuite Bathroom */}
            <div className="flex items-center justify-end gap-3">
              <label htmlFor={`ensuite-${room.id}`} className="text-base font-medium text-gray-700">
                Ensuite Bathroom
              </label>
              <input
                type="checkbox"
                id={`ensuite-${room.id}`}
                checked={room.ensuiteBathroom}
                onChange={(e) => updateRoom(room.id, 'ensuiteBathroom', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={back}
          className="w-1/2 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          type="submit"
          className="w-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition"
        >
          Next
        </motion.button>
      </div>
    </motion.form>
  );
};

export default Step2Accommodation;