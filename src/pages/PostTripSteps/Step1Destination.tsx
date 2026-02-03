import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import type { z } from 'zod';
import CityAutocomplete from '@/components/CityAutocomplete';
import type { PartialTripFormDataSchema } from '../../lib/schemas/tripFormSchema';
import { formatDateForStorage, parseLocalDate } from '../../utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';

type PartialTripFormData = z.infer<typeof PartialTripFormDataSchema>;

interface Props {
  trip: PartialTripFormData;
  setTrip: (t: PartialTripFormData) => void;
  next: () => void;
}

const Step1Destination: React.FC<Props> = ({ trip, setTrip, next }) => {
  const [city, setCity] = useState(trip.location || '');
  const [startDate, setStartDate] = useState(parseLocalDate(trip.startDate));
  const [endDate, setEndDate] = useState(parseLocalDate(trip.endDate));
  const [flexible, setFlexible] = useState(trip.flexible || false);
  const [estimatedMonth, setEstimatedMonth] = useState(
    trip.estimatedMonth || 'September',
  );
  const [estimatedYear, setEstimatedYear] = useState(
    trip.estimatedYear || '2025',
  );

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear + i).toString(),
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (flexible) {
          setTrip({
            ...trip,
            location: city,
            flexible: true,
            estimatedMonth,
            estimatedYear,
            startDate: null,
            endDate: null,
          });
        } else {
          setTrip({
            ...trip,
            location: city,
            flexible: false,
            startDate: formatDateForStorage(startDate),
            endDate: formatDateForStorage(endDate),
            estimatedMonth: null,
            estimatedYear: null,
          });
        }
        next();
      }}
      className="space-y-6 lg:space-y-8 bg-white/90 rounded-2xl shadow-xl p-6 lg:p-8"
    >
      <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Label associated via layout */}
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Trip Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={trip.name || ''}
          onChange={(e) => setTrip({ ...trip, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
          placeholder="e.g. Bali Beach Adventure"
          required
        />
      </div>
      <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Custom autocomplete component */}
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          <MapPin className="inline w-5 h-5 mr-2 text-blue-600" />
          City & Country <span className="text-red-500">*</span>
        </label>
        <CityAutocomplete
          value={city}
          onChange={setCity}
          placeholder="e.g. Paris, France"
          required
          className="[&>input]:text-lg [&>input]:py-3"
        />
      </div>
      {/* Toggle Switch */}
      <div className="flex items-center gap-3">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Toggle controlled via visible label */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard nav via hidden checkbox */}
        <div
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
            flexible ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          onClick={() => setFlexible(!flexible)}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              flexible ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </div>
        <span className="text-lg font-medium text-gray-800">
          I'm flexible / Dates not confirmed yet
        </span>
      </div>

      {/* Conditional Date/Timeframe Section */}
      {flexible ? (
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: Label for select group */}
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Estimated Timeframe <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <select
                value={estimatedMonth}
                onChange={(e) => setEstimatedMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={estimatedYear}
                onChange={(e) => setEstimatedYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              className="text-blue-600 font-medium hover:underline"
              onClick={() => setFlexible(false)}
            >
              Or select specific dates
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: DatePicker component */}
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                // If no end date is set or end date is before/same as new start date,
                // set end date to one day after start date
                if (date && (!endDate || endDate <= date)) {
                  const nextDay = new Date(date);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setEndDate(nextDay);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
              dateFormat="yyyy-MM-dd"
              required={!flexible}
              placeholderText="Select start date"
            />
          </div>
          <div className="flex-1">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: DatePicker component */}
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
              dateFormat="yyyy-MM-dd"
              required={!flexible}
              placeholderText="Select end date"
            />
          </div>
        </div>
      )}
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
