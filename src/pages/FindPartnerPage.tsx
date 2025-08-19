import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Calendar, User, Building, Clock, Users, Globe, Flag, MapIcon, CalendarDays, Home, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchTrips, Trip } from '../lib/tripService';
import { ChatService } from '../lib/chatService';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const FindPartnerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedDates, setSelectedDates] = useState('Any Dates');
  const [selectedType, setSelectedType] = useState('All Types');
  const [isFlexible, setIsFlexible] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const availableTrips = await searchTrips({});
      setTrips(availableTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All Regions');
    setSelectedCountry('All Countries');
    setSelectedCity('All Cities');
    setSelectedDates('Any Dates');
    setSelectedType('All Types');
    setIsFlexible(false);
    loadTrips();
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchQuery) {
        filters.location = searchQuery;
      }
      
      if (isFlexible) {
        filters.flexible = true;
      }
      
      const filteredTrips = await searchTrips(filters);
      setTrips(filteredTrips);
    } catch (error) {
      console.error('Error filtering trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageHost = async (trip: Trip) => {
    if (!user?.id || !trip.hostId) return;
    
    try {
      setMessageLoading(trip.id);
      const conv = await ChatService.getOrCreateDirectConversation(user.id, trip.hostId);
      navigate(`/messages?chat=${conv.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setMessageLoading(null);
    }
  };

  const formatTripDates = (trip: Trip) => {
    if (trip.flexible) {
      return `${trip.estimatedMonth} ${trip.estimatedYear}`;
    } else if (trip.startDate && trip.endDate) {
      return `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`;
    }
    return 'Flexible';
  };

  const getDaysUntilTrip = (trip: Trip) => {
    if (!trip.startDate) return null;
    const startDate = new Date(trip.startDate);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            SplitStay
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full transition-colors font-medium"
          >
            <Users className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Travel Partner
          </h1>
          <p className="text-lg text-gray-600">
            Connect with like-minded travelers and split accommodation costs
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full"
              >
                <option>All Regions</option>
                <option>Europe</option>
                <option>Asia</option>
                <option>North America</option>
                <option>South America</option>
                <option>Africa</option>
                <option>Oceania</option>
              </select>
            </div>

            <div className="relative">
              <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full"
              >
                <option>All Countries</option>
                <option>France</option>
                <option>Spain</option>
                <option>Italy</option>
                <option>Portugal</option>
                <option>India</option>
              </select>
            </div>

            <div className="relative">
              <MapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full"
              >
                <option>All Cities</option>
                <option>Paris</option>
                <option>Barcelona</option>
                <option>Milan</option>
                <option>Lisbon</option>
                <option>Delhi</option>
              </select>
            </div>

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedDates}
                onChange={(e) => setSelectedDates(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full"
              >
                <option>Any Dates</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>Next Month</option>
                <option>Custom Range</option>
              </select>
            </div>

            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full"
              >
                <option>All Types</option>
                <option>Hotel</option>
                <option>Airbnb</option>
                <option>Hostel</option>
                <option>Apartment</option>
              </select>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="checkbox"
                id="flexible"
                checked={isFlexible}
                onChange={(e) => setIsFlexible(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="flexible" className="text-sm font-medium text-gray-700">
                Flexible
              </label>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination, dates, or interests..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleApplyFilters}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <Filter className="w-4 h-4" />
              {loading ? 'Searching...' : 'Apply Filters'}
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Available Trips Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Available Trips</h2>
          </div>

          {/* Trip Cards Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or check back later for new trips.</p>
              <button
                onClick={() => navigate('/post-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Post Your Own Trip
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => {
                const daysLeft = getDaysUntilTrip(trip);
                const isMessageLoading = messageLoading === trip.id;
                
                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {trip.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{trip.location}</span>
                      </div>
                      
                      <div className={`flex items-center gap-2 ${trip.flexible ? 'text-blue-600' : 'text-gray-600'}`}>
                        <Calendar className="w-4 h-4" />
                        <span>{formatTripDates(trip)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Host: {trip.host?.name || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{trip.accommodation_type?.name || 'Accommodation'}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {trip.description}
                    </p>

                    <div className="flex items-center justify-between">
                      {daysLeft ? (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{daysLeft} days left</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Clock className="w-4 h-4" />
                          <span>Flexible timing</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMessageHost(trip)}
                          disabled={isMessageLoading || trip.hostId === user?.id}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {isMessageLoading ? 'Loading...' : 'Message'}
                        </button>
                        <button 
                          onClick={() => navigate(`/trip/${trip.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Coming Soon Section */}
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Partner matching coming soon!
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're working on an intelligent matching system to help you find the perfect travel 
            partners based on your preferences, travel style, and destinations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FindPartnerPage;
