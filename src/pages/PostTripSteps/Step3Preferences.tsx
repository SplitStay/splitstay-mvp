import { motion } from 'framer-motion';
import { Eye, Smile, Users } from 'lucide-react';
import type React from 'react';
import type { z } from 'zod';
import type { PartialTripFormDataSchema } from '../../lib/schemas/tripFormSchema';

type PartialTripFormData = z.infer<typeof PartialTripFormDataSchema>;

interface Props {
  trip: PartialTripFormData;
  setTrip: (t: PartialTripFormData) => void;
  matchWith: string;
  setMatchWith: (m: string) => void;
  vibe: string;
  setVibe: (v: string) => void;
  back: () => void;
  next: () => void;
}

const Step3Preferences: React.FC<Props> = ({
  trip,
  setTrip,
  matchWith,
  setMatchWith,
  vibe,
  setVibe,
  back,
  next,
}) => {
  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={(e) => {
        e.preventDefault();
        // Save trip preferences
        setTrip({
          ...trip,
          matchWith,
          vibe,
          isPublic: trip.isPublic ?? true,
        });
        next();
      }}
      className="space-y-8 bg-white/90 rounded-2xl shadow-xl p-8"
    >
      <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Label for radio group */}
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <Users className="inline w-5 h-5 mr-2 text-purple-600" />
          Open to Match With <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {['male', 'female', 'anyone'].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-lg">
              <input
                type="radio"
                name="matchWith"
                value={opt}
                checked={matchWith === opt}
                onChange={() => setMatchWith(opt)}
                required
              />
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </label>
          ))}
        </div>
      </div>
      <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Label associated via layout */}
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <Smile className="inline w-5 h-5 mr-2 text-yellow-500" />
          Trip Vibe / Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-lg"
          placeholder="e.g. I'm chill, want to explore and relax — not looking to party."
          rows={3}
          required
        />
      </div>

      <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Label associated via layout */}
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <Eye className="inline w-5 h-5 mr-2 text-blue-400" />
          Privacy <span className="text-red-500">*</span>
        </label>
        <select
          value={(trip.isPublic ?? true) ? 'true' : 'false'}
          onChange={(e) =>
            setTrip({ ...trip, isPublic: e.target.value === 'true' })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
          required
        >
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>
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

export default Step3Preferences;
