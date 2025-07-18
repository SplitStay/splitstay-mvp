import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (location: string) => void;
}

interface PhotonFeature {
  properties: {
    label: string;
    osm_id: string | number;
    [key: string]: any;
  };
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(input)}&lang=en`, { signal: controller.signal })
      .then(res => res.json())
      .then((data: { features: PhotonFeature[] }) => {
        setSuggestions(data.features || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, [input]);

  if (!isOpen) return null;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSelected('');
  };

  const handleSelect = (feature: PhotonFeature) => {
    const label =
      feature.properties.label ||
      feature.properties.name ||
      feature.properties.city ||
      feature.properties.state ||
      feature.properties.country ||
      '';
    setInput(label);
    setSelected(label);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected || input) {
      onSubmit(selected || input);
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
          <div className="mb-4 relative">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={input}
              onChange={handleInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your location"
              required
              autoComplete="off"
            />
            {loading && (
              <div className="absolute right-3 top-3 text-gray-400 text-xs">Loading...</div>
            )}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((feature) => {
                  const label =
                    feature.properties.label ||
                    feature.properties.name ||
                    feature.properties.city ||
                    feature.properties.state ||
                    feature.properties.country ||
                    '';
                  if (!label) return null;
                  return (
                    <li
                      key={feature.properties.osm_id + label}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                      onClick={() => handleSelect(feature)}
                    >
                      {label}
                    </li>
                  );
                })}
              </ul>
            )}
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