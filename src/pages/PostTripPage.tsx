import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Step1Destination from './PostTripSteps/Step1Destination';
import Step2Accommodation from './PostTripSteps/Step2Accommodation';
import Step3Preferences from './PostTripSteps/Step3Preferences';
import TripPreview from './PostTripSteps/TripPreview';
import PostTripSuccessModal from './PostTripSteps/PostTripSuccessModal';

import { supabase } from '@/lib/supabase';
import { createTrip, type TripFormData } from '@/lib/tripService';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/lib/amplitude';

type Step = 1 | 2 | 3 | 4;

const defaultTrip = {
  name: '',
  description: '',
  location: '',
  flexible: false,
  startDate: null as string | null,
  endDate: null as string | null,
  estimatedMonth: null as string | null,
  estimatedYear: null as string | null,
  accommodationTypeId: '',
  bookingUrl: '',
  numberOfRooms: 1,
  rooms: [],
  matchWith: 'anyone',
  vibe: '',
  isPublic: true,
  thumbnailUrl: null as string | null,
};

const PostTripPage = () => {
  const [step, setStep] = useState<Step>(1);
  const [trip, setTrip] = useState(defaultTrip);
  const [personalNote, setPersonalNote] = useState('');
  const [matchWith, setMatchWith] = useState<'male' | 'female' | 'anyone'>('anyone');
  const [vibe, setVibe] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { user: authUser } = useAuth();
  
  const isGuest = !authUser;

  // Step navigation
  const next = () => setStep((s) => (s < 4 ? (s + 1) as Step : s));
  const back = () => setStep((s) => (s > 1 ? (s - 1) as Step : s));

  // Handle trip post
  const handlePost = async () => {
    // If guest user, save trip data and redirect to auth
    if (isGuest) {
      const tripData = {
        name: trip.name,
        location: trip.location,
        flexible: trip.flexible,
        startDate: trip.startDate,
        endDate: trip.endDate,
        estimatedMonth: trip.estimatedMonth,
        estimatedYear: trip.estimatedYear,
        bookingUrl: trip.bookingUrl,
        numberOfRooms: trip.numberOfRooms,
        rooms: trip.rooms,
        vibe: trip.vibe || vibe,
        matchWith: trip.matchWith,
        thumbnailUrl: trip.thumbnailUrl,
      };
      
      localStorage.setItem('splitstay_pending_trip', JSON.stringify(tripData));
      navigate('/signup', { state: { from: '/post-trip', action: 'create_trip', tripName: trip.name } });
      return;
    }
    
    if (!user) {
      toast.error('User not loaded. Please try again.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare trip data for creation
      const tripData: TripFormData = {
        name: trip.name,
        location: trip.location,
        flexible: trip.flexible,
        startDate: trip.startDate,
        endDate: trip.endDate,
        estimatedMonth: trip.estimatedMonth,
        estimatedYear: trip.estimatedYear,
        bookingUrl: trip.bookingUrl,
        numberOfRooms: trip.numberOfRooms,
        rooms: trip.rooms,
        vibe: trip.vibe || vibe,
        matchWith: trip.matchWith,
        thumbnailUrl: trip.thumbnailUrl,
      };



      // Create the trip
      await createTrip(tripData);
      
      toast.success('Trip posted successfully!', {
        duration: 4000,
        icon: '✈️',
      });
      
      trackEvent('Add_Trip', {
        location: trip.location,
        flexible: trip.flexible,
        has_booking_url: !!trip.bookingUrl,
        number_of_rooms: trip.numberOfRooms,
        match_with: trip.matchWith,
        has_vibe: !!vibe
      });
      
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(`Failed to post trip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Step rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200 flex flex-col items-center py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl lg:max-w-4xl"
      >
        <div className="w-full bg-white rounded-2xl shadow-xl p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4 lg:mb-6 text-center">Post a Trip</h1>
          <div className="mb-4 lg:mb-6 flex justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full ${step === s ? 'bg-blue-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          {step === 1 && (
            <Step1Destination
              trip={trip}
              setTrip={setTrip}
              next={next}
            />
          )}
          {step === 2 && (
            <Step2Accommodation
              trip={trip}
              setTrip={setTrip}
              personalNote={personalNote}
              setPersonalNote={setPersonalNote}
              back={back}
              next={next}
            />
          )}
          {step === 3 && (
            <Step3Preferences
              trip={trip}
              setTrip={setTrip}
              matchWith={matchWith}
              setMatchWith={(m) => setMatchWith(m as 'male' | 'female' | 'anyone')}
              vibe={vibe}
              setVibe={setVibe}
              back={back}
              next={next}
            />
          )}
          {step === 4 && (
            <TripPreview
              trip={trip}
              personalNote={personalNote}
              matchWith={matchWith}
              vibe={vibe}
              back={back}
              onPost={handlePost}
              loading={loading}
            />
          )}
        </div>
      </motion.div>
      <PostTripSuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/dashboard');
        }}
        trip={trip}
      />
      </div>
  );
};

export default PostTripPage;
