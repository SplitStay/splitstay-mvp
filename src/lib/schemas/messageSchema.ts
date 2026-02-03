import { z } from 'zod';

/**
 * Schema for file attachment metadata in messages.
 */
export const MessageFileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string().url(),
  path: z.string(),
});

/**
 * Schema for emoji reactions on messages.
 * Maps emoji string to array of user IDs who reacted.
 */
export const MessageReactionsSchema = z.record(z.string(), z.array(z.string()));

/**
 * Schema for message metadata JSON column.
 * Contains optional file attachments and emoji reactions.
 */
export const MessageMetadataSchema = z
  .object({
    file: MessageFileSchema.optional(),
    reactions: MessageReactionsSchema.optional(),
  })
  .nullable();

/**
 * Parse message metadata safely, returning null for invalid data.
 */
export const parseMessageMetadata = (
  data: unknown,
): z.infer<typeof MessageMetadataSchema> => {
  const result = MessageMetadataSchema.safeParse(data);
  return result.success ? result.data : null;
};

/**
 * Check if metadata has a file attachment.
 */
export const hasFileAttachment = (
  metadata: z.infer<typeof MessageMetadataSchema>,
): metadata is {
  file: z.infer<typeof MessageFileSchema>;
  reactions?: z.infer<typeof MessageReactionsSchema>;
} => {
  return metadata !== null && metadata.file !== undefined;
};

/**
 * Get reactions from metadata, defaulting to empty object.
 */
export const getReactions = (
  metadata: z.infer<typeof MessageMetadataSchema>,
): z.infer<typeof MessageReactionsSchema> => {
  return metadata?.reactions ?? {};
};
