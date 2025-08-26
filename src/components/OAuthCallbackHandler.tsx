import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createTrip } from '../lib/tripService';
import toast from 'react-hot-toast';

export const OAuthCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const hasHashTokens = window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token');
  const hasCodeParam = urlParams.has('code');

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      if (loading) return;

      if (user) {
        try {
          // Check if user has a profile
          const { data: userData, error } = await supabase
            .from('user')
            .select('profileCreated')
            .eq('id', user.id)
            .single();

          if (!error && userData?.profileCreated) {
            // Check for pending trip data and create trip for existing users
            const pendingTripData = localStorage.getItem('splitstay_pending_trip');
            if (pendingTripData) {
              try {
                const tripData = JSON.parse(pendingTripData);
                await createTrip(tripData);
                localStorage.removeItem('splitstay_pending_trip');
                toast.success('Trip posted successfully!', { icon: '✈️' });
              } catch (error) {
                console.error('Error creating pending trip:', error);
                toast.error('Failed to post your trip. You can try posting again from the dashboard.');
              }
            }
            
            // User has profile, go to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            // User needs to create profile
            navigate('/create-profile', { replace: true });
          }
        } catch (error) {
          // If user doesn't exist in our table, they need to create profile
          navigate('/create-profile', { replace: true });
        }
      } else {
        // If we're in the middle of an OAuth callback (tokens/code present), wait for session
        if (hasHashTokens || hasCodeParam) {
          return;
        }

        // Otherwise, no user and not an OAuth callback -> go to login
        navigate('/login', { replace: true });
      }
    };

    handleOAuthRedirect();
  }, [user, loading, navigate, hasHashTokens, hasCodeParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return null;
};
