import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Building, Users, Eye } from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { AccommodationPreview } from '../../components/AccommodationPreview';
import { iframelyService, type AccommodationPreview as AccommodationPreviewType } from '../../lib/iframely';

interface Props {
  trip: any;
  personalNote: string;
  matchWith: string;
  vibe: string;
  back: () => void;
  onPost: () => void;
  loading: boolean;
}

const TripPreview: React.FC<Props> = ({
  trip,
  personalNote,
  matchWith,
  vibe,
  back,
  onPost,
  loading,
}) => {
  const { data: user } = useUser();
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

  useEffect(() => {
    if (trip.bookingUrl) {
      setAccommodationPreview(prev => ({ ...prev, isLoading: true, error: null }));
      
      iframelyService.getAccommodationPreview(trip.bookingUrl)
        .then(preview => setAccommodationPreview(preview))
        .catch(error => {
          setAccommodationPreview(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load preview'
          }));
        });
    }
  }, [trip.bookingUrl]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-2xl shadow-2xl p-8"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Trip Preview</h2>
      
      {/* Host Profile Section */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Your Profile
        </h3>
        <div className="flex items-center gap-4">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name || 'Profile'}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{user?.name || 'Your Name'}</p>
            <p className="text-sm text-gray-600">{user?.currentPlace || user?.birthPlace || 'Location'}</p>
          </div>
        </div>
      </div>

      {/* Trip Details Section */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Trip Details
        </h3>
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-800">Destination:</span>
            <span className="ml-2 text-gray-700">{trip.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-gray-800">Dates:</span>
            <span className="ml-2 text-gray-700">
              {trip.flexible 
                ? `${trip.estimatedMonth} ${trip.estimatedYear} (Flexible)`
                : `${trip.startDate?.slice(0, 10)} to ${trip.endDate?.slice(0, 10)}`
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-gray-800">Open to match with:</span>
            <span className="ml-2 text-gray-700 capitalize">{matchWith}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-800">Privacy:</span>
            <span className="ml-2 text-gray-700">{trip.isPublic ? 'Public' : 'Private'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-800">Vibe:</span>
            <p className="mt-1 text-gray-700">{vibe}</p>
          </div>
        </div>
      </div>

      {/* Accommodation Section */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Building className="w-5 h-5 text-teal-600" />
          Accommodation Details
        </h3>
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-800">Number of Rooms:</span>
            <span className="ml-2 text-gray-700">{trip.numberOfRooms}</span>
          </div>
          {trip.rooms && trip.rooms.length > 0 && (
            <div>
              <span className="font-semibold text-gray-800">Room Configuration:</span>
              <div className="mt-2 space-y-2">
                {trip.rooms.map((room: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Room {index + 1}:</span> {room.numberOfBeds} bed(s)
                      {room.ensuiteBathroom && <span className="text-green-600 ml-2">• Ensuite bathroom</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {trip.bookingUrl && (
            <div>
              <span className="font-semibold text-gray-800">Accommodation Preview:</span>
              <div className="mt-2">
                <AccommodationPreview 
                  preview={accommodationPreview}
                  imageAspectRatio="wide"
                  className="max-w-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={back}
          className="w-1/2 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200"
        >
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          type="button"
          onClick={onPost}
          disabled={loading}
          className="w-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Confirm & Post'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TripPreview;