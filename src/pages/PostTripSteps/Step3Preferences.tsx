import React from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { Languages, Users, Smile, Instagram, Eye } from 'lucide-react';

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'French', label: 'French' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'German', label: 'German' },
  { value: 'Other', label: 'Other' },
];

interface Props {
  trip: any;
  setTrip: (t: any) => void;
  languages: string[];
  setLanguages: (l: string[]) => void;
  matchWith: string;
  setMatchWith: (m: string) => void;
  vibe: string;
  setVibe: (v: string) => void;
  instagram: string;
  setInstagram: (i: string) => void;
  back: () => void;
  next: () => void;
}

const Step3Preferences: React.FC<Props> = ({
  trip,
  setTrip,
  languages,
  setLanguages,
  matchWith,
  setMatchWith,
  vibe,
  setVibe,
  instagram,
  setInstagram,
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
          <Languages className="inline w-5 h-5 mr-2 text-blue-600" />
          Languages Spoken <span className="text-red-500">*</span>
        </label>
        <Select
          isMulti
          options={languageOptions}
          value={languageOptions.filter(opt => languages.includes(opt.value))}
          onChange={opts => setLanguages((opts as any[]).map(o => o.value))}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <Users className="inline w-5 h-5 mr-2 text-purple-600" />
          Open to Match With <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {['male', 'female', 'anyone'].map(opt => (
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
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <Smile className="inline w-5 h-5 mr-2 text-yellow-500" />
          Trip Vibe / Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={vibe}
          onChange={e => setVibe(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-lg"
          placeholder="e.g. I'm chill, want to explore and relax — not looking to party."
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <Instagram className="inline w-5 h-5 mr-2 text-pink-500" />
          Instagram
        </label>
        <input
          type="text"
          value={instagram}
          onChange={e => setInstagram(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-lg"
          placeholder="Your Instagram handle"
        />
      </div>
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <Eye className="inline w-5 h-5 mr-2 text-blue-400" />
          Privacy <span className="text-red-500">*</span>
        </label>
        <select
          value={trip.isPublic ?? 1}
          onChange={e => setTrip({ ...trip, isPublic: Number(e.target.value) })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
          required
        >
          <option value={1}>Public</option>
          <option value={0}>Private</option>
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