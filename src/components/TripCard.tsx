import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Building2, CalendarDays } from 'lucide-react';
import { Badge } from './ui/badge';
import type { Trip } from '../lib/tripService';

interface TripCardProps {
  trip: Trip & {
    accommodation_type?: { name: string } | null;
    host?: { name: string; imageUrl?: string } | null;
    joinee?: { name: string; imageUrl?: string } | null;
  };
  onClick?: () => void;
  className?: string;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onClick, className = '' }) => {
  const getDateDisplay = () => {
    if (trip.flexible) {
      return `${trip.estimatedMonth} ${trip.estimatedYear}`;
    }
    
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const end = new Date(trip.endDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${start} - ${end}`;
    }
    
    return 'Dates TBD';
  };

  const getRoomSummary = () => {
    if (!trip.rooms || !Array.isArray(trip.rooms)) return null;
    
    const totalBeds = trip.rooms.reduce((sum: number, room: any) => sum + (room.numberOfBeds || 0), 0);
    const ensuiteRooms = trip.rooms.filter((room: any) => room.ensuiteBathroom).length;
    
    return {
      totalBeds,
      ensuiteRooms,
      totalRooms: trip.numberOfRooms || trip.rooms.length
    };
  };

  const roomSummary = getRoomSummary();

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer border border-gray-200 hover:shadow-xl transition-shadow ${className}`}
    >
      {/* Trip Image */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {trip.thumbnailUrl ? (
          <img 
            src={trip.thumbnailUrl} 
            alt={trip.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="w-16 h-16 text-white/70" />
          </div>
        )}
        
        {/* Flexible Badge */}
        {trip.flexible && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-white/90 text-blue-700 border-blue-200"
          >
            <CalendarDays className="w-3 h-3 mr-1" />
            Flexible
          </Badge>
        )}

        {/* Privacy Badge */}
        {!trip.isPublic && (
          <Badge 
            variant="outline" 
            className="absolute top-3 left-3 bg-white/90 text-gray-700 border-gray-300"
          >
            Private
          </Badge>
        )}
      </div>

      {/* Trip Details */}
      <div className="p-4">
        {/* Title & Location */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
            {trip.name}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{trip.location}</span>
          </div>
        </div>

        {/* Date Display */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{getDateDisplay()}</span>
          {trip.flexible && (
            <span className="ml-2 text-blue-600 font-medium">
              (Dates TBD)
            </span>
          )}
        </div>

        {/* Accommodation Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-1" />
            <span>{trip.accommodation_type?.name || 'Accommodation'}</span>
          </div>
          
          {roomSummary && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>
                {roomSummary.totalRooms} room{roomSummary.totalRooms !== 1 ? 's' : ''}, 
                {roomSummary.totalBeds} bed{roomSummary.totalBeds !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {trip.description && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {trip.description}
          </p>
        )}

        {/* Host Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center">
            {trip.host?.imageUrl ? (
              <img 
                src={trip.host.imageUrl} 
                alt={trip.host.name || 'Host'}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {trip.host?.name || 'Host'}
              </p>
              <p className="text-xs text-gray-500">Trip Host</p>
            </div>
          </div>

          {/* Join Status */}
          <div className="text-right">
            {trip.joinee ? (
              <Badge variant="outline" className="text-green-700 border-green-200">
                Matched
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-blue-700 border-blue-200">
                Open
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
