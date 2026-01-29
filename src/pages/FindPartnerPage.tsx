import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, Filter, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CityAutocomplete from '../components/CityAutocomplete';
import { TripCard } from '../components/TripCard';
import { useAuth } from '../contexts/AuthContext';
import { searchTrips, type Trip } from '../lib/tripService';

const FindPartnerPage = () => {
  const navigate = useNavigate();
  // biome-ignore lint/correctness/noUnusedVariables: User may be used for filtering
  const { user } = useAuth();
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filters
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedAccommodationType, setSelectedAccommodationType] =
    useState('');
  const [selectedGroupSize, setSelectedGroupSize] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('');

  const [_trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Initial data load only
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const availableTrips = await searchTrips({});
      setTrips(availableTrips);
      setFilteredTrips(availableTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (destinationQuery) count++;
    if (selectedStartDate || selectedEndDate) count++;
    if (isFlexible) count++;
    if (selectedRegion) count++;
    if (selectedCountry) count++;
    if (selectedCity) count++;
    if (selectedAccommodationType) count++;
    if (selectedGroupSize) count++;
    if (selectedVibe) count++;
    return count;
  };

  const getActiveFilters = () => {
    const filters = [];
    if (destinationQuery)
      filters.push({ label: destinationQuery, key: 'destination' });
    if (selectedStartDate || selectedEndDate) {
      const dateLabel = isFlexible
        ? 'Flexible Dates'
        : `${selectedStartDate || 'Any'} - ${selectedEndDate || 'Any'}`;
      filters.push({ label: dateLabel, key: 'dates' });
    }
    if (selectedRegion) filters.push({ label: selectedRegion, key: 'region' });
    if (selectedCountry)
      filters.push({ label: selectedCountry, key: 'country' });
    if (selectedCity) filters.push({ label: selectedCity, key: 'city' });
    if (selectedAccommodationType)
      filters.push({ label: selectedAccommodationType, key: 'type' });
    if (selectedGroupSize)
      filters.push({ label: `${selectedGroupSize} people`, key: 'groupSize' });
    if (selectedVibe) filters.push({ label: selectedVibe, key: 'vibe' });
    return filters;
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case 'destination':
        setDestinationQuery('');
        break;
      case 'dates':
        setSelectedStartDate('');
        setSelectedEndDate('');
        setIsFlexible(false);
        break;
      case 'region':
        setSelectedRegion('');
        break;
      case 'country':
        setSelectedCountry('');
        break;
      case 'city':
        setSelectedCity('');
        break;
      case 'type':
        setSelectedAccommodationType('');
        break;
      case 'groupSize':
        setSelectedGroupSize('');
        break;
      case 'vibe':
        setSelectedVibe('');
        break;
    }
  };

  const handleClearFilters = () => {
    setDestinationQuery('');
    setSelectedStartDate('');
    setSelectedEndDate('');
    setIsFlexible(false);
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedCity('');
    setSelectedAccommodationType('');
    setSelectedGroupSize('');
    setSelectedVibe('');
    handleApplyFilters();
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic filter object
      const filters: any = {};

      if (destinationQuery) {
        filters.location = destinationQuery;
      }

      if (selectedAccommodationType) {
        const typeMap: { [key: string]: string } = {
          'Hostel Room': 'hostel-room',
          'Hotel Room': 'hotel-room',
          Apartment: 'apartment',
          House: 'house',
        };
        filters.accommodationTypeId =
          typeMap[selectedAccommodationType] || selectedAccommodationType;
      }

      if (isFlexible) {
        filters.flexible = true;
      }

      const baseTrips = await searchTrips(filters);

      // Apply client-side filtering for additional criteria
      let clientFilteredTrips = baseTrips;

      // Filter by vibe (using description or custom vibe field)
      if (selectedVibe) {
        clientFilteredTrips = clientFilteredTrips.filter((trip) => {
          const description = (trip.description || '').toLowerCase();
          // biome-ignore lint/suspicious/noExplicitAny: Optional vibe field
          const vibe = (trip as any).vibe?.toLowerCase() || '';
          const selectedVibeLower = selectedVibe.toLowerCase();
          return (
            description.includes(selectedVibeLower) ||
            vibe.includes(selectedVibeLower)
          );
        });
      }

      // Filter by group size (using number of rooms)
      if (selectedGroupSize) {
        const size = parseInt(selectedGroupSize, 10);
        clientFilteredTrips = clientFilteredTrips.filter((trip) => {
          const rooms =
            // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
            (trip as any).numberofrooms || (trip as any).numberOfRooms || 1;
          return rooms >= size - 1 && rooms <= size + 1; // Allow some flexibility
        });
      }

      // Filter by region
      if (selectedRegion) {
        clientFilteredTrips = clientFilteredTrips.filter((trip) => {
          const location = trip.location.toLowerCase();
          switch (selectedRegion) {
            case 'Europe':
              return [
                'france',
                'spain',
                'italy',
                'germany',
                'uk',
                'united kingdom',
                'portugal',
                'greece',
                'netherlands',
                'belgium',
                'austria',
                'switzerland',
                'sweden',
                'norway',
                'denmark',
                'finland',
                'poland',
                'czech',
                'hungary',
                'croatia',
                'romania',
                'bulgaria',
                'ireland',
                'iceland',
              ].some((country) => location.includes(country));
            case 'Asia':
              return [
                'japan',
                'china',
                'thailand',
                'india',
                'singapore',
                'malaysia',
                'indonesia',
                'vietnam',
                'korea',
                'philippines',
                'taiwan',
                'hong kong',
                'cambodia',
                'laos',
                'myanmar',
                'nepal',
                'sri lanka',
                'bangladesh',
              ].some((country) => location.includes(country));
            case 'North America':
              return ['usa', 'united states', 'canada', 'mexico'].some(
                (country) => location.includes(country),
              );
            case 'South America':
              return [
                'brazil',
                'argentina',
                'chile',
                'peru',
                'colombia',
                'venezuela',
                'ecuador',
                'bolivia',
                'uruguay',
                'paraguay',
              ].some((country) => location.includes(country));
            case 'Africa':
              return [
                'south africa',
                'egypt',
                'morocco',
                'kenya',
                'nigeria',
                'ghana',
                'tunisia',
                'tanzania',
                'ethiopia',
                'uganda',
              ].some((country) => location.includes(country));
            case 'Oceania':
              return [
                'australia',
                'new zealand',
                'fiji',
                'samoa',
                'tonga',
              ].some((country) => location.includes(country));
            default:
              return true;
          }
        });
      }

      setFilteredTrips(clientFilteredTrips);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            SplitStay
          </Link>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Title Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Find Your Perfect Travel Partner
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Connect with like-minded travelers and split accommodation costs
          </p>
        </div>

        {/* Simplified Main Filters - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 mb-4">
            {/* Destination */}
            <div className="sm:col-span-1">
              <CityAutocomplete
                value={destinationQuery}
                onChange={setDestinationQuery}
                placeholder="Where are you going?"
                label=""
                className="w-full"
              />
            </div>

            {/* Date Flexibility Toggle */}
            <div className="sm:col-span-1">
              <div className="flex items-center h-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <label className="flex items-center cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={isFlexible}
                    onChange={(e) => setIsFlexible(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`text-sm font-medium ${isFlexible ? 'text-blue-600' : 'text-gray-700'}`}
                  >
                    {isFlexible ? 'Flexible dates' : 'Fixed dates'}
                  </span>
                  <div
                    className={`ml-auto w-10 h-6 rounded-full transition-colors flex-shrink-0 ${isFlexible ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${isFlexible ? 'translate-x-5' : 'translate-x-1'} mt-1`}
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Filters Button */}
            <div className="sm:col-span-1">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-700">
                    More Filters
                  </span>
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {getActiveFilters().length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {getActiveFilters().map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                >
                  {filter.label}
                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Advanced Filters Panel - Mobile Optimized */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Region */}
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">All Regions</option>
                      <option>Europe</option>
                      <option>Asia</option>
                      <option>North America</option>
                      <option>South America</option>
                      <option>Africa</option>
                      <option>Oceania</option>
                    </select>

                    {/* Country */}
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">All Countries</option>
                      <option>France</option>
                      <option>Spain</option>
                      <option>Italy</option>
                      <option>Germany</option>
                      <option>United Kingdom</option>
                      <option>Portugal</option>
                      <option>Greece</option>
                      <option>Netherlands</option>
                      <option>Thailand</option>
                      <option>Japan</option>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Australia</option>
                    </select>

                    {/* City */}
                    <input
                      type="text"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      placeholder="City name..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />

                    {/* Date Range */}
                    {!isFlexible && (
                      <>
                        <div className="relative">
                          <input
                            type="date"
                            value={selectedStartDate}
                            onChange={(e) =>
                              setSelectedStartDate(e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="Start date"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            value={selectedEndDate}
                            onChange={(e) => setSelectedEndDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="End date"
                          />
                        </div>
                      </>
                    )}

                    {/* Accommodation Type */}
                    <select
                      value={selectedAccommodationType}
                      onChange={(e) =>
                        setSelectedAccommodationType(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">All Types</option>
                      <option>Hostel Room</option>
                      <option>Hotel Room</option>
                      <option>Apartment</option>
                      <option>House</option>
                    </select>

                    {/* Group Size */}
                    <select
                      value={selectedGroupSize}
                      onChange={(e) => setSelectedGroupSize(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Any Group Size</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5+ people</option>
                    </select>

                    {/* Vibe */}
                    <select
                      value={selectedVibe}
                      onChange={(e) => setSelectedVibe(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Any Vibe</option>
                      <option>Adventure</option>
                      <option>Relaxation</option>
                      <option>Cultural</option>
                      <option>Party</option>
                      <option>Wellness</option>
                      <option>Business</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Apply Filters Button - Always Visible */}
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {loading
                ? 'Loading trips...'
                : `${filteredTrips.length} trips found`}
            </h2>
          </div>

          {/* Trip Cards Grid with Skeleton Loaders */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {[...Array(6)].map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    </div>
                    <div className="flex justify-between mt-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No trips found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or check back later for new trips.
              </p>
              <button
                type="button"
                onClick={() => navigate('/post-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Post Your Own Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => handleTripClick(trip.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindPartnerPage;
