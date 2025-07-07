import { useState, useEffect } from "react";
import { Search, Calendar, Plus, CheckCircle, AlertCircle, Users } from "lucide-react";
import TripCard from "../components/TripCard";
import UserTripCard from "../components/UserTripCard";
import TripModal from "../components/TripModal";
import { sampleTrips } from "../data/trips";

export default function DashboardTrips() {
  const [trips, setTrips] = useState(sampleTrips);
  const [filteredTrips, setFilteredTrips] = useState(sampleTrips);
  const [searchDestination, setSearchDestination] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userName, setUserName] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("splitstay_user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.firstName || "Traveler");
    }
    
    const profileStatus = localStorage.getItem("splitstay_profile_completed");
    setProfileCompleted(profileStatus === "true");

    // Load user's posted trips
    const userTripsData = localStorage.getItem("splitstay_user_trips");
    if (userTripsData) {
      setUserTrips(JSON.parse(userTripsData));
    }
  }, []);

  // Filter trips based on search criteria
  useEffect(() => {
    let filtered = trips;

    if (searchDestination) {
      filtered = filtered.filter(trip =>
        trip.destination.toLowerCase().includes(searchDestination.toLowerCase()) ||
        trip.country.toLowerCase().includes(searchDestination.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(trip => new Date(trip.startDate) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(trip => new Date(trip.endDate) <= new Date(dateTo));
    }

    setFilteredTrips(filtered);
  }, [searchDestination, dateFrom, dateTo, trips]);

  const handleViewTrip = (tripId: number) => {
    window.location.href = `/trip/${tripId}`;
  };

  const handleMessage = (userId: string) => {
    window.location.href = `/chat/${userId}`;
  };

  const handleCreateTrip = () => {
    window.location.href = "/create-trip";
  };

  const handleCompleteProfile = () => {
    window.location.href = "/profile-setup";
  };

  const clearFilters = () => {
    setSearchDestination("");
    setDateFrom("");
    setDateTo("");
  };

  const handleTripCardClick = (trip: any) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">SplitStay</h1>
            <div className="hidden md:flex space-x-6">
              <a href="/dashboard" className="text-blue-600 font-medium">Dashboard</a>
              <a href="/my-matches" className="text-gray-600 hover:text-gray-900">My Matches</a>
              <a href="/explore" className="text-gray-600 hover:text-gray-900">Explore</a>
              <a href="/inbox" className="text-gray-600 hover:text-gray-900">Inbox</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCreateTrip}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Plan Trip</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Completion Widget */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Profile</h3>
                <div className="text-sm text-gray-600">50%</div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "50%" }}></div>
              </div>
              
              <button
                onClick={handleCompleteProfile}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-3"
              >
                Complete Your Profile
              </button>
              
              <div className="flex items-center gap-2 text-sm text-orange-600 mb-3">
                <AlertCircle className="w-4 h-4" />
                <span>Not Verified</span>
              </div>
              
              <button className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                <Users className="w-4 h-4 inline mr-2" />
                Invite a Friend
              </button>
            </div>

            {/* Search Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Search Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      placeholder="City or country"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {(searchDestination || dateFrom || dateTo) && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to SplitStay, {userName}!
              </h1>
              <p className="text-gray-600 mb-4">
                Ready to discover your next travel adventure?
              </p>
              <button
                onClick={handleCreateTrip}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Plan Your First Trip
              </button>
            </div>

            {/* My Travel Plans Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Travel Plans</h2>
              
              {userTrips.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">You don't have any upcoming trips.</p>
                  <button
                    onClick={handleCreateTrip}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Plan Your First Trip
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTrips.map((trip: any) => (
                    <UserTripCard 
                      key={trip.id}
                      trip={trip}
                      onViewTrip={handleViewTrip}
                      onMessage={handleMessage}
                    />
                  ))}
                  <button
                    onClick={handleCreateTrip}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Plan Another Trip
                  </button>
                </div>
              )}
            </div>

            {/* Profile Completion Reminder */}
            {!profileCompleted && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Complete Your Profile</span>
                </div>
                <p className="text-orange-700 text-sm mb-3">
                  Complete your profile to get better trip recommendations and connect with more travelers.
                </p>
                <button
                  onClick={handleCompleteProfile}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            )}

            {/* Explore Trips Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  ✈️ Explore Upcoming Trips Posted by Other Travelers
                </h2>
                <span className="text-sm text-gray-600">
                  {filteredTrips.length} trips found
                </span>
              </div>

              {filteredTrips.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No trips found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to post a trip with these search criteria!
                  </p>
                  <button
                    onClick={handleCreateTrip}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Your Trip
                  </button>
                </div>
              ) : (
                <div className="relative bg-white rounded-lg shadow-md p-6">
                  {/* Horizontal scrollable container */}
                  <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide scroll-smooth">
                    {filteredTrips.map((trip) => (
                      <div key={trip.id} className="flex-shrink-0 w-80 md:w-96">
                        <TripCard
                          trip={trip}
                          onViewTrip={handleViewTrip}
                          onMessage={handleMessage}
                          onCardClick={handleTripCardClick}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Scroll hint for desktop */}
                  <div className="hidden md:block text-center text-sm text-gray-500 mt-2">
                    <span>← Scroll to explore more trips →</span>
                  </div>
                  
                  {/* Gradient fade indicators */}
                  <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10 rounded-l-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10 rounded-r-lg"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details Modal */}
      <TripModal
        trip={selectedTrip}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewTrip={handleViewTrip}
        onMessage={handleMessage}
      />
    </div>
  );
}