import { MapPin, Calendar, ExternalLink, Eye, MessageCircle, Share2 } from "lucide-react";
import { formatDateRange } from "../data/trips";

interface UserTripCardProps {
  trip: {
    id: number;
    destination: string;
    startDate: string;
    endDate: string;
    accommodationLink: string;
    platform: string;
    description: string;
    costPerNight?: string;
    spotsAvailable?: string;
    languages?: string[];
    tripType?: string;
    preferredCoTraveler?: string;
  };
  onViewTrip: (tripId: number) => void;
  onMessage: (userId: string) => void;
}

export default function UserTripCard({ trip, onViewTrip, onMessage }: UserTripCardProps) {
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

  const handleAccommodationClick = () => {
    if (trip.accommodationLink) {
      window.open(trip.accommodationLink, '_blank');
    }
  };

  const handleShare = () => {
    const text = `Split this stay with me in ${trip.destination}! ${trip.startDate} - ${trip.endDate}`;
    const url = `${window.location.origin}/trip/${trip.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Trip to ${trip.destination}`,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            {trip.destination}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Calendar className="w-4 h-4" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
        
        {/* Platform Icon - Clickable */}
        <button
          onClick={handleAccommodationClick}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          title={`Open ${trip.platform} booking`}
        >
          <span className="text-lg">{getPlatformIcon(trip.platform)}</span>
          <ExternalLink className="w-3 h-3 text-gray-600" />
        </button>
      </div>

      {/* Description */}
      {trip.description && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">"{trip.description}"</p>
      )}

      {/* Trip Details */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        {trip.costPerNight && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
            ${trip.costPerNight}/night
          </span>
        )}
        {trip.spotsAvailable && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            {trip.spotsAvailable} spots
          </span>
        )}
        {trip.tripType && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            {trip.tripType}
          </span>
        )}
      </div>

      {/* Languages */}
      {trip.languages && trip.languages.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {trip.languages.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {lang}
            </span>
          ))}
          {trip.languages.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{trip.languages.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewTrip(trip.id)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
          View Trip
        </button>
        <button
          onClick={() => onMessage('current_user')}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Manage
        </button>
        <button
          onClick={handleShare}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          title="Share trip"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}