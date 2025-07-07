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
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Destination & Date */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {trip.destination}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <Calendar className="w-4 h-4" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
      </div>

      {/* Traveler Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {trip.travelerName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{trip.travelerName}</p>
            <p className="text-sm text-gray-600">{trip.travelerCountry}</p>
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
          <p className="text-sm text-gray-700 italic">"{trip.tripNote}"</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
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