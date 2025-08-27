/**
 * Utility functions for handling flexible vs exact dates
 */

/**
 * Parse a date string (YYYY-MM-DD) as a local date to avoid timezone issues
 */
export const parseLocalDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Format a date as YYYY-MM-DD in local timezone
 */
export const formatDateForStorage = (date: Date | null): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTripDate = (trip: {
  flexible?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  estimatedMonth?: string | null;
  estimatedYear?: string | null;
}): string => {
  if (trip.flexible) {
    if (trip.estimatedMonth && trip.estimatedYear) {
      return `${trip.estimatedMonth} ${trip.estimatedYear}`;
    }
    return 'Dates TBD';
  }
  
  if (trip.startDate && trip.endDate) {
    const start = parseLocalDate(trip.startDate);
    const end = parseLocalDate(trip.endDate);
    
    if (start && end) {
      const startFormatted = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      const endFormatted = end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      return `${startFormatted} - ${endFormatted}`;
    }
  }
  
  return 'Dates TBD';
};

export const getTripDateBadgeText = (trip: {
  flexible?: boolean;
  estimatedMonth?: string | null;
  estimatedYear?: string | null;
}): string | null => {
  if (trip.flexible) {
    if (trip.estimatedMonth && trip.estimatedYear) {
      return `Planned for ${trip.estimatedMonth} ${trip.estimatedYear}`;
    }
    return 'Dates TBD';
  }
  return null;
};

export const isUpcomingTrip = (trip: {
  flexible?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  estimatedYear?: string | null;
}): boolean => {
  if (trip.flexible) {
    // For flexible trips, consider them upcoming if estimated year is current or future
    if (trip.estimatedYear) {
      const estimatedYear = parseInt(trip.estimatedYear);
      const currentYear = new Date().getFullYear();
      return estimatedYear >= currentYear;
    }
    return true; // Default to upcoming for flexible trips without year
  }
  
  if (trip.startDate) {
    const startDate = parseLocalDate(trip.startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare dates only, not times
    return startDate ? startDate >= now : true;
  }
  
  return true; // Default to upcoming if no date info
};

export const isPastTrip = (trip: {
  flexible?: boolean;
  endDate?: string | null;
  estimatedYear?: string | null;
}): boolean => {
  if (trip.flexible) {
    // For flexible trips, consider them past if estimated year is before current year
    if (trip.estimatedYear) {
      const estimatedYear = parseInt(trip.estimatedYear);
      const currentYear = new Date().getFullYear();
      return estimatedYear < currentYear;
    }
    return false; // Default to not past for flexible trips without year
  }
  
  if (trip.endDate) {
    const endDate = parseLocalDate(trip.endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare dates only, not times
    return endDate ? endDate < now : false;
  }
  
  return false; // Default to not past if no date info
};
