import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, User, Building, MessageCircle, Heart, Share2, ExternalLink } from 'lucide-react'
import { getTripById, Trip } from '../lib/tripService'
import { ChatService } from '../lib/chatService'
import { useAuth } from '../contexts/AuthContext'

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadTrip(id)
    }
  }, [id])

  const loadTrip = async (tripId: string) => {
    try {
      setLoading(true)
      const tripData = await getTripById(tripId)
      setTrip(tripData)
    } catch (error) {
      console.error('Error loading trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageHost = async () => {
    // If guest user, redirect to auth with context
    if (!user?.id) {
      navigate('/signup', { 
        state: { 
          from: `/trip/${trip?.id}`, 
          action: 'message', 
          tripId: trip?.id,
          hostName: trip?.host?.name || 'host',
          tripName: trip?.name 
        } 
      });
      return;
    }
    
    if (!trip?.hostId) return
    
    try {
      setMessageLoading(true)
      const conv = await ChatService.getOrCreateDirectConversation(user.id, trip.hostId)
      navigate(`/messages?chat=${conv.id}`)
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setMessageLoading(false)
    }
  }

  const formatTripDates = (trip: Trip) => {
    if (trip.flexible) {
      const month = (trip as any).estimatedmonth || trip.estimatedMonth;
      const year = (trip as any).estimatedyear || trip.estimatedYear;
      return month && year ? `${month} ${year}` : 'Dates TBD';
    } else if (trip.startDate && trip.endDate) {
      return `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`
    }
    return 'Flexible'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-6 w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h1>
          <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/find-partners')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Other Trips
          </button>
        </div>
      </div>
    )
  }

  const isOwnTrip = trip.hostId === user?.id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{trip.name}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Trip Image */}
          {trip.thumbnailUrl && (
            <div className="h-64 bg-gray-200">
              <img
                src={trip.thumbnailUrl}
                alt={trip.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Trip Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.location}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${trip.flexible ? 'text-blue-600' : 'text-gray-600'}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatTripDates(trip)}</span>
                  </div>
                </div>
              </div>

              {!isOwnTrip && (
                <button
                  onClick={handleMessageHost}
                  disabled={messageLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {messageLoading ? 'Loading...' : 'Message Host'}
                </button>
              )}
            </div>

            {/* Trip Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Host:</span>
                      <span className="ml-2 font-medium">{trip.host?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Accommodation:</span>
                      <span className="ml-2 font-medium">{trip.accommodation_type?.name || 'Not specified'}</span>
                    </div>
                  </div>

                  {trip.numberOfRooms && (
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-gray-600">Rooms:</span>
                        <span className="ml-2 font-medium">{trip.numberOfRooms}</span>
                      </div>
                    </div>
                  )}

                  {trip.matchWith && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-gray-600">Looking for:</span>
                        <span className="ml-2 font-medium">{trip.matchWith}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                {trip.bookingUrl ? (
                  <a
                    href={trip.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Accommodation
                  </a>
                ) : (
                  <p className="text-gray-500">No booking link provided</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {trip.description || 'No description provided.'}
              </p>
            </div>

            {/* Call to Action */}
            {!isOwnTrip && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Interested in this trip?
                </h3>
                <p className="text-blue-700 mb-4">
                  Send a message to {trip.host?.name || 'the host'} to learn more and potentially join this adventure!
                </p>
                <button
                  onClick={handleMessageHost}
                  disabled={messageLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  {messageLoading ? 'Loading...' : 'Send Message'}
                </button>
              </div>
            )}

            {isOwnTrip && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  This is your trip
                </h3>
                <p className="text-green-700 mb-4">
                  Manage your trip details or check for new messages from potential travel partners.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate('/messages')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Check Messages
                  </button>
                  <button
                    onClick={() => navigate(`/edit-trip/${trip.id}`)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Edit Trip
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
