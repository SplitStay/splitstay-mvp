import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, Users, Building2, MessageCircle, Heart, Share2, ExternalLink, CalendarDays, Home, Star, Shield, Check, X, Clock, Globe, DollarSign } from 'lucide-react'
import { getTripById, Trip } from '../lib/tripService'
import { ChatService } from '../lib/chatService'
import { useAuth } from '../contexts/AuthContext'
import { iframelyService } from '../lib/iframely'
import { Badge } from '../components/ui/badge'
import { supabase } from '../lib/supabase'
import { EmailService } from '../lib/emailService'

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [accommodationImage, setAccommodationImage] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (id) {
      loadTrip(id)
    }
  }, [id])

  useEffect(() => {
    if (trip?.bookingUrl && !trip.thumbnailUrl) {
      setImageLoading(true)
      iframelyService.getAccommodationPreview(trip.bookingUrl)
        .then(preview => {
          if (preview.image) {
            setAccommodationImage(preview.image)
          }
          setImageLoading(false)
        })
        .catch(() => {
          setImageLoading(false)
        })
    }
  }, [trip?.bookingUrl, trip?.thumbnailUrl])

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

  const handleRequestToJoin = async () => {
    if (!user?.id) {
      navigate('/signup', { 
        state: { 
          from: `/trip/${trip?.id}`, 
          action: 'request_to_join', 
          tripId: trip?.id,
          hostName: trip?.host?.name || 'host',
          tripName: trip?.name 
        } 
      })
      return
    }
    
    if (!trip?.hostId) return
    
    // Prevent users from requesting to join their own trip
    if (user.id === trip.hostId) {
      console.log('Cannot request to join your own trip')
      return
    }
    
    try {
      setRequestLoading(true)
      
      // Create a formal request in the database (this will trigger email notification)
      const requestMessage = `Hi ${trip.host?.name || 'there'}! I'm interested in joining your trip "${trip.name}" in ${trip.location}. The dates ${formatTripDates(trip)} work well for me. Could you tell me more about the accommodation and plans?`
      
      const { error: requestError } = await supabase
        .from('request')
        .insert({
          userId: user.id,
          tripId: trip.id,
          message: requestMessage,
          status: 'pending'
        })
      
      if (requestError) {
        console.error('Error creating request:', requestError)
      // Email notifications are now handled by database triggers when request is inserted
      }
      
      // Create or get conversation with host
      const conv = await ChatService.getOrCreateDirectConversation(user.id, trip.hostId)
      
      // Send the message in chat
      await ChatService.sendMessage(
        conv.id,
        user.id,
        requestMessage,
        'text'
      )
      
      // Navigate to messages
      navigate(`/messages?chat=${conv.id}`)
      
    } catch (error) {
      console.error('Error sending join request:', error)
    } finally {
      setRequestLoading(false)
    }
  }

  const handleMessageHost = async () => {
    if (!user?.id) {
      navigate('/signup', { 
        state: { 
          from: `/trip/${trip?.id}`, 
          action: 'message', 
          tripId: trip?.id,
          hostName: trip?.host?.name || 'host',
          tripName: trip?.name 
        } 
      })
      return
    }
    
    if (!trip?.hostId) return
    
    // Prevent users from messaging themselves
    if (user.id === trip.hostId) {
      console.log('Cannot message yourself')
      return
    }
    
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
      const month = (trip as any).estimatedmonth || trip.estimatedMonth
      const year = (trip as any).estimatedyear || trip.estimatedYear
      return month && year ? `${month} ${year}` : 'Dates TBD'
    } else if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate)
      const end = new Date(trip.endDate)
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
    }
    return 'Flexible dates'
  }

  const getDuration = (trip: Trip) => {
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate)
      const end = new Date(trip.endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return `${days} ${days === 1 ? 'day' : 'days'}`
    }
    return null
  }

  const getRoomSummary = () => {
    if (!trip?.rooms || !Array.isArray(trip.rooms)) return null
    
    const totalBeds = trip.rooms.reduce((sum: number, room: any) => sum + (room.numberOfBeds || 0), 0)
    const ensuiteRooms = trip.rooms.filter((room: any) => room.ensuiteBathroom).length
    
    return {
      totalBeds,
      ensuiteRooms,
      totalRooms: trip.numberOfRooms || trip.rooms.length
    }
  }

  const roomSummary = getRoomSummary()

  // Mock images for gallery (in production, these would come from the trip data)
  const galleryImages = [
    trip?.thumbnailUrl || accommodationImage,
    trip?.host?.imageUrl,
    // Add more images from trip.images if available
  ].filter(Boolean)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 sm:h-96 bg-gray-200" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4" />
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />
            <div className="h-4 bg-gray-200 rounded mb-6 w-2/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded" />
              </div>
              <div className="lg:col-span-1">
                <div className="h-48 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <p className="text-gray-600 mb-4">This trip may have been removed or is no longer available.</p>
          <button
            onClick={() => navigate('/find-partner')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Trips
          </button>
        </div>
      </div>
    )
  }

  const mainImage = trip.thumbnailUrl || accommodationImage

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      <div className="relative h-64 sm:h-96 lg:h-[500px] bg-gradient-to-br from-blue-500 to-purple-600">
        {mainImage ? (
          <img 
            src={mainImage}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
        ) : imageLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Building2 className="w-16 h-16 mx-auto mb-3 opacity-80" />
              <p className="text-xl font-medium">{trip.location}</p>
              <p className="text-sm opacity-80 mt-1">No image available</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Save and Share buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{trip.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{trip.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatTripDates(trip)}</span>
            </div>
            {getDuration(trip) && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{getDuration(trip)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <Building2 className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-semibold text-sm">{trip.accommodation_type?.name || 'Accommodation'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-xs text-gray-500">Group Size</p>
                <p className="font-semibold text-sm">{roomSummary?.totalRooms || 1} room{(roomSummary?.totalRooms || 1) !== 1 ? 's' : ''}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <CalendarDays className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-xs text-gray-500">Flexibility</p>
                <p className="font-semibold text-sm">{trip.flexible ? 'Flexible' : 'Fixed dates'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <Globe className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold text-sm">{trip.joinee ? 'Matched' : 'Open'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this trip</h2>
              <p className="text-gray-700 leading-relaxed">
                {trip.description || 'No description provided for this trip.'}
              </p>
            </div>

            {/* Accommodation Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Accommodation Details</h2>
              <div className="space-y-3">
                {roomSummary && (
                  <>
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        {roomSummary.totalRooms} room{roomSummary.totalRooms !== 1 ? 's' : ''}, 
                        {roomSummary.totalBeds} bed{roomSummary.totalBeds !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {roomSummary.ensuiteRooms > 0 && (
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">
                          {roomSummary.ensuiteRooms} ensuite bathroom{roomSummary.ensuiteRooms !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {trip.bookingUrl && (
                  <a
                    href={trip.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on booking site</span>
                  </a>
                )}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What's Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Shared accommodation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Split costs</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Local companion</span>
                </div>
                <div className="flex items-center gap-3">
                  <X className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">Transportation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Host Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Host Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-start gap-4 mb-4">
                {trip.host?.imageUrl ? (
                  <img 
                    src={trip.host.imageUrl}
                    alt={trip.host.name || 'Host'}
                    className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/profile/${trip.hostId}`)}
                  />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={() => navigate(`/profile/${trip.hostId}`)}
                  >
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  {/* TODO: Make profile clickable to redirect to user's profile page */}
                  <h3 className="font-bold text-lg text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => navigate(`/profile/${trip.hostId}`)}>
                    {trip.host?.name || 'Host'}
                    {user?.id === trip.hostId && (
                      <span className="ml-2 text-sm font-normal text-blue-600">(You)</span>
                    )}
                  </h3>
                  {/* TODO: Implement real star rating system with reviews */}
                  {/* <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-gray-300" />
                    <span className="text-sm text-gray-600 ml-1">4.0</span>
                  </div> */}
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Verified host</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response rate</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response time</span>
                    <span className="font-medium">Within 1 hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trips hosted</span>
                    <span className="font-medium">12</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {user?.id === trip.hostId ? (
                  // Host viewing their own trip
                  <div className="space-y-3">
                    {/* <button
                      onClick={() => navigate(`/dashboard`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <span>Manage Trip</span>
                    </button> */}
                    <div className="text-center text-sm text-gray-500">
                      This is your trip
                    </div>
                  </div>
                ) : (
                  // Other users viewing the trip
                  <>
                    <button
                      onClick={handleMessageHost}
                      disabled={messageLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{messageLoading ? 'Loading...' : 'Message Host'}</span>
                    </button>
                    
                    {!trip.joinee && (
                      <button 
                        onClick={handleRequestToJoin}
                        disabled={requestLoading}
                        className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {requestLoading ? 'Sending Request...' : 'Request to Join'}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Price Estimate */}
              {trip.estimatedCost && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Estimated cost</span>
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${trip.estimatedCost}
                    <span className="text-sm font-normal text-gray-600"> / person</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Split between travelers</p>
                </div>
              )}
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Safety Tips</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Always meet in public places first</li>
                <li>• Verify accommodation bookings</li>
                <li>• Use platform messaging</li>
                <li>• Trust your instincts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}