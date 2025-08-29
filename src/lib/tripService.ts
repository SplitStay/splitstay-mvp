import { supabase } from './supabase';
import type { Tables, TablesInsert } from '../types/database.types';
import type { RoomConfiguration } from './accommodationService';

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

export type Trip = Tables<'trip'>;
export type TripInsert = TablesInsert<'trip'>;

export const createTrip = async (tripData: TripFormData): Promise<Trip> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a trip');
  }

  const tripInsert: any = {
    id: crypto.randomUUID(),
    name: tripData.name,
    description: tripData.vibe,
    location: tripData.location,
    hostId: user.id,
    bookingUrl: tripData.bookingUrl,
    numberofrooms: tripData.numberOfRooms,
    rooms: tripData.rooms as any,
    matchwith: tripData.matchWith,
    flexible: tripData.flexible,
    ispublic: tripData.isPublic ?? true,
    thumbnailUrl: tripData.thumbnailUrl,
    ...(tripData.flexible ? {
      estimatedmonth: tripData.estimatedMonth,
      estimatedyear: tripData.estimatedYear,
      startDate: null,
      endDate: null,
    } : {
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      estimatedmonth: null,
      estimatedyear: null,
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

export const updateTrip = async (tripId: string, tripData: any): Promise<Trip> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update a trip');
  }

  const updateData: any = {};
  
  if (tripData.name) updateData.name = tripData.name;
  if (tripData.description) updateData.description = tripData.description;
  if (tripData.vibe) updateData.description = tripData.vibe;
  if (tripData.location) updateData.location = tripData.location;
  if (tripData.bookingUrl !== undefined) updateData.bookingUrl = tripData.bookingUrl;
  if (tripData.numberofrooms !== undefined) updateData.numberofrooms = tripData.numberofrooms;
  if (tripData.numberOfRooms !== undefined) updateData.numberofrooms = tripData.numberOfRooms;
  if (tripData.rooms) updateData.rooms = tripData.rooms as any;
  if (tripData.matchwith !== undefined) updateData.matchwith = tripData.matchwith;
  if (tripData.matchWith !== undefined) updateData.matchwith = tripData.matchWith;
  if (tripData.flexible !== undefined) updateData.flexible = tripData.flexible;
  if (tripData.thumbnailUrl !== undefined) updateData.thumbnailUrl = tripData.thumbnailUrl;
  if (tripData.ispublic !== undefined) updateData.ispublic = tripData.ispublic;
  if (tripData.isPublic !== undefined) updateData.ispublic = tripData.isPublic;

  if (tripData.flexible !== undefined) {
    if (tripData.flexible) {
      updateData.estimatedmonth = tripData.estimatedmonth || tripData.estimatedMonth;
      updateData.estimatedyear = tripData.estimatedyear || tripData.estimatedYear;
      updateData.startDate = null;
      updateData.endDate = null;
    } else {
      updateData.startDate = tripData.startDate;
      updateData.endDate = tripData.endDate;
      updateData.estimatedmonth = null;
      updateData.estimatedyear = null;
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

export const getTripById = async (tripId: string): Promise<Trip | null> => {
  const { data, error } = await supabase
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

  return data;
};

export const getUserTrips = async (): Promise<Trip[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to fetch trips');
  }

  const { data, error } = await supabase
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

  return data || [];
};

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
  } else if (filters.flexible && filters.estimatedMonth && filters.estimatedYear) {
    query = query
      .eq('estimatedmonth', filters.estimatedMonth)
      .eq('estimatedyear', filters.estimatedYear);
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

export const deleteTrip = async (tripId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
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
