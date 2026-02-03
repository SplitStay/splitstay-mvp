import type { z } from 'zod';
import {
  publicConversationsRowSchema,
  publicMessageReadStatusRowSchema,
  publicMessagesRowSchema,
  publicUserPresenceRowSchema,
} from './database.schemas';

/**
 * Schema for message realtime payload (INSERT/UPDATE events).
 * Uses the generated database schema for the messages table.
 */
export const MessageRealtimePayloadSchema = publicMessagesRowSchema;

/**
 * Schema for user presence realtime payload.
 */
export const UserPresenceRealtimePayloadSchema = publicUserPresenceRowSchema;

/**
 * Schema for message read status realtime payload.
 */
export const MessageReadStatusRealtimePayloadSchema =
  publicMessageReadStatusRowSchema;

/**
 * Schema for conversation realtime payload.
 */
export const ConversationRealtimePayloadSchema = publicConversationsRowSchema;

/**
 * Parse message realtime payload safely.
 */
export const parseMessagePayload = (
  data: unknown,
): z.infer<typeof MessageRealtimePayloadSchema> | null => {
  const result = MessageRealtimePayloadSchema.safeParse(data);
  return result.success ? result.data : null;
};

/**
 * Parse user presence realtime payload safely.
 */
export const parseUserPresencePayload = (
  data: unknown,
): z.infer<typeof UserPresenceRealtimePayloadSchema> | null => {
  const result = UserPresenceRealtimePayloadSchema.safeParse(data);
  return result.success ? result.data : null;
};

/**
 * Parse message read status realtime payload safely.
 */
export const parseMessageReadStatusPayload = (
  data: unknown,
): z.infer<typeof MessageReadStatusRealtimePayloadSchema> | null => {
  const result = MessageReadStatusRealtimePayloadSchema.safeParse(data);
  return result.success ? result.data : null;
};

/**
 * Parse conversation realtime payload safely.
 */
export const parseConversationPayload = (
  data: unknown,
): z.infer<typeof ConversationRealtimePayloadSchema> | null => {
  const result = ConversationRealtimePayloadSchema.safeParse(data);
  return result.success ? result.data : null;
};
