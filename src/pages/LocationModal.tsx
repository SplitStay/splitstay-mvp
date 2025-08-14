import { useState } from 'react';
import { motion } from 'framer-motion';
import CityAutocomplete from '@/components/CityAutocomplete';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [input, setInput] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input) {
      onSubmit(input);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-semibold mb-4">Set Your Location</h2>
        <p className="text-gray-600 mb-4">
          Please provide your location to access the dashboard.
        </p>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-4">
            <CityAutocomplete
              value={input}
              onChange={setInput}
              placeholder="Enter your location"
              label="Location"
              required
              className="[&>label]:text-sm [&>label]:font-medium [&>label]:text-gray-700 [&>label]:mb-2 [&>input]:px-3 [&>input]:py-2"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              I agree to the
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Use</a>
              &
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={(!selected && !input) || !acceptedTerms}
            >
              Save Location
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LocationModal; 