import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Calendar,
  CalendarDays,
  MapPin,
  ShieldAlert,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { iframelyService } from '../lib/iframely';
import type { Trip, TripWithHiddenStatus } from '../lib/tripService';
import { parseLocalDate } from '../utils/dateUtils';
import { Badge } from './ui/badge';

interface TripCardProps {
  // Trip can optionally have isHiddenByAdmin for dashboard view
  trip: (Trip | TripWithHiddenStatus) & {
    accommodation_type?: { name: string } | null;
    host?: { name: string; imageUrl?: string } | null;
    joinee?: { name: string; imageUrl?: string } | null;
  };
  onClick?: () => void;
  className?: string;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onClick,
  className = '',
}) => {
  const [accommodationImage, setAccommodationImage] = useState<string | null>(
    null,
  );
  const [imageLoading, setImageLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (trip.bookingUrl && !trip.thumbnailUrl) {
      setImageLoading(true);
      iframelyService
        .getAccommodationPreview(trip.bookingUrl)
        .then((preview) => {
          if (preview.image) {
            setAccommodationImage(preview.image);
          }
          setImageLoading(false);
        })
        .catch(() => {
          setImageLoading(false);
        });
    }
  }, [trip.bookingUrl, trip.thumbnailUrl]);

  const getDateDisplay = () => {
    if (trip.flexible) {
      const month = trip.estimatedMonth;
      const year = trip.estimatedYear;
      return month && year ? `${month} ${year}` : 'Dates TBD';
    }

    if (trip.startDate && trip.endDate) {
      const start = parseLocalDate(trip.startDate);
      const end = parseLocalDate(trip.endDate);

      if (start && end) {
        const startFormatted = start.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const endFormatted = end.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return `${startFormatted} - ${endFormatted}`;
      }
    }

    return 'Dates TBD';
  };

  const getRoomSummary = () => {
    if (!trip.rooms || !Array.isArray(trip.rooms)) return null;

    const totalBeds = trip.rooms.reduce(
      // biome-ignore lint/suspicious/noExplicitAny: Room is JSON column
      (sum: number, room: any) => sum + (room.numberOfBeds || 0),
      0,
    );
    const ensuiteRooms = trip.rooms.filter(
      // biome-ignore lint/suspicious/noExplicitAny: Room is JSON column
      (room: any) => room.ensuiteBathroom,
    ).length;

    return {
      totalBeds,
      ensuiteRooms,
      totalRooms: trip.numberOfRooms || trip.rooms.length,
    };
  };

  const roomSummary = getRoomSummary();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Don't flip if clicking on the view button
    if (target.closest('.view-button')) {
      return;
    }

    // On mobile, flip the card on tap
    if (window.matchMedia('(max-width: 768px)').matches) {
      e.stopPropagation();
      setIsFlipped(!isFlipped);
    } else {
      // On desktop, navigate on click
      if (onClick) {
        onClick();
      }
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Card flip interaction
    <div
      className={`relative h-full ${className}`}
      style={{ perspective: '1000px' }}
      onMouseEnter={() =>
        !window.matchMedia('(max-width: 768px)').matches && setIsFlipped(true)
      }
      onMouseLeave={() =>
        !window.matchMedia('(max-width: 768px)').matches && setIsFlipped(false)
      }
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onClick={handleCardClick}
      >
        {/* FRONT SIDE - Host Focus */}
        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow min-h-[480px] flex flex-col h-full"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Host Image */}
          <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
            {trip.host?.imageUrl ? (
              <img
                src={trip.host.imageUrl}
                alt={trip.host.name || 'Host'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Users className="w-16 h-16 text-white/70 mx-auto mb-2" />
                  <p className="text-white/90 text-lg font-semibold">
                    {trip.host?.name || 'Host'}
                  </p>
                  <p className="text-white/70 text-sm">{trip.location}</p>
                </div>
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

            {/* Hidden by Admin Badge */}
            {'isHiddenByAdmin' in trip && trip.isHiddenByAdmin && (
              <Badge
                variant="outline"
                className="absolute top-12 left-3 bg-red-100 text-red-700 border-red-300 flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" />
                Hidden by admin
              </Badge>
            )}
          </div>

          {/* Trip Details */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Host Info */}
            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                {trip.host?.name || 'Host'}
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
                    {roomSummary.totalRooms} room
                    {roomSummary.totalRooms !== 1 ? 's' : ''},
                    {roomSummary.totalBeds} bed
                    {roomSummary.totalBeds !== 1 ? 's' : ''}
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

            {/* Accommodation Avatar at Bottom */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
              <div className="flex items-center">
                {accommodationImage ? (
                  <img
                    src={accommodationImage}
                    alt="Accommodation"
                    className="w-12 h-12 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {trip.accommodation_type?.name || 'Accommodation'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {roomSummary
                      ? `${roomSummary.totalRooms} rooms`
                      : 'View details'}
                  </p>
                </div>
              </div>

              {/* Join Status */}
              <div className="text-right">
                {trip.joinee ? (
                  <Badge
                    variant="outline"
                    className="text-green-700 border-green-200"
                  >
                    Matched
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-blue-600 text-white border-blue-600"
                  >
                    Open
                  </Badge>
                )}
              </div>
            </div>

            {/* Mobile View Button */}
            <div className="mt-3 md:hidden">
              {/* biome-ignore lint/a11y/useButtonType: View details button */}
              <button
                onClick={handleViewDetails}
                className="view-button w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">View Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* BACK SIDE - Accommodation Focus */}
        <div
          className="absolute inset-0 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow min-h-[480px] flex flex-col h-full"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Accommodation Image */}
          <div className="h-48 bg-gradient-to-br from-teal-500 to-blue-600 relative">
            {trip.thumbnailUrl ? (
              <img
                src={trip.thumbnailUrl}
                alt={trip.name}
                className="w-full h-full object-cover"
              />
            ) : accommodationImage ? (
              <img
                src={accommodationImage}
                alt={`${trip.location} accommodation`}
                className="w-full h-full object-cover"
              />
            ) : imageLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-400 to-gray-600">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-white/80 mx-auto mb-2" />
                  <p className="text-white/90 text-sm font-medium">
                    {trip.location}
                  </p>
                  <p className="text-white/70 text-xs">
                    {trip.accommodation_type?.name || 'Accommodation'}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Preview not available
                  </p>
                </div>
              </div>
            )}

            {!trip.isPublic && (
              <Badge
                variant="outline"
                className="absolute top-3 left-3 bg-white/90 text-gray-700 border-gray-300"
              >
                Private
              </Badge>
            )}

            {/* Hidden by Admin Badge - Back */}
            {'isHiddenByAdmin' in trip && trip.isHiddenByAdmin && (
              <Badge
                variant="outline"
                className="absolute top-12 left-3 bg-red-100 text-red-700 border-red-300 flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" />
                Hidden by admin
              </Badge>
            )}
          </div>

          {/* Accommodation Details */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                {trip.accommodation_type?.name || 'Accommodation'}
              </h3>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="line-clamp-1">{trip.location}</span>
              </div>

              <div className="flex items-center text-gray-600 text-sm mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{getDateDisplay()}</span>
              </div>

              {roomSummary && (
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <Users className="w-4 h-4 mr-1" />
                  <span>
                    {roomSummary.totalRooms} room
                    {roomSummary.totalRooms !== 1 ? 's' : ''},
                    {roomSummary.totalBeds} bed
                    {roomSummary.totalBeds !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {trip.description && (
              <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                {trip.description}
              </p>
            )}

            {/* Host Info at Bottom */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
              <div className="flex items-center">
                {trip.host?.imageUrl ? (
                  <img
                    src={trip.host.imageUrl}
                    alt={trip.host.name || 'Host'}
                    className="w-12 h-12 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {trip.host?.name || 'Host'}
                  </p>
                  <p className="text-xs text-gray-500">Trip Host</p>
                </div>
              </div>

              <div className="text-right">
                {trip.joinee ? (
                  <Badge
                    variant="outline"
                    className="text-green-700 border-green-200"
                  >
                    Matched
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-blue-600 text-white border-blue-600"
                  >
                    Open
                  </Badge>
                )}
              </div>
            </div>

            {/* Mobile View Button - Back Side */}
            <div className="mt-3 md:hidden">
              {/* biome-ignore lint/a11y/useButtonType: View details button */}
              <button
                onClick={handleViewDetails}
                className="view-button w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">View Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
