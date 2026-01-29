import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useUser';

interface ProfileGuardProps {
  children: React.ReactNode;
}

export const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: userData, isLoading: userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // If still loading, don't do anything
    if (authLoading || userLoading) return;

    // If no user, redirect to home
    if (!user) {
      navigate('/');
      return;
    }

    // If user exists but profile is not created, redirect to profile creation
    if (userData && !userData.profileCreated) {
      navigate('/create-profile');
      return;
    }
  }, [user, userData, authLoading, userLoading, navigate]);

  // Show loading state while checking
  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // If profile not created, don't render anything (redirect will happen)
  if (userData && !userData.profileCreated) {
    return null;
  }

  // If everything is okay, render the children
  return <>{children}</>;
};
