import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser, useUpdateUser } from '@/hooks/useUser'
import { MapPin, Star, Clock, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LocationModal from './LocationModal'
import ShareInviteModal from '@/components/ShareInviteModal'
import { ProfileGuard } from '@/components/ProfileGuard'
import { useNavigate } from 'react-router-dom'

export const DashboardPage = () => {
  const { data: user, isLoading, error } = useUser()
  const updateUser = useUpdateUser()
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Show share modal if profile was just created and share modal hasn't been shown yet
    if (user && user.profileCreated && !user.shareModalShown) {
      setShowShareModal(true)
    } else if (user && (!user.location || user.location.trim() === '')) {
      // Only show location modal if share modal doesn't need to be shown
      setShowLocationModal(true)
    }
  }, [user])

  const handleLocationSubmit = async (location: string) => {
    try {
      await updateUser.mutateAsync({ location })
      setShowLocationModal(false)
      setShowShareModal(true)
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SplitStay
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/profile/${user?.id}`)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Show Profile
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                Welcome to Your Dashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-600"
              >
                Hello, {user?.name}!
              </motion.p>
            </div>

            {/* Main Content Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8 mb-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6"
                >
                  <Star className="w-8 h-8 text-blue-600" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-3xl font-bold text-gray-900 mb-4"
                >
                  More functionality coming soon!
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-xl text-gray-600 mb-6"
                >
                  We look forward to your reviews!
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex items-center justify-center gap-6 text-gray-500"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>Coming Soon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{user?.location || 'Location not set'}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Additional Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Tuned</h3>
                <p className="text-gray-600">
                  We're working hard to bring you amazing features. Check back soon!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Feedback Matters</h3>
                <p className="text-gray-600">
                  Your reviews and suggestions help us improve. We can't wait to hear from you!
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSubmit={handleLocationSubmit}
      />
      <ShareInviteModal
        open={showShareModal}
        onClose={handleShareModalClose}
      />
    </ProfileGuard>
  )
}