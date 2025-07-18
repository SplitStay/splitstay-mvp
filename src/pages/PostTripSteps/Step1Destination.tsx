import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  trip: any;
  setTrip: (t: any) => void;
  next: () => void;
}

interface PhotonFeature {
  properties: {
    label: string;
    [key: string]: any;
  };
}

const Step1Destination: React.FC<Props> = ({ trip, setTrip, next }) => {
  const [city, setCity] = useState(trip.location || '');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [startDate, setStartDate] = useState(trip.startDate ? new Date(trip.startDate) : null);
  const [endDate, setEndDate] = useState(trip.endDate ? new Date(trip.endDate) : null);

  // Photon API autocomplete
  useEffect(() => {
    if (!city) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(city)}&lang=en`, { signal: controller.signal })
      .then(res => res.json())
      .then((data: { features: PhotonFeature[] }) => setSuggestions(data.features || []))
      .catch(() => {});
    return () => controller.abort();
  }, [city]);

  const handleSelect = (feature: PhotonFeature) => {
    setCity(feature.properties.label);
    setSuggestions([]);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={e => {
        e.preventDefault();
        setTrip({
          ...trip,
          location: city,
          startDate: startDate?.toISOString() || '',
          endDate: endDate?.toISOString() || '',
        });
        next();
      }}
      className="space-y-6 lg:space-y-8 bg-white/90 rounded-2xl shadow-xl p-6 lg:p-8"
    >
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Trip Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={trip.name || ''}
          onChange={e => setTrip({ ...trip, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          placeholder="e.g. Bali Beach Adventure"
          required
        />
      </div>
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <MapPin className="inline w-5 h-5 mr-2 text-blue-600" />
          City & Country <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            placeholder="e.g. Paris, France"
            required
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
              {suggestions.map((feature, idx) => {
                const label = feature.properties.label;
                if (!label) return null;
                return (
                  <li
                    key={label + idx}
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
      </div>
      <div className="flex gap-6">
        <div className="flex-1">
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
            dateFormat="yyyy-MM-dd"
            required
            placeholderText="Select start date"
          />
        </div>
        <div className="flex-1">
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
            dateFormat="yyyy-MM-dd"
            required
            placeholderText="Select end date"
          />
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition"
      >
        Next
      </motion.button>
    </motion.form>
  );
};

export default Step1Destination;