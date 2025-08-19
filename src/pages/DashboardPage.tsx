import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser, useUpdateUser } from '@/hooks/useUser'
import { Plus, Users, MessageCircle, User, LogOut, Calendar, Bell, Plane } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ShareInviteModal from '@/components/ShareInviteModal'
import { ProfileGuard } from '@/components/ProfileGuard'
import { useNavigate } from 'react-router-dom'

export const DashboardPage = () => {
  const { data: user, isLoading, error } = useUser()
  const updateUser = useUpdateUser()
  const [showShareModal, setShowShareModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'future' | 'past'>('past')
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Show share modal if profile was just created and share modal hasn't been shown yet
    if (user && user.profileCreated && !user.shareModalShown) {
      setShowShareModal(true)
    }
  }, [user])


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

  if (isLoading) {
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

  if (error) {
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
    <ProfileGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">
              SplitStay
            </div>
            <div className="flex gap-3">
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
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Hello, {user?.name}!
            </p>
          </div>

          {/* Trips Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex w-full">
                <button
                  onClick={() => setActiveTab('future')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'future'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  Future Trips
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'past'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Past Trips
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'past' && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-6">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No past trips yet
                  </h3>
                  <p className="text-gray-600">
                    Your completed trips will appear here.
                  </p>
                </div>
              )}
              
              {activeTab === 'future' && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-6">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No future trips yet
                  </h3>
                  <p className="text-gray-600">
                    Your upcoming trips will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Trip Requests Section */}
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
        </div>
      </div>

      <ShareInviteModal
        open={showShareModal}
        onClose={handleShareModalClose}
      />
    </ProfileGuard>
  )
}