import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const OAuthCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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
        // No user, redirect to login
        navigate('/login', { replace: true });
      }
    };

    handleOAuthRedirect();
  }, [user, loading, navigate]);

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
