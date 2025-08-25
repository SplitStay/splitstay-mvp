import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser, useUpdateUser } from '@/hooks/useUser'
import { Plus, Users, MessageCircle, User, LogOut, Calendar, Bell, Plane, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getUserTrips, type Trip } from '../lib/tripService'
import { TripCard } from '../components/TripCard'
import { MobileNavigation } from '../components/MobileNavigation'
import ShareInviteModal from '@/components/ShareInviteModal'
import { MVPBanner } from '../components/MVPBanner'
import { useNavigate, Link } from 'react-router-dom'

export const DashboardPage = () => {
  const { data: user, isLoading, error } = useUser()
  const { user: authUser } = useAuth()
  const updateUser = useUpdateUser()
  const [showShareModal, setShowShareModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'future' | 'past'>('future')
  const [userTrips, setUserTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()
  
  const isGuest = !authUser

  useEffect(() => {
    // Show share modal if profile was just created and share modal hasn't been shown yet
    if (user && user.profileCreated && !user.shareModalShown) {
      setShowShareModal(true)
    }
  }, [user])



  // Load user's trips
  useEffect(() => {
    if (user?.id && !isGuest) {
      const loadTrips = async () => {
        try {
          setTripsLoading(true)
          const trips = await getUserTrips()
          setUserTrips(trips)
        } catch (error) {
          console.error('Error loading trips:', error)
        } finally {
          setTripsLoading(false)
        }
      }
      loadTrips()
    }
  }, [user?.id, isGuest])


  const handleShareModalClose = async () => {
    setShowShareModal(false)
    // Mark share modal as shown so it doesn't appear again
    if (user && user.profileCreated && !user.shareModalShown) {
      try {
        await updateUser.mutateAsync({ shareModalShown: true })
      } catch (error) {
        console.error('Failed to update shareModalShown:', error)
      }
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleAuthRequired = (action?: string) => {
    navigate('/signup', { state: { from: '/dashboard', action } })
  }

  if (isLoading && !isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error && !isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">Failed to load user data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200">
      {/* MVP Banner */}
      <MVPBanner />
      
      {/* Mobile Navigation */}
      <MobileNavigation 
        isGuest={isGuest}
        onAuthRequired={handleAuthRequired}
        user={user}
      />

      {/* Desktop Header */}
      <header className="hidden lg:block px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            SplitStay
          </Link>
          <div className="flex gap-3">
            {isGuest ? (
              <>
                <button
                  onClick={() => navigate('/post-trip')}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add a Trip
                </button>
                <button
                  onClick={() => navigate('/find-partners')}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  <Users className="w-4 h-4" />
                  Find Partners
                </button>
                <button
                  onClick={() => handleAuthRequired('create_profile')}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Create Profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/post-trip')}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add a Trip
                </button>
                <button
                  onClick={() => navigate('/find-partners')}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  <Users className="w-4 h-4" />
                  Find Partners
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages
                </button>
                <button
                  onClick={() => navigate(`/profile/${user?.id}`)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
                  Show Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-6 sm:mb-8">
            {isGuest ? (
              <>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Welcome to SplitStay
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4">
                  Explore how travelers share accommodations and split costs
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mx-auto">
                  <p className="text-blue-800 text-sm sm:text-base">
                    <Sparkles className="inline w-4 h-4 mr-1" />
                    You're browsing as a guest. Sign up to post trips and message travelers!
                  </p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                  Hello, {user?.name}!
                </p>
              </>
            )}
          </div>

          {/* Trips Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
            {isGuest ? (
              <div className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
                  <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Discover Amazing Trips
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Browse trips posted by travelers around the world. Find your perfect travel partner and split accommodation costs!
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 justify-center">
                  <button
                    onClick={() => navigate('/find-partners')}
                    className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    <Users className="w-4 h-4" />
                    Browse Trips
                  </button>
                  <button
                    onClick={() => navigate('/post-trip')}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    Post Your Trip
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex w-full">
                    <button
                      onClick={() => setActiveTab('future')}
                      className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'future'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Plane className="w-4 h-4" />
                      <span className="hidden sm:inline">Future Trips</span>
                      <span className="sm:hidden">Future</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('past')}
                      className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'past'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">Past Trips</span>
                      <span className="sm:hidden">Past</span>
                    </button>
                  </nav>
                </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {tripsLoading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-gray-600 text-sm sm:text-base">Loading your trips...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'future' && (
                    <div>
                      {userTrips.filter(trip => {
                        if (trip.flexible) return true;
                        return trip.startDate ? new Date(trip.startDate) >= new Date() : true;
                      }).length > 0 ? (
                        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                          {userTrips.filter(trip => {
                            if (trip.flexible) return true;
                            return trip.startDate ? new Date(trip.startDate) >= new Date() : true;
                          }).map((trip) => (
                            <TripCard
                              key={trip.id}
                              trip={trip}
                              onClick={() => navigate(`/trip/${trip.id}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-3 sm:mb-4">
                            <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            No upcoming trips yet
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Create your first trip and find travel partners!
                          </p>
                          <button
                            onClick={() => navigate('/post-trip')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                          >
                            Post Your First Trip
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 'past' && (
                    <div>
                      {userTrips.filter(trip => {
                        if (trip.flexible) return false;
                        return trip.endDate ? new Date(trip.endDate) < new Date() : false;
                      }).length > 0 ? (
                        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                          {userTrips.filter(trip => {
                            if (trip.flexible) return false;
                            return trip.endDate ? new Date(trip.endDate) < new Date() : false;
                          }).map((trip) => (
                            <TripCard
                              key={trip.id}
                              trip={trip}
                              onClick={() => navigate(`/trip/${trip.id}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-3 sm:mb-4">
                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            No past trips yet
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600">
                            Your completed trips will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
              </>
            )}
          </div>

          {/* Trip Requests Section - Only for authenticated users */}
          {!isGuest && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                    <Bell className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Trip Requests Received
                    </h2>
                    <p className="text-sm text-gray-600">
                      People wanting to join your trips
                    </p>
                  </div>
                </div>
                {/* Requests count badge (hidden when 0) */}
                {/* TODO: wire actual count from API when available */}
                {false && (
                  <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                    0
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-6">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Trip Requests Yet
                </h3>
                <p className="text-gray-600">
                  When people want to join your trips, you'll see their requests here.
                </p>
              </div>
            </div>
            </div>
          )}
        </div>

        {!isGuest && (
          <ShareInviteModal
            open={showShareModal}
            onClose={handleShareModalClose}
          />
        )}
      </div>
    </div>
  )
}