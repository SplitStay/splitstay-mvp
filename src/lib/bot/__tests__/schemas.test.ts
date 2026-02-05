import { describe, expect, it } from 'vitest';
import { ConversationMessageSchema, TwilioWebhookSchema } from '../schemas';

describe('TwilioWebhookSchema', () => {
  it('parses a valid Twilio webhook payload', () => {
    const payload = {
      MessageSid: 'SM123',
      From: 'whatsapp:+1234567890',
      Body: 'Hello',
    };

    expect(() => TwilioWebhookSchema.parse(payload)).not.toThrow();
  });

  it('rejects a payload missing MessageSid', () => {
    const payload = {
      From: 'whatsapp:+1234567890',
      Body: 'Hello',
    };

    expect(() => TwilioWebhookSchema.parse(payload)).toThrow();
  });

  it('rejects a payload with empty From', () => {
    const payload = {
      MessageSid: 'SM123',
      From: '',
      Body: 'Hello',
    };

    expect(() => TwilioWebhookSchema.parse(payload)).toThrow();
  });

  it('accepts a payload with empty Body', () => {
    const payload = {
      MessageSid: 'SM123',
      From: 'whatsapp:+1234567890',
      Body: '',
    };

    expect(() => TwilioWebhookSchema.parse(payload)).not.toThrow();
  });

  it('accepts a payload with optional NumMedia', () => {
    const payload = {
      MessageSid: 'SM123',
      From: 'whatsapp:+1234567890',
      Body: 'Hello',
      NumMedia: '1',
    };

    const result = TwilioWebhookSchema.parse(payload);
    expect(result.NumMedia).toBe('1');
  });
});

describe('ConversationMessageSchema', () => {
  it('accepts valid roles', () => {
    for (const role of ['user', 'assistant', 'system'] as const) {
      expect(() =>
        ConversationMessageSchema.parse({ role, content: 'test' }),
      ).not.toThrow();
    }
  });

  it('rejects invalid roles', () => {
    expect(() =>
      ConversationMessageSchema.parse({ role: 'admin', content: 'test' }),
    ).toThrow();
  });
});
