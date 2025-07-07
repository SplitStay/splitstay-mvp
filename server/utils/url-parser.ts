import { URL } from 'url';

export interface BookingDetails {
  checkin: string;
  checkout: string;
  destination: string;
  platform: string;
}

export function extractBookingDetails(url: string): BookingDetails {
  try {
    const parsedUrl = new URL(url);
    const searchParams = parsedUrl.searchParams;
    
    // Extract dates if present
    const checkin = searchParams.get('checkin') || '';
    const checkout = searchParams.get('checkout') || '';
    
    // Extract destination from path if possible
    let destination = '';
    const destinationMatch = parsedUrl.pathname.match(/\/hotel\/[\w-]+\/([\w-]+)\./);
    if (destinationMatch) {
      destination = destinationMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Determine platform based on hostname
    let platform = 'Other';
    const hostname = parsedUrl.hostname.toLowerCase();
    
    if (hostname.includes('booking.com')) {
      platform = 'Booking.com';
    } else if (hostname.includes('airbnb.com')) {
      platform = 'Airbnb';
    } else if (hostname.includes('agoda.com')) {
      platform = 'Agoda';
    } else if (hostname.includes('hostelworld.com')) {
      platform = 'Hostelworld';
    } else if (hostname.includes('hotels.com')) {
      platform = 'Hotels.com';
    }

    return {
      checkin,
      checkout,
      destination,
      platform
    };
  } catch (error) {
    console.error('Error parsing booking URL:', error);
    return {
      checkin: '',
      checkout: '',
      destination: '',
      platform: 'Other'
    };
  }
}

// Additional utility to format dates
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  } catch (error) {
    return dateString;
  }
}