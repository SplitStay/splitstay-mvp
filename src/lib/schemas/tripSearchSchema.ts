import { z } from 'zod';

/**
 * Schema for trip search filters passed to the searchTrips API.
 */
export const TripSearchFiltersSchema = z.object({
  location: z.string().optional(),
  flexible: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedMonth: z.string().optional(),
  estimatedYear: z.string().optional(),
  accommodationTypeId: z.string().optional(),
});

/**
 * Schema for user presence data from Supabase.
 */
export const UserPresenceRowSchema = z.object({
  user_id: z.string(),
  is_online: z.boolean().nullable(),
  last_active_at: z.string().nullable(),
});

/**
 * Parse user presence row safely.
 */
export const parseUserPresenceRow = (
  data: unknown,
): z.infer<typeof UserPresenceRowSchema> | null => {
  const result = UserPresenceRowSchema.safeParse(data);
  return result.success ? result.data : null;
};
