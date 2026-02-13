import { z } from 'zod';

/**
 * Single source of truth for accommodation types.
 *
 * These values are used to:
 * 1. Generate supabase/seed.sql via scripts/generate-seed.ts
 * 2. Provide valid accommodation type IDs for test data generators
 *
 * Using Zod literal schema ensures:
 * - Compile-time type checking
 * - Runtime validation that prevents invalid data
 * - Explicit enumeration of all valid values
 */

/** Schema for a single accommodation type with literal id values */
const accommodationTypeSchema = z.union([
  z.object({
    id: z.literal('hostel-room'),
    name: z.literal('Hostel Room'),
    displayOrder: z.literal(1),
  }),
  z.object({
    id: z.literal('hotel-room'),
    name: z.literal('Hotel Room'),
    displayOrder: z.literal(2),
  }),
  z.object({
    id: z.literal('apartment'),
    name: z.literal('Apartment'),
    displayOrder: z.literal(3),
  }),
  z.object({
    id: z.literal('house'),
    name: z.literal('House'),
    displayOrder: z.literal(4),
  }),
  z.object({
    id: z.literal('cottage'),
    name: z.literal('Cottage'),
    displayOrder: z.literal(5),
  }),
  z.object({
    id: z.literal('villa'),
    name: z.literal('Villa'),
    displayOrder: z.literal(6),
  }),
  z.object({
    id: z.literal('bungalow'),
    name: z.literal('Bungalow'),
    displayOrder: z.literal(7),
  }),
  z.object({
    id: z.literal('farmhouse'),
    name: z.literal('Farmhouse'),
    displayOrder: z.literal(8),
  }),
  z.object({
    id: z.literal('cabin'),
    name: z.literal('Cabin'),
    displayOrder: z.literal(9),
  }),
  z.object({
    id: z.literal('townhouse'),
    name: z.literal('Townhouse'),
    displayOrder: z.literal(10),
  }),
  z.object({
    id: z.literal('chalet'),
    name: z.literal('Chalet'),
    displayOrder: z.literal(11),
  }),
]);

/** Schema for the complete array of accommodation types with validation */
export const accommodationTypesSchema = z
  .array(accommodationTypeSchema)
  .refine((arr) => arr.length > 0, {
    message: 'Accommodation types array cannot be empty',
  });

export type AccommodationType = z.infer<typeof accommodationTypeSchema>;

/**
 * The canonical list of accommodation types.
 *
 * This is the single source of truth. The seed.sql file is generated
 * from this data, eliminating dual maintenance.
 */
export const ACCOMMODATION_TYPES: AccommodationType[] = [
  { id: 'hostel-room', name: 'Hostel Room', displayOrder: 1 },
  { id: 'hotel-room', name: 'Hotel Room', displayOrder: 2 },
  { id: 'apartment', name: 'Apartment', displayOrder: 3 },
  { id: 'house', name: 'House', displayOrder: 4 },
  { id: 'cottage', name: 'Cottage', displayOrder: 5 },
  { id: 'villa', name: 'Villa', displayOrder: 6 },
  { id: 'bungalow', name: 'Bungalow', displayOrder: 7 },
  { id: 'farmhouse', name: 'Farmhouse', displayOrder: 8 },
  { id: 'cabin', name: 'Cabin', displayOrder: 9 },
  { id: 'townhouse', name: 'Townhouse', displayOrder: 10 },
  { id: 'chalet', name: 'Chalet', displayOrder: 11 },
];

// Validate at module load time to catch errors early
accommodationTypesSchema.parse(ACCOMMODATION_TYPES);
