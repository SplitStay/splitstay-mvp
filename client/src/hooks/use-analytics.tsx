import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/analytics';

// Page titles mapping for analytics
const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/login': 'Login',
  '/signup': 'Sign Up',
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/profile/edit': 'Edit Profile',
  '/create-profile': 'Create Profile',
  '/find-roommate': 'Find Roommate',
  '/browse-profiles': 'Browse Profiles',
  '/messages': 'Messages',
  '/leave-review': 'Leave Review',
  '/request-booking': 'Request Booking',
  '/request-sent': 'Request Sent',
  '/chat': 'Chat',
  '/booking-confirmation': 'Booking Confirmation',
  '/check-in': 'Check In',
  '/guest-info': 'Guest Info',
  '/post-stay': 'Post Stay',
  '/rate-roommate': 'Rate Roommate',
};

// Get page title from path
const getPageTitle = (path: string): string => {
  // Handle dynamic routes by removing parameter parts
  const basePath = path.split('/').slice(0, 2).join('/');
  return pageTitles[basePath] || pageTitles[path] || 'SplitStay';
};

// Hook to track page views
export const useAnalytics = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    // Track page view when location changes
    const pageTitle = getPageTitle(location);
    trackPageView(pageTitle, location);
  }, [location]);
  
  return null;
};