import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const EmailConfirmationHandler: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const signupType = urlParams.get('type');

    if (signupType === 'signup' && user) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, '/');

      // Navigate to profile creation
      navigate('/create-profile', { replace: true });
    } else if (!user) {
      // If no user and we have type=signup, they might need to log in
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your email...</p>
        </div>
      </div>
    );
  }

  return null;
};
