import { supabase } from './supabase';
import type { Tables, TablesInsert } from '../types/database.types';
import type { RoomConfiguration } from './accommodationService';

export interface TripFormData {
  // Step 1 - Destination & Dates
  name: string;
  location: string;
  flexible: boolean;
  startDate?: string | null;
  endDate?: string | null;
  estimatedMonth?: string | null;
  estimatedYear?: string | null;
  
  // Step 2 - Accommodation
  // accommodationTypeId is omitted to match generated Supabase types
  bookingUrl?: string | null;
  numberOfRooms: number;
  rooms: RoomConfiguration[];
  
  // Step 3 - Preferences
  vibe: string; // description/vibe
  matchWith: string;
  
  // Additional fields
  thumbnailUrl?: string | null;
}

export type Trip = Tables<'trip'>;
export type TripInsert = TablesInsert<'trip'>;

/**
 * Creates a new trip in the database
 */
export const createTrip = async (tripData: TripFormData): Promise<Trip> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a trip');
  }

  const tripInsert: TripInsert = {
    id: crypto.randomUUID(),
    name: tripData.name,
    description: tripData.vibe,
    location: tripData.location,
    hostId: user.id,
    bookingUrl: tripData.bookingUrl,
    numberOfRooms: tripData.numberOfRooms,
    rooms: tripData.rooms as any, // JSON type
    matchWith: tripData.matchWith,
    flexible: tripData.flexible,
    thumbnailUrl: tripData.thumbnailUrl,
    // Conditional date fields based on flexible flag
    ...(tripData.flexible ? {
      estimatedMonth: tripData.estimatedMonth,
      estimatedYear: tripData.estimatedYear,
      startDate: null,
      endDate: null,
    } : {
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      estimatedMonth: null,
      estimatedYear: null,
    })
  };

  const { data, error } = await supabase
    .from('trip')
    .insert(tripInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating trip:', error);
    throw new Error(`Failed to create trip: ${error.message}`);
  }

  return data;
};

/**
 * Updates an existing trip
 */
export const updateTrip = async (tripId: string, tripData: Partial<TripFormData>): Promise<Trip> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update a trip');
  }

  // Build update object
  const updateData: Partial<TripInsert> = {};
  
  if (tripData.name) updateData.name = tripData.name;
  if (tripData.vibe) updateData.description = tripData.vibe;
  if (tripData.location) updateData.location = tripData.location;
  if (tripData.bookingUrl !== undefined) updateData.bookingUrl = tripData.bookingUrl;
  if (tripData.numberOfRooms) updateData.numberOfRooms = tripData.numberOfRooms;
  if (tripData.rooms) updateData.rooms = tripData.rooms as any;
  if (tripData.matchWith) updateData.matchWith = tripData.matchWith;
  if (tripData.flexible !== undefined) updateData.flexible = tripData.flexible;
  if (tripData.thumbnailUrl !== undefined) updateData.thumbnailUrl = tripData.thumbnailUrl;

  // Handle date fields based on flexible flag
  if (tripData.flexible !== undefined) {
    if (tripData.flexible) {
      updateData.estimatedMonth = tripData.estimatedMonth;
      updateData.estimatedYear = tripData.estimatedYear;
      updateData.startDate = null;
      updateData.endDate = null;
    } else {
      updateData.startDate = tripData.startDate;
      updateData.endDate = tripData.endDate;
      updateData.estimatedMonth = null;
      updateData.estimatedYear = null;
    }
  }

  const { data, error } = await supabase
    .from('trip')
    .update(updateData)
    .eq('id', tripId)
    .eq('hostId', user.id) // Ensure user can only update their own trips
    .select()
    .single();

  if (error) {
    console.error('Error updating trip:', error);
    throw new Error(`Failed to update trip: ${error.message}`);
  }

  return data;
};

/**
 * Fetches a trip by ID
 */
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  const { data, error } = await supabase
    .from('trip')
    .select(`*`)
    .eq('id', tripId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Trip not found
    }
    console.error('Error fetching trip:', error);
    throw new Error(`Failed to fetch trip: ${error.message}`);
  }

  return data;
};

/**
 * Fetches trips for the current user (as host or joinee)
 */
export const getUserTrips = async (): Promise<Trip[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to fetch trips');
  }

  const { data, error } = await supabase
    .from('trip')
    .select(`*`)
    .or(`hostId.eq.${user.id},joineeId.eq.${user.id}`)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching user trips:', error);
    throw new Error(`Failed to fetch trips: ${error.message}`);
  }

  return data || [];
};

/**
 * Searches for public trips based on filters
 */
export const searchTrips = async (filters: {
  location?: string;
  flexible?: boolean;
  startDate?: string;
  endDate?: string;
  estimatedMonth?: string;
  estimatedYear?: string;
  accommodationTypeId?: string;
}): Promise<Trip[]> => {
  let query = supabase
    .from('trip')
    .select(`*`)
    .is('joineeId', null); // Only trips without a joinee

  // Apply filters
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters.accommodationTypeId) {
    query = query.eq('accommodationTypeId', filters.accommodationTypeId);
  }

  if (filters.flexible !== undefined) {
    query = query.eq('flexible', filters.flexible);
  }

  // Date-based filtering
  if (!filters.flexible && filters.startDate && filters.endDate) {
    query = query
      .gte('startDate', filters.startDate)
      .lte('endDate', filters.endDate);
  } else if (filters.flexible && filters.estimatedMonth && filters.estimatedYear) {
    query = query
      .eq('estimatedMonth', filters.estimatedMonth)
      .eq('estimatedYear', filters.estimatedYear);
  }

  const { data, error } = await query
    .order('createdAt', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error searching trips:', error);
    throw new Error(`Failed to search trips: ${error.message}`);
  }

  return data || [];
};

/**
 * Deletes a trip (only by the host)
 */
export const deleteTrip = async (tripId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete a trip');
  }

  const { error } = await supabase
    .from('trip')
    .delete()
    .eq('id', tripId)
    .eq('hostId', user.id); // Ensure user can only delete their own trips

  if (error) {
    console.error('Error deleting trip:', error);
    throw new Error(`Failed to delete trip: ${error.message}`);
  }
};
