import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User } from 'lucide-react';

interface Props {
  trip: any;
  personalNote: string;
  languages: string[];
  matchWith: string;
  vibe: string;
  instagram: string;
  back: () => void;
  onPost: () => void;
  loading: boolean;
}

const TripPreview: React.FC<Props> = ({
  trip,
  personalNote,
  languages,
  matchWith,
  vibe,
  instagram,
  back,
  onPost,
  loading,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-2xl shadow-2xl p-8"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Trip Preview</h2>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-shrink-0 w-40 h-40 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
          {/* Thumbnail or fallback */}
          {trip.thumbnailUrl ? (
            <img src={trip.thumbnailUrl} alt="Trip" className="object-cover w-full h-full" />
          ) : (
            <User className="w-20 h-20 text-gray-400" />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <MapPin className="w-5 h-5 text-blue-600" />
            {trip.location}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5 text-purple-600" />
            {trip.startDate?.slice(0, 10)} to {trip.endDate?.slice(0, 10)}
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">Note:</span> {personalNote}
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">Vibe:</span> {vibe}
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">Languages:</span> {languages.join(', ')}
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">Open to match with:</span> {matchWith}
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">Instagram:</span> {instagram}
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">Privacy:</span> {trip.isPublic === 1 ? 'Public' : 'Private'}
          </div>
          {trip.bookingUrl && (
            <a
              href={trip.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 underline font-semibold"
            >
              View Accommodation
            </a>
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