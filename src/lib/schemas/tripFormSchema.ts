import { z } from 'zod';
import { RoomConfigurationSchema } from './roomSchema';

/**
 * Schema for trip form data used in the multi-step trip creation flow.
 */
export const TripFormDataSchema = z.object({
  // Step 1: Destination
  name: z.string().min(1),
  location: z.string().min(1),
  flexible: z.boolean(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  estimatedMonth: z.string().nullable().optional(),
  estimatedYear: z.string().nullable().optional(),

  // Step 2: Accommodation
  accommodationTypeId: z.string().optional(),
  bookingUrl: z.string().nullable().optional(),
  numberOfRooms: z.number().min(1).max(10),
  rooms: z.array(RoomConfigurationSchema),

  // Step 3: Preferences
  vibe: z.string(),
  matchWith: z.string(),
  isPublic: z.boolean().optional(),

  // Optional
  thumbnailUrl: z.string().nullable().optional(),
});

/**
 * Schema for partial trip form data (used during multi-step form).
 * All fields are optional to allow incremental updates.
 */
export const PartialTripFormDataSchema = TripFormDataSchema.partial();

/**
 * Initial empty trip form data for starting a new trip.
 */
export const createEmptyTripFormData = (): z.infer<
  typeof PartialTripFormDataSchema
> => ({
  name: '',
  location: '',
  flexible: true,
  numberOfRooms: 3,
  rooms: [],
  vibe: '',
  matchWith: '',
  isPublic: true,
});

/**
 * Validate trip form data, returning errors if invalid.
 */
export const validateTripFormData = (
  data: unknown,
):
  | { success: true; data: z.infer<typeof TripFormDataSchema> }
  | { success: false; error: z.ZodError } => {
  const result = TripFormDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
};
