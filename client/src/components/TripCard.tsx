import { MapPin, Calendar, MessageCircle, Eye } from "lucide-react";
import { formatDateRange } from "../data/trips";

interface TripCardProps {
  trip: {
    id: number;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    travelerName: string;
    travelerCountry: string;
    languages: string[];
    tripNote?: string;
    userId: string;
  };
  onViewTrip: (tripId: number) => void;
  onMessage: (userId: string) => void;
}

export default function TripCard({ trip, onViewTrip, onMessage }: TripCardProps) {
  // Generate a consistent profile picture color based on the user's name
  const getProfileColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow h-full">
      {/* Destination & Date */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="truncate">{trip.destination}</span>
        </h3>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
      </div>

      {/* Traveler Info */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 ${getProfileColor(trip.travelerName)} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-lg font-semibold text-white">
              {trip.travelerName.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{trip.travelerName}</p>
            <p className="text-sm text-gray-600 truncate">{trip.travelerCountry}</p>
          </div>
        </div>
        
        {/* Languages */}
        <div className="flex flex-wrap gap-1 mb-3">
          {trip.languages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Trip Note */}
      {trip.tripNote && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 italic line-clamp-3">"{trip.tripNote}"</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
        <button
          onClick={() => onViewTrip(trip.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Trip
        </button>
        <button
          onClick={() => onMessage(trip.userId)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
      </div>
    </div>
  );
}