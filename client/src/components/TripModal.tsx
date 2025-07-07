import { useState } from "react";
import { X, MapPin, Calendar, Users, Globe, ExternalLink, MessageCircle, Eye } from "lucide-react";
import { formatDateRange } from "../data/trips";

interface TripModalProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
  onViewTrip: (tripId: number) => void;
  onMessage: (userId: string) => void;
}

export default function TripModal({ trip, isOpen, onClose, onViewTrip, onMessage }: TripModalProps) {
  if (!isOpen || !trip) return null;

  const platforms = [
    { name: 'Booking.com', icon: '🏨' },
    { name: 'Airbnb', icon: '🏠' },
    { name: 'Agoda', icon: '🏢' },
    { name: 'Hostelworld', icon: '🎒' },
    { name: 'Hotels.com', icon: '🏨' },
    { name: 'Other', icon: '🔗' }
  ];

  const getPlatformIcon = (platformName: string) => {
    const platform = platforms.find(p => p.name === platformName);
    return platform ? platform.icon : '🔗';
  };

  const getProfileColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Trip Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Destination & Date */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              {trip.destination}
            </h3>
            <p className="text-lg text-gray-600 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>

          {/* Traveler Info */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 ${getProfileColor(trip.travelerName)} rounded-full flex items-center justify-center`}>
                <span className="text-xl font-bold text-white">
                  {trip.travelerName.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{trip.travelerName}</h4>
                <p className="text-gray-600">{trip.travelerCountry}</p>
              </div>
            </div>

            {/* Languages */}
            {trip.languages && trip.languages.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Languages Spoken
                </h5>
                <div className="flex flex-wrap gap-2">
                  {trip.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trip Description */}
          {trip.tripNote && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">About This Trip</h5>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg italic">
                "{trip.tripNote}"
              </p>
            </div>
          )}

          {/* Accommodation Info */}
          {trip.accommodationLink && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Accommodation</h5>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{getPlatformIcon(trip.platform)}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{trip.platform}</p>
                  <p className="text-sm text-gray-600">Click to view booking details</p>
                </div>
                <button
                  onClick={() => window.open(trip.accommodationLink, '_blank')}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </button>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {(trip.costPerNight || trip.spotsAvailable || trip.tripType || trip.preferredCoTraveler) && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Trip Details</h5>
              <div className="grid grid-cols-2 gap-4">
                {trip.costPerNight && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Cost per Night</p>
                    <p className="text-lg font-bold text-green-700">${trip.costPerNight}</p>
                  </div>
                )}
                {trip.spotsAvailable && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Spots Available</p>
                    <p className="text-lg font-bold text-blue-700">{trip.spotsAvailable}</p>
                  </div>
                )}
                {trip.tripType && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Trip Type</p>
                    <p className="text-lg font-bold text-purple-700">{trip.tripType}</p>
                  </div>
                )}
                {trip.preferredCoTraveler && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">Preferred Match</p>
                    <p className="text-sm font-medium text-orange-700">
                      {trip.preferredCoTraveler.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onViewTrip(trip.id)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-5 h-5" />
              View Full Trip
            </button>
            <button
              onClick={() => onMessage(trip.userId)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Message Traveler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}