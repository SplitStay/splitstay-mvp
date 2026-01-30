import type { z } from 'zod';
import type { TablesInsert } from '../types/database.types';
import type { RoomConfiguration } from './accommodationService';
import { type TripSchema, TripWithRelationsSchema } from './schemas/tripSchema';
import { supabase } from './supabase';

export interface TripFormData {
  name: string;
  location: string;
  flexible: boolean;
  startDate?: string | null;
  endDate?: string | null;
  estimatedMonth?: string | null;
  estimatedYear?: string | null;

  bookingUrl?: string | null;
  numberOfRooms: number;
  rooms: RoomConfiguration[];

  vibe: string;
  matchWith: string;
  isPublic?: boolean;

  thumbnailUrl?: string | null;
}

export type Trip = z.infer<typeof TripSchema>;
export type TripInsert = TablesInsert<'trip'>;

export type TripWithHiddenStatus = z.infer<typeof TripWithRelationsSchema> & {
  isHiddenByAdmin: boolean;
};

export const createTrip = async (tripData: TripFormData): Promise<Trip> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create a trip');
  }

  // biome-ignore lint/suspicious/noExplicitAny: Dynamic trip data construction
  const tripInsert: any = {
    id: crypto.randomUUID(),
    name: tripData.name,
    description: tripData.vibe,
    location: tripData.location,
    hostId: user.id,
    bookingUrl: tripData.bookingUrl,
    numberOfRooms: tripData.numberOfRooms,
    // biome-ignore lint/suspicious/noExplicitAny: Supabase JSON column
    rooms: tripData.rooms as any,
    matchWith: tripData.matchWith,
    flexible: tripData.flexible,
    isPublic: tripData.isPublic ?? true,
    thumbnailUrl: tripData.thumbnailUrl,
    ...(tripData.flexible
      ? {
          estimatedMonth: tripData.estimatedMonth,
          estimatedYear: tripData.estimatedYear,
          startDate: null,
          endDate: null,
        }
      : {
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          estimatedMonth: null,
          estimatedYear: null,
        }),
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

export const updateTrip = async (
  tripId: string,
  // biome-ignore lint/suspicious/noExplicitAny: Partial trip update data
  tripData: any,
): Promise<Trip> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to update a trip');
  }

  // biome-ignore lint/suspicious/noExplicitAny: Dynamic update object construction
  const updateData: any = {};

  if (tripData.name) updateData.name = tripData.name;
  if (tripData.description) updateData.description = tripData.description;
  if (tripData.vibe) updateData.description = tripData.vibe;
  if (tripData.location) updateData.location = tripData.location;
  if (tripData.bookingUrl !== undefined)
    updateData.bookingUrl = tripData.bookingUrl;
  if (tripData.numberOfRooms !== undefined)
    updateData.numberOfRooms = tripData.numberOfRooms;
  // biome-ignore lint/suspicious/noExplicitAny: Supabase JSON column
  if (tripData.rooms) updateData.rooms = tripData.rooms as any;
  if (tripData.matchWith !== undefined)
    updateData.matchWith = tripData.matchWith;
  if (tripData.flexible !== undefined) updateData.flexible = tripData.flexible;
  if (tripData.thumbnailUrl !== undefined)
    updateData.thumbnailUrl = tripData.thumbnailUrl;
  if (tripData.isPublic !== undefined) updateData.isPublic = tripData.isPublic;

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
    .eq('hostId', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating trip:', error);
    throw new Error(`Failed to update trip: ${error.message}`);
  }

  return data;
};

/**
 * Get a trip by ID. Returns null if trip is hidden and user is not the owner.
 */
export const getTripById = async (
  tripId: string,
): Promise<TripWithHiddenStatus | null> => {
  // Fetch the trip
  const { data: trip, error } = await supabase
    .from('trip')
    .select(`
      *,
      host:user!hostId(name, imageUrl),
      joinee:user!joineeId(name, imageUrl),
      accommodation_type(name)
    `)
    .eq('id', tripId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching trip:', error);
    throw new Error(`Failed to fetch trip: ${error.message}`);
  }

  // Check if trip is hidden
  const { data: hiddenData, error: hiddenError } = await supabase
    .from('hidden_trips')
    .select('tripId')
    .eq('tripId', tripId)
    .single();

  const isHidden = hiddenError?.code !== 'PGRST116' && hiddenData !== null;

  // If hidden, check if current user is the owner
  if (isHidden) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isOwner = user?.id === trip.hostId;

    if (!isOwner) {
      // Hidden trip and not the owner - return null (not found)
      return null;
    }
  }

  const parsedTrip = TripWithRelationsSchema.parse(trip);
  return {
    ...parsedTrip,
    isHiddenByAdmin: isHidden,
  };
};

/**
 * Get all trips for the current user (as host or joinee), including hidden status.
 */
export const getUserTrips = async (): Promise<TripWithHiddenStatus[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to fetch trips');
  }

  const { data: trips, error } = await supabase
    .from('trip')
    .select(`
      *,
      host:user!hostId(name, imageUrl),
      joinee:user!joineeId(name, imageUrl),
      accommodation_type(name)
    `)
    .or(`hostId.eq.${user.id},joineeId.eq.${user.id}`)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching user trips:', error);
    throw new Error(`Failed to fetch trips: ${error.message}`);
  }

  // Fetch hidden trips to determine status
  const { data: hiddenTrips } = await supabase
    .from('hidden_trips')
    .select('tripId');

  const hiddenTripIds = new Set(hiddenTrips?.map((ht) => ht.tripId) ?? []);

  return (trips ?? []).map((trip) => {
    const parsedTrip = TripWithRelationsSchema.parse(trip);
    return {
      ...parsedTrip,
      isHiddenByAdmin: hiddenTripIds.has(parsedTrip.id),
    };
  });
};

/**
 * Search for trips. Uses searchable_trips view to exclude hidden trips.
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
  // Use searchable_trips view which excludes hidden trips
  let query = supabase
    .from('searchable_trips')
    .select(`
      *,
      host:user!hostId(name, imageUrl),
      joinee:user!joineeId(name, imageUrl),
      accommodation_type(name)
    `)
    .is('joineeId', null);

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters.accommodationTypeId) {
    query = query.eq('accommodationTypeId', filters.accommodationTypeId);
  }

  if (filters.flexible !== undefined) {
    query = query.eq('flexible', filters.flexible);
  }

  if (!filters.flexible && filters.startDate && filters.endDate) {
    query = query
      .gte('startDate', filters.startDate)
      .lte('endDate', filters.endDate);
  } else if (
    filters.flexible &&
    filters.estimatedMonth &&
    filters.estimatedYear
  ) {
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

  return (data ?? []).map((trip) => TripWithRelationsSchema.parse(trip));
};

export const deleteTrip = async (tripId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to delete a trip');
  }

  const { error } = await supabase
    .from('trip')
    .delete()
    .eq('id', tripId)
    .eq('hostId', user.id);

  if (error) {
    console.error('Error deleting trip:', error);
    throw new Error(`Failed to delete trip: ${error.message}`);
  }
};
