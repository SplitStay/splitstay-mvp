import { z } from 'zod';

/**
 * Valid bed types for room configuration.
 */
export const BedTypeSchema = z.enum([
  'Single Bed',
  'Double Bed',
  'Queen Bed',
  'King Bed',
  'Twin Bed',
  'Sofa Bed',
  'Bunk Bed',
]);

/**
 * Schema for a single room configuration.
 */
export const RoomConfigurationSchema = z.object({
  id: z.number(),
  numberOfBeds: z.number().min(1).max(10),
  bedType: BedTypeSchema,
  ensuiteBathroom: z.boolean(),
});

/**
 * Schema for the rooms JSON column (array of room configurations).
 */
export const RoomsArraySchema = z.array(RoomConfigurationSchema).nullable();

/**
 * Parse rooms JSON column safely, returning null for invalid data.
 */
export const parseRooms = (data: unknown): z.infer<typeof RoomsArraySchema> => {
  const result = RoomsArraySchema.safeParse(data);
  return result.success ? result.data : null;
};

/**
 * Get rooms array, defaulting to empty array.
 */
export const getRoomsOrEmpty = (
  data: unknown,
): z.infer<typeof RoomConfigurationSchema>[] => {
  return parseRooms(data) ?? [];
};
