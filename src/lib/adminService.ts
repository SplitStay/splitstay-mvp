import { z } from 'zod/v4-mini';
import type { Tables } from '../types/database.types';
import { supabase } from './supabase';

// Zod schemas for input validation
const TripIdSchema = z.uuid();

export type HiddenTrip = Tables<'hidden_trips'>;
export type AdminUser = Tables<'admin_users'>;

export interface AdminTripView extends Tables<'trip'> {
  isHidden: boolean;
  host?: { name: string | null; imageUrl: string | null } | null;
}

/**
 * Check if the current authenticated user is an admin
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('userId')
    .eq('userId', user.id)
    .single();

  // PGRST116 means no rows found - not an error, just not an admin
  if (error?.code === 'PGRST116') {
    return false;
  }

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return data !== null;
};

/**
 * Hide a trip from the public listing (admin only)
 */
export const hideTrip = async (tripId: string): Promise<void> => {
  // Validate input
  const parseResult = TripIdSchema.safeParse(tripId);
  if (!parseResult.success) {
    throw new Error('Invalid trip ID');
  }

  const { error } = await supabase
    .from('hidden_trips')
    .insert({ tripId })
    .select()
    .single();

  if (error) {
    // Duplicate key - trip already hidden
    if (error.code === '23505') {
      throw new Error('Trip is already hidden');
    }
    // Foreign key violation - trip doesn't exist
    if (error.code === '23503') {
      throw new Error('Trip not found');
    }
    // RLS policy violation - not an admin
    if (error.code === '42501') {
      throw new Error('Unauthorized: Admin access required');
    }
    // Generic error with safe message
    console.error('Error hiding trip:', error);
    throw new Error('Failed to hide trip. Please try again.');
  }
};

/**
 * Unhide a trip, restoring it to the public listing (admin only)
 */
export const unhideTrip = async (tripId: string): Promise<void> => {
  // Validate input
  const parseResult = TripIdSchema.safeParse(tripId);
  if (!parseResult.success) {
    throw new Error('Invalid trip ID');
  }

  const { error, count } = await supabase
    .from('hidden_trips')
    .delete()
    .eq('tripId', tripId);

  if (error) {
    // RLS policy violation - not an admin
    if (error.code === '42501') {
      throw new Error('Unauthorized: Admin access required');
    }
    console.error('Error unhiding trip:', error);
    throw new Error('Failed to unhide trip. Please try again.');
  }

  // Check if any row was deleted
  if (count === 0) {
    throw new Error('Trip is not hidden');
  }
};

/**
 * Get all trips with their hidden status for the admin view
 */
export const getAllTripsForAdmin = async (): Promise<AdminTripView[]> => {
  // Fetch all trips with host info
  const { data: trips, error: tripsError } = await supabase
    .from('trip')
    .select(
      `
      *,
      host:user!hostId(name, imageUrl)
    `,
    )
    .order('createdAt', { ascending: false });

  if (tripsError) {
    console.error('Error fetching trips:', tripsError);
    throw new Error('Failed to load trips. Please try again.');
  }

  // Fetch all hidden trip IDs
  const { data: hiddenTrips, error: hiddenError } = await supabase
    .from('hidden_trips')
    .select('tripId');

  if (hiddenError) {
    console.error('Error fetching hidden trips:', hiddenError);
    throw new Error('Failed to load trip status. Please try again.');
  }

  const hiddenTripIds = new Set(hiddenTrips?.map((ht) => ht.tripId) ?? []);

  // Merge the data
  return (trips ?? []).map((trip) => ({
    ...trip,
    isHidden: hiddenTripIds.has(trip.id),
  }));
};

/**
 * Check if a specific trip is hidden
 */
export const isTripHidden = async (tripId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('hidden_trips')
    .select('tripId')
    .eq('tripId', tripId)
    .single();

  // PGRST116 means no rows found - trip is not hidden
  if (error?.code === 'PGRST116') {
    return false;
  }

  if (error) {
    console.error('Error checking trip hidden status:', error);
    return false;
  }

  return data !== null;
};
