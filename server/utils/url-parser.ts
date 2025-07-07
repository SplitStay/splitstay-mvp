import { URL } from 'url';

export interface BookingDetails {
  checkin: string;
  checkout: string;
  destination: string;
  platform: string;
}

function getCountryName(countryCode: string): string {
  const countries: { [key: string]: string } = {
    'ES': 'Spain', 'FR': 'France', 'IT': 'Italy', 'DE': 'Germany', 'GB': 'United Kingdom',
    'US': 'United States', 'CA': 'Canada', 'AU': 'Australia', 'JP': 'Japan', 'KR': 'South Korea',
    'CN': 'China', 'IN': 'India', 'TH': 'Thailand', 'PH': 'Philippines', 'ID': 'Indonesia',
    'SG': 'Singapore', 'MY': 'Malaysia', 'VN': 'Vietnam', 'BR': 'Brazil', 'MX': 'Mexico',
    'AR': 'Argentina', 'CL': 'Chile', 'PE': 'Peru', 'CO': 'Colombia', 'ZA': 'South Africa',
    'EG': 'Egypt', 'MA': 'Morocco', 'TN': 'Tunisia', 'KE': 'Kenya', 'NG': 'Nigeria',
    'GH': 'Ghana', 'ET': 'Ethiopia', 'UG': 'Uganda', 'TZ': 'Tanzania', 'RW': 'Rwanda',
    'NL': 'Netherlands', 'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'SE': 'Sweden',
    'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland', 'CZ': 'Czech Republic',
    'HU': 'Hungary', 'RO': 'Romania', 'BG': 'Bulgaria', 'HR': 'Croatia', 'GR': 'Greece',
    'PT': 'Portugal', 'IE': 'Ireland', 'IS': 'Iceland', 'LU': 'Luxembourg', 'MT': 'Malta',
    'CY': 'Cyprus', 'EE': 'Estonia', 'LV': 'Latvia', 'LT': 'Lithuania', 'SK': 'Slovakia',
    'SI': 'Slovenia', 'MK': 'North Macedonia', 'AL': 'Albania', 'ME': 'Montenegro',
    'RS': 'Serbia', 'BA': 'Bosnia and Herzegovina', 'XK': 'Kosovo', 'MD': 'Moldova',
    'UA': 'Ukraine', 'BY': 'Belarus', 'RU': 'Russia', 'TR': 'Turkey', 'IL': 'Israel',
    'JO': 'Jordan', 'LB': 'Lebanon', 'SY': 'Syria', 'IQ': 'Iraq', 'IR': 'Iran',
    'AE': 'United Arab Emirates', 'SA': 'Saudi Arabia', 'QA': 'Qatar', 'KW': 'Kuwait',
    'BH': 'Bahrain', 'OM': 'Oman', 'YE': 'Yemen', 'LK': 'Sri Lanka', 'BD': 'Bangladesh',
    'PK': 'Pakistan', 'AF': 'Afghanistan', 'NP': 'Nepal', 'BT': 'Bhutan', 'MM': 'Myanmar',
    'LA': 'Laos', 'KH': 'Cambodia', 'NZ': 'New Zealand', 'FJ': 'Fiji', 'PG': 'Papua New Guinea'
  };
  
  return countries[countryCode] || countryCode;
}

export function extractBookingDetails(url: string): BookingDetails {
  try {
    const parsedUrl = new URL(url);
    const searchParams = parsedUrl.searchParams;
    
    // Extract dates if present
    const checkin = searchParams.get('checkin') || '';
    const checkout = searchParams.get('checkout') || '';
    
    // Extract destination from path with enhanced logic
    let destination = '';
    
    // For Booking.com URLs, try different patterns
    if (url.includes('booking.com')) {
      // Pattern: /hotel/es/hotel-name -> extract country code (prioritize this)
      const countryMatch = parsedUrl.pathname.match(/\/hotel\/([a-z]{2})\//);
      
      if (countryMatch) {
        const countryCode = countryMatch[1].toUpperCase();
        const countryName = getCountryName(countryCode);
        
        if (countryName !== countryCode) { // Only use if we found a valid country name
          destination = countryName;
        }
      }
      
      // Alternative pattern: extract city/location from hotel name (only if country not found)
      if (!destination) {
        // Extract hotel name and clean it up for city/location
        const pathMatch = parsedUrl.pathname.match(/\/hotel\/[a-z]{2}\/([\w-]+)\./);
        if (pathMatch) {
          const locationName = pathMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          // Try to clean up hotel names to get location (basic heuristic)
          const cleanLocation = locationName.replace(/Hotel|Resort|Inn|Lodge|Hostel/gi, '').trim();
          destination = cleanLocation || locationName;
        }
      }
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