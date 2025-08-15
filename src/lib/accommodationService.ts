import { supabase } from './supabase';

export interface AccommodationType {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomConfiguration {
  id: number;
  numberOfBeds: number;
  bedType: string;
  ensuiteBathroom: boolean;
}

export const BED_TYPES = [
  'Single Bed',
  'Double Bed', 
  'Queen Bed',
  'King Bed',
  'Twin Bed',
  'Sofa Bed',
  'Bunk Bed'
] as const;

export type BedType = typeof BED_TYPES[number];

/**
 * Fetches all accommodation types from the database
 */
export const getAccommodationTypes = async (): Promise<AccommodationType[]> => {
  const { data, error } = await supabase
    .from('accommodation_type')
    .select('*')
    .order('displayOrder', { ascending: true });

  if (error) {
    console.error('Error fetching accommodation types:', error);
    throw new Error('Failed to fetch accommodation types');
  }

  return data || [];
};

/**
 * Creates a default room configuration based on number of rooms
 */
export const createDefaultRooms = (numberOfRooms: number): RoomConfiguration[] => {
  return Array.from({ length: numberOfRooms }, (_, index) => ({
    id: index + 1,
    numberOfBeds: index === 0 ? 2 : 1, // First room has 2 beds, others have 1
    bedType: 'Double Bed' as BedType,
    ensuiteBathroom: index === 0 // Only first room has ensuite by default
  }));
};

/**
 * Validates room configuration data
 */
export const validateRoomConfiguration = (rooms: RoomConfiguration[]): string | null => {
  if (!rooms || rooms.length === 0) {
    return 'At least one room is required';
  }

  for (const room of rooms) {
    if (!room.numberOfBeds || room.numberOfBeds < 1 || room.numberOfBeds > 10) {
      return `Room ${room.id}: Number of beds must be between 1 and 10`;
    }
    
    if (!room.bedType || !BED_TYPES.includes(room.bedType as BedType)) {
      return `Room ${room.id}: Invalid bed type`;
    }
  }

  return null; // No validation errors
};
