import { z } from 'zod';

export const TwilioWebhookSchema = z.object({
  MessageSid: z.string().min(1),
  From: z.string().min(1),
  Body: z.string(),
  NumMedia: z.string().optional(),
});

export type TwilioWebhook = z.infer<typeof TwilioWebhookSchema>;

export const ConversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
