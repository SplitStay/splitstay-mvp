import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MobileNavigation } from '../components/MobileNavigation';
import { MVPBanner } from '../components/MVPBanner';
import { useAuth } from '../contexts/AuthContext';
import {
  getUpcomingEvents,
  getUserRegistrations,
  registerForEvent,
} from '../lib/eventService';

interface EventRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface RegistrationRow {
  event_id: string;
}

export const EventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const upcoming = await getUpcomingEvents();
        setEvents(upcoming);

        if (user) {
          const registrations = await getUserRegistrations();
          setRegisteredEventIds(
            new Set(registrations.map((r: RegistrationRow) => r.event_id)),
          );
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleRegister = async (eventId: string) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent('/events')}`);
      return;
    }

    try {
      setRegisteringId(eventId);
      await registerForEvent(eventId);
      setRegisteredEventIds((prev) => new Set([...prev, eventId]));
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error('Failed to register:', error);
    } finally {
      setRegisteringId(null);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    const opts: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return `${startDate.toLocaleDateString(undefined, opts)} - ${endDate.toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <MVPBanner />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
          {user && (
            <Link
              to="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Dashboard
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
            />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No upcoming events right now. Check back soon!
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const isRegistered = registeredEventIds.has(event.id);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {event.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDateRange(event.start_date, event.end_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <div>
                      {isRegistered ? (
                        <Link
                          to={`/events/${event.id}`}
                          className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg"
                        >
                          Registered
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRegister(event.id)}
                          disabled={registeringId === event.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                        >
                          {!user
                            ? 'Sign in to Register'
                            : registeringId === event.id
                              ? 'Registering...'
                              : 'Register'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {user && <MobileNavigation />}
    </div>
  );
};
