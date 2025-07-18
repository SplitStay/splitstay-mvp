import React from 'react';
import { motion } from 'framer-motion';
import { Home, FileText } from 'lucide-react';

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
  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={e => {
        e.preventDefault();
        next();
      }}
      className="space-y-8 bg-white/90 rounded-2xl shadow-xl p-8"
    >
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <Home className="inline w-5 h-5 mr-2 text-blue-600" />
          Accommodation Link <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={trip.bookingUrl || ''}
          onChange={e => setTrip({ ...trip, bookingUrl: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          placeholder="Paste Booking.com or Airbnb link"
          required
        />
      </div>
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <FileText className="inline w-5 h-5 mr-2 text-purple-600" />
          Personal Note
        </label>
        <textarea
          value={personalNote}
          onChange={e => setPersonalNote(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
          placeholder="e.g. I'll be staying at XYZ Hotel, 2 minutes from the beach!"
          rows={3}
        />
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