import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Calendar, User, Building, Clock, Users, Globe, Flag, MapIcon, CalendarDays, Home, MessageCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { searchTrips, type Trip } from '../lib/tripService';
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

  // Real-time filtering - trigger whenever any filter changes
  useEffect(() => {
    handleApplyFilters();
  }, [searchQuery, selectedRegion, selectedCountry, selectedCity, selectedDates, selectedType, isFlexible]);

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
      
      if (selectedType !== 'All Types') {
        filters.accommodationTypeId = selectedType;
      }
      
      if (isFlexible) {
        filters.flexible = true;
      }
      
      const filteredTrips = await searchTrips(filters);
      
      // Apply client-side filtering for fields not handled by backend
      let clientFilteredTrips = filteredTrips;
      
      // Filter by region
      if (selectedRegion !== 'All Regions') {
        clientFilteredTrips = clientFilteredTrips.filter(trip => {
          const location = trip.location.toLowerCase();
          switch (selectedRegion) {
            case 'Europe':
              return ['france', 'spain', 'italy', 'germany', 'uk', 'united kingdom', 'portugal', 'greece', 'netherlands', 'belgium', 'austria', 'switzerland', 'sweden', 'norway', 'denmark', 'finland', 'poland', 'czech', 'hungary', 'croatia', 'romania', 'bulgaria', 'ireland', 'iceland'].some(country => location.includes(country));
            case 'Asia':
              return ['japan', 'china', 'thailand', 'india', 'singapore', 'malaysia', 'indonesia', 'vietnam', 'korea', 'philippines', 'taiwan', 'hong kong', 'cambodia', 'laos', 'myanmar', 'nepal', 'sri lanka', 'bangladesh'].some(country => location.includes(country));
            case 'North America':
              return ['usa', 'united states', 'canada', 'mexico'].some(country => location.includes(country));
            case 'South America':
              return ['brazil', 'argentina', 'chile', 'peru', 'colombia', 'venezuela', 'ecuador', 'bolivia', 'uruguay', 'paraguay'].some(country => location.includes(country));
            case 'Africa':
              return ['south africa', 'egypt', 'morocco', 'kenya', 'nigeria', 'ghana', 'tunisia', 'tanzania', 'ethiopia', 'uganda'].some(country => location.includes(country));
            case 'Oceania':
              return ['australia', 'new zealand', 'fiji', 'samoa', 'tonga'].some(country => location.includes(country));
            default:
              return true;
          }
        });
      }
      
      // Filter by country
      if (selectedCountry !== 'All Countries') {
        clientFilteredTrips = clientFilteredTrips.filter(trip => 
          trip.location.toLowerCase().includes(selectedCountry.toLowerCase())
        );
      }
      
      // Filter by city
      if (selectedCity !== 'All Cities') {
        clientFilteredTrips = clientFilteredTrips.filter(trip => 
          trip.location.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }
      
      // Filter by date range
      if (selectedDates !== 'Any Dates') {
        clientFilteredTrips = clientFilteredTrips.filter(trip => {
          if (trip.flexible) {
            // For flexible trips, check if estimated dates fall within range
            if ((trip as any).estimatedmonth && (trip as any).estimatedyear) {
              const tripDate = new Date(parseInt((trip as any).estimatedyear), parseInt((trip as any).estimatedmonth) - 1);
              return true; // For now, show all flexible trips when dates are selected
            }
            return false;
          } else {
            // For fixed dates, check if trip dates overlap with filter range
            if (trip.startDate && trip.endDate) {
              return true; // For now, show all fixed date trips when dates are selected
            }
            return false;
          }
        });
      }
      
      setTrips(clientFilteredTrips);
    } catch (error) {
      console.error('Error filtering trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageHost = async (trip: Trip) => {
    // If guest user, redirect to auth with context
    if (!user?.id) {
      navigate('/signup', { 
        state: { 
          from: '/find-partners', 
          action: 'message', 
          tripId: trip.id,
          hostName: (trip as any).host?.name || 'host',
          tripName: trip.name 
        } 
      });
      return;
    }
    
    if (!trip.hostId) return;
    
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
      const month = (trip as any).estimatedmonth || trip.estimatedMonth;
      const year = (trip as any).estimatedyear || trip.estimatedYear;
      return month && year ? `${month} ${year}` : 'Dates TBD';
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
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            SplitStay
          </Link>
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
                <option>Afghanistan</option>
                <option>Albania</option>
                <option>Algeria</option>
                <option>Andorra</option>
                <option>Angola</option>
                <option>Antigua and Barbuda</option>
                <option>Argentina</option>
                <option>Armenia</option>
                <option>Australia</option>
                <option>Austria</option>
                <option>Azerbaijan</option>
                <option>Bahamas</option>
                <option>Bahrain</option>
                <option>Bangladesh</option>
                <option>Barbados</option>
                <option>Belarus</option>
                <option>Belgium</option>
                <option>Belize</option>
                <option>Benin</option>
                <option>Bhutan</option>
                <option>Bolivia</option>
                <option>Bosnia and Herzegovina</option>
                <option>Botswana</option>
                <option>Brazil</option>
                <option>Brunei</option>
                <option>Bulgaria</option>
                <option>Burkina Faso</option>
                <option>Burundi</option>
                <option>Cabo Verde</option>
                <option>Cambodia</option>
                <option>Cameroon</option>
                <option>Canada</option>
                <option>Central African Republic</option>
                <option>Chad</option>
                <option>Chile</option>
                <option>China</option>
                <option>Colombia</option>
                <option>Comoros</option>
                <option>Congo</option>
                <option>Costa Rica</option>
                <option>Croatia</option>
                <option>Cuba</option>
                <option>Cyprus</option>
                <option>Czech Republic</option>
                <option>Democratic Republic of the Congo</option>
                <option>Denmark</option>
                <option>Djibouti</option>
                <option>Dominica</option>
                <option>Dominican Republic</option>
                <option>East Timor</option>
                <option>Ecuador</option>
                <option>Egypt</option>
                <option>El Salvador</option>
                <option>Equatorial Guinea</option>
                <option>Eritrea</option>
                <option>Estonia</option>
                <option>Eswatini</option>
                <option>Ethiopia</option>
                <option>Fiji</option>
                <option>Finland</option>
                <option>France</option>
                <option>Gabon</option>
                <option>Gambia</option>
                <option>Georgia</option>
                <option>Germany</option>
                <option>Ghana</option>
                <option>Greece</option>
                <option>Grenada</option>
                <option>Guatemala</option>
                <option>Guinea</option>
                <option>Guinea-Bissau</option>
                <option>Guyana</option>
                <option>Haiti</option>
                <option>Honduras</option>
                <option>Hungary</option>
                <option>Iceland</option>
                <option>India</option>
                <option>Indonesia</option>
                <option>Iran</option>
                <option>Iraq</option>
                <option>Ireland</option>
                <option>Israel</option>
                <option>Italy</option>
                <option>Ivory Coast</option>
                <option>Jamaica</option>
                <option>Japan</option>
                <option>Jordan</option>
                <option>Kazakhstan</option>
                <option>Kenya</option>
                <option>Kiribati</option>
                <option>Kuwait</option>
                <option>Kyrgyzstan</option>
                <option>Laos</option>
                <option>Latvia</option>
                <option>Lebanon</option>
                <option>Lesotho</option>
                <option>Liberia</option>
                <option>Libya</option>
                <option>Liechtenstein</option>
                <option>Lithuania</option>
                <option>Luxembourg</option>
                <option>Madagascar</option>
                <option>Malawi</option>
                <option>Malaysia</option>
                <option>Maldives</option>
                <option>Mali</option>
                <option>Malta</option>
                <option>Marshall Islands</option>
                <option>Mauritania</option>
                <option>Mauritius</option>
                <option>Mexico</option>
                <option>Micronesia</option>
                <option>Moldova</option>
                <option>Monaco</option>
                <option>Mongolia</option>
                <option>Montenegro</option>
                <option>Morocco</option>
                <option>Mozambique</option>
                <option>Myanmar</option>
                <option>Namibia</option>
                <option>Nauru</option>
                <option>Nepal</option>
                <option>Netherlands</option>
                <option>New Zealand</option>
                <option>Nicaragua</option>
                <option>Niger</option>
                <option>Nigeria</option>
                <option>North Korea</option>
                <option>North Macedonia</option>
                <option>Norway</option>
                <option>Oman</option>
                <option>Pakistan</option>
                <option>Palau</option>
                <option>Palestine</option>
                <option>Panama</option>
                <option>Papua New Guinea</option>
                <option>Paraguay</option>
                <option>Peru</option>
                <option>Philippines</option>
                <option>Poland</option>
                <option>Portugal</option>
                <option>Qatar</option>
                <option>Romania</option>
                <option>Russia</option>
                <option>Rwanda</option>
                <option>Saint Kitts and Nevis</option>
                <option>Saint Lucia</option>
                <option>Saint Vincent and the Grenadines</option>
                <option>Samoa</option>
                <option>San Marino</option>
                <option>Sao Tome and Principe</option>
                <option>Saudi Arabia</option>
                <option>Senegal</option>
                <option>Serbia</option>
                <option>Seychelles</option>
                <option>Sierra Leone</option>
                <option>Singapore</option>
                <option>Slovakia</option>
                <option>Slovenia</option>
                <option>Solomon Islands</option>
                <option>Somalia</option>
                <option>South Africa</option>
                <option>South Korea</option>
                <option>South Sudan</option>
                <option>Spain</option>
                <option>Sri Lanka</option>
                <option>Sudan</option>
                <option>Suriname</option>
                <option>Sweden</option>
                <option>Switzerland</option>
                <option>Syria</option>
                <option>Taiwan</option>
                <option>Tajikistan</option>
                <option>Tanzania</option>
                <option>Thailand</option>
                <option>Togo</option>
                <option>Tonga</option>
                <option>Trinidad and Tobago</option>
                <option>Tunisia</option>
                <option>Turkey</option>
                <option>Turkmenistan</option>
                <option>Tuvalu</option>
                <option>Uganda</option>
                <option>Ukraine</option>
                <option>United Arab Emirates</option>
                <option>United Kingdom</option>
                <option>United States</option>
                <option>Uruguay</option>
                <option>Uzbekistan</option>
                <option>Vanuatu</option>
                <option>Vatican City</option>
                <option>Venezuela</option>
                <option>Vietnam</option>
                <option>Yemen</option>
                <option>Zambia</option>
                <option>Zimbabwe</option>
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
                <option>Hostel Room</option>
                <option>Hotel Room</option>
                <option>Apartment</option>
                <option>House</option>
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

          {/* Clear Filters Button */}
          <div className="flex justify-center">
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Filter className="w-4 h-4" />
              Clear All Filters
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
                        <span>Host: {(trip as any).host?.name || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{(trip as any).accommodation_type?.name || 'Accommodation'}</span>
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
                          disabled={messageLoading === trip.id || Boolean(user?.id && trip.hostId && trip.hostId === user.id)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {messageLoading === trip.id ? 'Loading...' : user?.id ? 'Message' : 'Sign up to Message'}
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
