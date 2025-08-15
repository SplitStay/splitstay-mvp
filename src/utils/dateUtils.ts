/**
 * Utility functions for handling flexible vs exact dates
 */

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
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
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
    const startDate = new Date(trip.startDate);
    const now = new Date();
    return startDate >= now;
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
    const endDate = new Date(trip.endDate);
    const now = new Date();
    return endDate < now;
  }
  
  return false; // Default to not past if no date info
};
