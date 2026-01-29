import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  MapPin,
  Shield,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import {
  type AdminTripView,
  getAllTripsForAdmin,
  hideTrip,
  isCurrentUserAdmin,
  unhideTrip,
} from '../lib/adminService';

export const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [trips, setTrips] = useState<AdminTripView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);

        if (adminStatus) {
          const adminTrips = await getAllTripsForAdmin();
          setTrips(adminTrips);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin status');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  const handleToggleVisibility = async (
    tripId: string,
    isCurrentlyHidden: boolean,
  ) => {
    setActionInProgress(tripId);
    setActionError(null);

    try {
      if (isCurrentlyHidden) {
        await unhideTrip(tripId);
      } else {
        await hideTrip(tripId);
      }

      // Update local state
      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId ? { ...trip, isHidden: !isCurrentlyHidden } : trip,
        ),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update trip visibility';
      setActionError(errorMessage);
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (
    startDate: string | null,
    endDate: string | null,
    flexible: boolean,
  ) => {
    if (flexible) {
      return 'Flexible dates';
    }
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const end = new Date(endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return `${start} - ${end}`;
    }
    return 'Dates TBD';
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    navigate('/login?redirect=/admin');
    return null;
  }

  // Not an admin - show 404
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-gray-600 mb-6">Page not found</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Admin - Trip Moderation
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Action error toast */}
        {actionError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty state */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No trips yet
              </h2>
              <p className="text-gray-600">
                There are no trips in the system to moderate.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Trip</div>
              <div className="col-span-2">Host</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-200">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="md:grid md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Trip name */}
                  <div className="col-span-4 mb-2 md:mb-0">
                    <p className="font-medium text-gray-900 truncate">
                      {trip.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate md:hidden">
                      {trip.host?.name || 'Unknown host'}
                    </p>
                  </div>

                  {/* Host */}
                  <div className="col-span-2 hidden md:flex items-center gap-2">
                    {trip.host?.imageUrl ? (
                      <img
                        src={trip.host.imageUrl}
                        alt={trip.host.name || 'Host'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <span className="text-sm text-gray-700 truncate">
                      {trip.host?.name || 'Unknown'}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="col-span-2 hidden md:flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {trip.location}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 hidden md:flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {formatDate(trip.startDate, trip.endDate, trip.flexible)}
                    </span>
                  </div>

                  {/* Status and action */}
                  <div className="col-span-2 flex items-center justify-between md:justify-start gap-3">
                    <Badge
                      className={
                        trip.isHidden
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-green-100 text-green-700 border-green-200'
                      }
                    >
                      {trip.isHidden ? 'Hidden' : 'Visible'}
                    </Badge>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleVisibility(trip.id, trip.isHidden)
                      }
                      disabled={actionInProgress === trip.id}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${
                          actionInProgress === trip.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : trip.isHidden
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                        }
                      `}
                    >
                      {actionInProgress === trip.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"
                        />
                      ) : trip.isHidden ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Show</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span className="hidden sm:inline">Hide</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
