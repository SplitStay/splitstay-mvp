import { z } from 'zod';

/**
 * Schema for message action data in guest mode.
 */
export const MessageActionDataSchema = z.object({
  recipientId: z.string(),
  content: z.string().optional(),
});

/**
 * Schema for create trip action data in guest mode.
 */
export const CreateTripActionDataSchema = z.object({
  // Trip data to be created after auth
});

/**
 * Schema for join trip action data in guest mode.
 */
export const JoinTripActionDataSchema = z.object({
  tripId: z.string(),
  message: z.string().optional(),
});

/**
 * Schema for pending actions stored when a guest tries to perform
 * an authenticated action. Discriminated union based on action type.
 */
export const PendingActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('message'),
    data: MessageActionDataSchema.optional(),
    redirectTo: z.string().optional(),
  }),
  z.object({
    type: z.literal('create_trip'),
    data: CreateTripActionDataSchema.optional(),
    redirectTo: z.string().optional(),
  }),
  z.object({
    type: z.literal('join_trip'),
    data: JoinTripActionDataSchema.optional(),
    redirectTo: z.string().optional(),
  }),
]);

/**
 * Parse pending action from localStorage safely.
 */
export const parsePendingAction = (
  data: unknown,
): z.infer<typeof PendingActionSchema> | null => {
  const result = PendingActionSchema.safeParse(data);
  return result.success ? result.data : null;
};

/**
 * Parse pending action from localStorage JSON string.
 */
export const parsePendingActionFromStorage = (
  json: string | null,
): z.infer<typeof PendingActionSchema> | null => {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return parsePendingAction(parsed);
  } catch {
    return null;
  }
};
