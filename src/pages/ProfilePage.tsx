import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Camera,
  Edit,
  Globe,
  Heart,
  Languages,
  MapPin,
  MessageCircle,
  Share2,
  Sparkles,
  Star,
  User,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ShareInviteModal from '@/components/ShareInviteModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUser, useUserByIdOrCustomUrl } from '@/hooks/useUser';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const { data: currentUser } = useUser();
  const {
    data: profileUser,
    isLoading,
    error,
  } = useUserByIdOrCustomUrl(id || '');
  const navigate = useNavigate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isOwnProfile =
    authUser?.id === id || (profileUser && authUser?.id === profileUser.id);
  const user = isOwnProfile ? currentUser : profileUser;
  const showCreateProfileButton = authUser && !currentUser?.profileCreated;

  const handleCreateProfile = () => {
    navigate('/create-profile');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile not found
          </h1>
          <p className="text-gray-600 mb-4">
            This profile doesn't exist or has been removed.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <Link
                to="/dashboard"
                className="text-2xl font-bold text-blue-600"
              >
                SplitStay
              </Link>
            </div>
            {showCreateProfileButton && (
              <button
                type="button"
                onClick={handleCreateProfile}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Create Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.name || 'Profile'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                    <User className="w-16 h-16 text-white/70" />
                  </div>
                )}
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  {user.name || 'Anonymous Traveler'}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90">
                  {user.currentPlace && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{user.currentPlace}</span>
                    </div>
                  )}
                  {user.birthPlace && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>From {user.birthPlace}</span>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <p className="mt-4 text-white/90 text-lg max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => navigate('/edit-profile')}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                {/* Age */}
                {user.dayOfBirth && user.monthOfBirth && user.yearOfBirth && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Age
                    </h3>
                    <p className="text-gray-700">
                      {new Date().getFullYear() - user.yearOfBirth} years old
                    </p>
                  </div>
                )}

                {/* Gender */}
                {user.gender && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Gender
                    </h3>
                    <p className="text-gray-700 capitalize">{user.gender}</p>
                  </div>
                )}

                {/* Languages */}
                {user.languages && user.languages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Languages className="w-5 h-5 text-blue-600" />
                      Languages I Speak
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(user.languages as string[]).map((language) => (
                        <span
                          key={language}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Languages */}
                {user.learningLanguages &&
                  user.learningLanguages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                        Learning Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(user.learningLanguages as string[]).map(
                          (language) => (
                            <span
                              key={language}
                              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                            >
                              {language}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-6">
                {/* Travel Traits */}
                {user.travelTraits && user.travelTraits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Travel Style
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(user.travelTraits as string[]).map((trait) => (
                        <span
                          key={trait}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instagram */}
                {user.instagramUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-pink-500" />
                      Instagram
                    </h3>
                    <a
                      href={`https://instagram.com/${user.instagramUrl.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700 font-medium"
                    >
                      @{user.instagramUrl.replace('@', '')}
                    </a>
                  </div>
                )}

                {/* WhatsApp */}
                {user.whatsapp && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      WhatsApp
                    </h3>
                    <p className="text-gray-700">{user.whatsapp}</p>
                  </div>
                )}

                {/* Most Influenced Country */}
                {user.mostInfluencedCountry && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Most Influenced by {user.mostInfluencedCountry}
                    </h3>
                    {user.mostInfluencedCountryDescription && (
                      <p className="text-gray-700">
                        {user.mostInfluencedCountryDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Travel Experience */}
            {user.mostInfluencedExperience && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Most Impactful Travel Experience
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {user.mostInfluencedExperience}
                  </p>
                </div>
              </div>
            )}

            {/* Travel Photos */}
            {user.travelPhotos && user.travelPhotos.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-pink-500" />
                  Travel Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(user.travelPhotos as string[]).map((photo, index) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: Photos array has no unique id
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden"
                    >
                      <img
                        src={photo}
                        // biome-ignore lint/a11y/noRedundantAlt: Descriptive alt for travel photos
                        alt={`Travel photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom URL */}
            {user.personalizedLink && (
              <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Custom Profile URL
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    splitstay.travel/profile/
                  </span>
                  <span className="font-medium text-blue-600">
                    {user.personalizedLink}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      <ShareInviteModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
