// Google Analytics helper functions
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare const window: Window & typeof globalThis;

// Track page views
export const trackPageView = (title: string, path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: title,
      page_path: path,
    });
  }
};

// Track user events
export const trackEvent = (
  action: string, 
  category: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Examples of events to track:
// - Profile creation
export const trackProfileCreation = () => {
  trackEvent('profile_created', 'profile', 'user_profile');
};

// - Search for roommate
export const trackRoommateSearch = (location: string) => {
  trackEvent('search', 'roommate', location);
};

// - Booking request
export const trackBookingRequest = (hotelName: string) => {
  trackEvent('booking_request', 'booking', hotelName);
};

// - Message sent
export const trackMessageSent = (toUser: string) => {
  trackEvent('message_sent', 'messaging', toUser);
};

// - Review submitted
export const trackReviewSubmitted = (rating: number) => {
  trackEvent('review_submitted', 'review', undefined, rating);
};