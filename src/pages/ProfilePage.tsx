import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, Languages, Star, Camera, LogOut, Globe, Sparkles, UserPlus, Share2, User, Heart, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useUser, useUserById } from '@/hooks/useUser'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import ShareInviteModal from '@/components/ShareInviteModal'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user: authUser, signOut } = useAuth()
  const { data: currentUser } = useUser()
  const { data: profileUser, isLoading, error } = useUserById(id || '')
  const navigate = useNavigate()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Determine if this is the current user's own profile
  const isOwnProfile = authUser?.id === id
  
  // Use appropriate user data
  const user = isOwnProfile ? currentUser : profileUser

  const handleSignOut = async () => {
    await signOut()
  }


  const handleCreateProfile = () => {
    if (authUser) {
      // User is logged in but doesn't have a profile
      navigate('/create-profile')
    } else {
      // User is not logged in
      navigate('/signup')
    }
  }

  // Calculate age from birth date
  const getAge = () => {
    if (!user?.dayOfBirth || !user?.monthOfBirth || !user?.yearOfBirth) return null
    const birthDate = new Date(user.yearOfBirth, user.monthOfBirth - 1, user.dayOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const floatingAnimation = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cream to-blue-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-navy/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <motion.div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="w-16 h-16 border-4 border-navy/30 border-t-navy rounded-full mx-auto mb-6"
          />
          <motion.h2 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl font-bold text-navy"
          >
            Loading your adventure...
          </motion.h2>
        </motion.div>
      </div>
    )
  }

  if (error || (!isLoading && !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-cream to-red-200 flex items-center justify-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-3xl border border-gray-200 shadow-xl max-w-md mx-4"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-6"
          >
            👤
          </motion.div>
          <h1 className="text-3xl font-bold text-navy mb-4">User Not Found</h1>
          <p className="text-gray-600 text-lg mb-6">
            The profile you're looking for doesn't exist or hasn't been created yet.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-navy text-white px-6 py-3 rounded-full hover:bg-navy-dark transition-all duration-300 font-medium"
          >
            Go Home
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const age = getAge()

  // Show "Create my Profile" button if:
  // 1. Not viewing own profile AND (user not logged in OR logged in user hasn't created profile)
  const showCreateProfileButton = !isOwnProfile && (!authUser || (currentUser && !currentUser.profileCreated))

  return (
      <div className="min-h-screen bg-cream relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating orbs */}
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-navy/5 rounded-full blur-3xl"
            {...floatingAnimation}
          />
          <motion.div 
            className="absolute top-1/3 -left-32 w-64 h-64 bg-navy/8 rounded-full blur-3xl"
            animate={{
              x: [-20, 20, -20],
              transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/3 w-96 h-96 bg-navy/3 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              transition: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Animated particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-navy/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 lg:gap-6">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(authUser ? '/dashboard' : '/')}
                className="flex items-center gap-2 lg:gap-3 text-gray-600 hover:text-navy transition-all duration-300 bg-gray-50 hover:bg-gray-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full backdrop-blur-sm border border-gray-200"
              >
                <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium text-sm lg:text-base hidden sm:inline">
                  {authUser ? 'Back to Dashboard' : 'Back to Home'}
                </span>
                <span className="font-medium text-sm sm:hidden">Back</span>
              </motion.button>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-lg lg:text-2xl font-bold text-navy"
              >
                SplitStay
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {showCreateProfileButton && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateProfile}
                  className="flex items-center gap-2 lg:gap-3 bg-navy text-white px-3 py-2 lg:px-6 lg:py-3 rounded-full hover:bg-navy-dark transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
                >
                  <UserPlus className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Create my Profile</span>
                  <span className="sm:hidden">Create My Profile</span>
                </motion.button>
              )}
              
              {authUser && isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="flex items-center gap-2 lg:gap-3 bg-red-600 text-white px-3 py-2 lg:px-6 lg:py-3 rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm lg:text-base"
                >
                  <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Hero Profile Section */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-gray-200 shadow-2xl overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-navy/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-navy/8 rounded-full blur-2xl" />
                
                <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                  {/* Enhanced Profile Image */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-navy/20 rounded-full blur opacity-30" />
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name || 'Profile'}
                        className="w-36 h-36 lg:w-48 lg:h-48 rounded-full object-cover border-4 border-white shadow-2xl relative z-10"
                      />
                    ) : (
                      <div className="w-36 h-36 lg:w-48 lg:h-48 rounded-full bg-gray-100 border-4 border-white shadow-2xl flex items-center justify-center relative z-10">
                        <svg className="w-20 h-20 lg:w-24 lg:h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </motion.div>

                  {/* Enhanced User Info */}
                  <div className="text-center lg:text-left flex-1">
                    <motion.h1 
                      variants={itemVariants}
                      className="text-4xl lg:text-6xl font-bold text-navy mb-4 leading-tight"
                    >
                      {user.name || 'World Explorer'}
                    </motion.h1>
                    
                    <motion.div 
                      variants={itemVariants}
                      className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-6 text-gray-600"
                    >
                      {age && (
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                          <Calendar className="w-5 h-5 text-navy" />
                          <span className="font-medium">{age} years old</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                          <MapPin className="w-5 h-5 text-navy" />
                          <span className="font-medium">{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        <Globe className="w-5 h-5 text-navy" />
                        <span className="font-medium">Adventurer</span>
                      </div>
                    </motion.div>

                    {user.bio && (
                      <motion.p 
                        variants={itemVariants}
                        className="text-xl text-gray-700 leading-relaxed max-w-3xl bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm"
                      >
                        {user.bio}
                      </motion.p>
                    )}

                    {/* Share My Profile Button - Only show for own profile */}
                    {isOwnProfile && (
                      <motion.div 
                        variants={itemVariants}
                        className="mt-6"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsShareModalOpen(true)}
                          className="flex items-center gap-3 bg-navy text-white px-6 py-3 rounded-full hover:bg-navy/90 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share My Profile</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Info */}
              {(user.birthPlace || user.gender) && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/95 backdrop-blur-2xl border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-navy/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-8 relative z-10">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="flex items-center gap-4 mb-6"
                      >
                        <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-navy">Personal Info</h3>
                      </motion.div>
                      <div className="space-y-4">
                        {user.birthPlace && (
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-navy" />
                            <span className="text-gray-700">
                              <span className="font-medium">Born in:</span> {user.birthPlace}
                            </span>
                          </div>
                        )}
                        {user.gender && (
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-navy" />
                            <span className="text-gray-700">
                              <span className="font-medium">Gender:</span> {user.gender}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Languages */}
              {user.languages && user.languages.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/95 backdrop-blur-2xl border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-navy/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-8 relative z-10">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="flex items-center gap-4 mb-6"
                      >
                        <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg">
                          <Languages className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-navy">Languages I Speak</h3>
                      </motion.div>
                      <div className="flex flex-wrap gap-3">
                        {(user.languages as string[]).map((language, index) => (
                          <motion.div
                            key={language}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.1, y: -2 }}
                          >
                            <Badge className="bg-navy text-white hover:bg-navy-dark px-4 py-2 text-sm font-medium shadow-lg border-0">
                              {language}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Learning Languages */}
              {user.learningLanguages && (user.learningLanguages as string[]).length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/95 backdrop-blur-2xl border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-navy/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-8 relative z-10">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        className="flex items-center gap-4 mb-6"
                      >
                        <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg">
                          <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-navy">Languages I'm Learning</h3>
                      </motion.div>
                      <div className="flex flex-wrap gap-3">
                        {(user.learningLanguages as string[]).map((language, index) => (
                          <motion.div
                            key={language}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.1, y: -2 }}
                          >
                            <Badge 
                              variant="outline" 
                              className="border-navy text-navy hover:bg-navy/10 px-4 py-2 text-sm font-medium bg-white/50"
                            >
                              {language}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Travel Traits */}
              {user.travelTraits && user.travelTraits.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="bg-white/95 backdrop-blur-2xl border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-navy/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-8 relative z-10">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: -10 }}
                        className="flex items-center gap-4 mb-6"
                      >
                        <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg">
                          <Star className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-navy">My Travel Style</h3>
                      </motion.div>
                      <div className="flex flex-wrap gap-3">
                        {user.travelTraits.map((trait, index) => (
                          <motion.div
                            key={trait}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.1, y: -2 }}
                          >
                            <Badge 
                              variant="outline" 
                              className="border-navy text-navy hover:bg-navy/10 px-4 py-2 text-sm font-medium bg-white/50"
                            >
                              {trait}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Cultural Influence Section - Full Width */}
            {(user.currentPlace || user.mostInfluencedCountry || user.mostInfluencedCountryDescription || user.mostInfluencedExperience) && (
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-2xl border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-navy/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-8 relative z-10">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-4 mb-8"
                    >
                      <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg">
                        <Heart className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-navy">Cultural Influence</h3>
                        <p className="text-gray-600">Places and experiences that shaped me</p>
                      </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.currentPlace && (
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <Globe className="w-5 h-5 text-navy" />
                            <h4 className="font-bold text-navy">Country I Call Home</h4>
                          </div>
                          <p className="text-gray-700">{user.currentPlace}</p>
                        </div>
                      )}
                      
                      {user.mostInfluencedCountry && (
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <Star className="w-5 h-5 text-navy" />
                            <h4 className="font-bold text-navy">Most Influenced By</h4>
                          </div>
                          <p className="text-gray-700">{user.mostInfluencedCountry}</p>
                          {user.mostInfluencedCountryDescription && (
                            <p className="text-gray-600 text-sm mt-2 italic">"{user.mostInfluencedCountryDescription}"</p>
                          )}
                        </div>
                      )}
                      
                      {user.mostInfluencedExperience && (
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm md:col-span-2">
                          <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="w-5 h-5 text-navy" />
                            <h4 className="font-bold text-navy">Most Influential Experience</h4>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{user.mostInfluencedExperience}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}


            {/* Travel Photos - Enhanced Gallery */}
            {user.travelPhotos && user.travelPhotos.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-2xl border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-navy/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-8 relative z-10">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-4 mb-8"
                    >
                      <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg">
                        <Camera className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-navy">My Travel Memories</h3>
                        <p className="text-gray-600">Capturing moments from around the world</p>
                      </div>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {user.travelPhotos.map((photo, index) => (
                        photo && (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="aspect-square rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 relative group"
                          >
                            <img
                              src={photo}
                              alt={`Travel memory ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-4 left-4 text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Memory #{index + 1}
                            </div>
                          </motion.div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Empty State */}
            {!user.languages?.length && !user.learningLanguages?.length && !user.travelTraits?.length && !user.travelPhotos?.length && !user.birthPlace && !user.gender && !user.currentPlace && !user.mostInfluencedCountry && !user.mostInfluencedExperience && (
              <motion.div variants={itemVariants}>
                <Card className="bg-white/95 backdrop-blur-2xl border-gray-200 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-20 h-20 bg-navy rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-navy mb-4">Adventure Awaits!</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      This traveler is just beginning their journey. Soon this space will be filled with incredible stories, photos, and experiences from around the world!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Share Invite Modal */}
        <ShareInviteModal 
          open={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={`${window.location.origin}/profile/${user?.id}`}
        />
      </div>
  )
}