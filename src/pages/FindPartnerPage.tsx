import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Calendar, User, Building, Clock, Users, Globe, Flag, MapIcon, CalendarDays, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FindPartnerPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedDates, setSelectedDates] = useState('Any Dates');
  const [selectedType, setSelectedType] = useState('All Types');
  const [isFlexible, setIsFlexible] = useState(false);

  // Mock trip data based on the screenshots
  const mockTrips = [
    {
      id: 1,
      name: 'Travel Orleans France',
      location: 'Paris, France',
      dates: '25/09/2025 - 27/09/2025',
      host: 'Ana Madrigal',
      accommodationType: 'Hotel',
      description: 'I will be in Orleans, France for 2 days (September 25 y 26, check out 27).',
      daysLeft: 42,
      timing: null
    },
    {
      id: 2,
      name: 'test',
      location: 'Delhi, India',
      dates: null,
      host: 'Robin',
      accommodationType: 'Hotel',
      description: 'test',
      daysLeft: null,
      timing: 'Flexible timing'
    },
    {
      id: 3,
      name: 'Barcelona',
      location: 'Barcelona, Spain',
      dates: null,
      host: 'test',
      accommodationType: 'Hotel',
      description: 'test',
      daysLeft: null,
      timing: 'Flexible timing'
    },
    {
      id: 4,
      name: 'Flexible trip',
      location: 'Milan, Italy',
      dates: null,
      host: 'Alvaro G',
      accommodationType: 'Airbnb',
      description: 'Trip Vibe / Description',
      daysLeft: null,
      timing: 'Flexible timing'
    },
    {
      id: 5,
      name: 'Lisbon Websummit',
      location: 'Lisbon, Portugal',
      dates: '11/11/2025 - 14/08/2025',
      host: 'Els',
      accommodationType: 'Airbnb',
      description: 'See other',
      daysLeft: 89,
      timing: null
    }
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All Regions');
    setSelectedCountry('All Countries');
    setSelectedCity('All Cities');
    setSelectedDates('Any Dates');
    setSelectedType('All Types');
    setIsFlexible(false);
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
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTrips.map((trip) => (
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
                  
                  {trip.dates ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{trip.dates}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Calendar className="w-4 h-4" />
                      <span>Flexible</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Host: {trip.host}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{trip.accommodationType}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {trip.description}
                </p>

                <div className="flex items-center justify-between">
                  {trip.daysLeft ? (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{trip.daysLeft} days left</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>{trip.timing}</span>
                    </div>
                  )}
                  
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
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
