import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Step1Destination from './PostTripSteps/Step1Destination';
import Step2Accommodation from './PostTripSteps/Step2Accommodation';
import Step3Preferences from './PostTripSteps/Step3Preferences';
import TripPreview from './PostTripSteps/TripPreview';
import PostTripSuccessModal from './PostTripSteps/PostTripSuccessModal';
import { ProfileGuard } from '@/components/ProfileGuard';
import { supabase } from '@/lib/supabase';
import type { TablesInsert } from '@/types/database.types';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';

type Step = 1 | 2 | 3 | 4;

const defaultTrip: Partial<TablesInsert<'trip'>> = {
  name: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  bookingUrl: '',
  thumbnailUrl: '',
  isPublic: 1,
};

const PostTripPage = () => {
  const [step, setStep] = useState<Step>(1);
  const [trip, setTrip] = useState<Partial<TablesInsert<'trip'>>>(defaultTrip);
  const [personalNote, setPersonalNote] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [matchWith, setMatchWith] = useState<'male' | 'female' | 'anyone'>('anyone');
  const [vibe, setVibe] = useState('');
  const [instagram, setInstagram] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useUser();

  // Step navigation
  const next = () => setStep((s) => (s < 4 ? (s + 1) as Step : s));
  const back = () => setStep((s) => (s > 1 ? (s - 1) as Step : s));

  // Handle trip post
  const handlePost = async () => {
    if (!user) {
      toast.error('User not loaded. Please try again.');
      return;
    }
    setLoading(true);
    const description = [trip.description, vibe, personalNote].filter(Boolean).join('\n\n');
    const insertTrip: TablesInsert<'trip'> = {
      ...trip,
      description,
      isPublic: trip.isPublic ?? 1,
      hostId: user.id,
    } as TablesInsert<'trip'>;
    const { error } = await supabase.from('trip').insert([insertTrip]);
    setLoading(false);
    if (!error) {
      toast.success('Trip posted successfully!', {
        duration: 4000,
        icon: '✈️',
      });
      setShowSuccess(true);
    } else {
      toast.error('Failed to post trip: ' + error.message);
    }
  };

  // Step rendering
  return (
    <ProfileGuard>
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
              languages={languages}
              setLanguages={setLanguages}
              matchWith={matchWith}
              setMatchWith={(m) => setMatchWith(m as 'male' | 'female' | 'anyone')}
              vibe={vibe}
              setVibe={setVibe}
              instagram={instagram}
              setInstagram={setInstagram}
              back={back}
              next={next}
            />
          )}
          {step === 4 && (
            <TripPreview
              trip={trip}
              personalNote={personalNote}
              languages={languages}
              matchWith={matchWith}
              vibe={vibe}
              instagram={instagram}
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
    </ProfileGuard>
  );
};

export default PostTripPage;
