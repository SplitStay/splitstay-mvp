import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { createSupabaseDbClient } from '../supabaseDb';

const createMockSupabase = (
  overrides: {
    fromResult?: { data: unknown; error: unknown };
    rpcResult?: { data: unknown; error: unknown };
  } = {},
) => {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi
      .fn()
      .mockResolvedValue(overrides.fromResult ?? { data: [], error: null }),
    maybeSingle: vi
      .fn()
      .mockResolvedValue(overrides.fromResult ?? { data: null, error: null }),
    insert: vi
      .fn()
      .mockResolvedValue(overrides.fromResult ?? { data: null, error: null }),
  };

  return {
    from: vi.fn().mockReturnValue(chainable),
    rpc: vi.fn().mockResolvedValue(
      overrides.rpcResult ?? {
        data: [{ allowed: true, retry_after_minutes: 0 }],
        error: null,
      },
    ),
    _chainable: chainable,
  } as unknown as SupabaseClient & { _chainable: typeof chainable };
};

describe('createSupabaseDbClient', () => {
  describe('checkSeenSid', () => {
    it('returns true when message SID exists', async () => {
      const supabase = createMockSupabase({
        fromResult: { data: { message_sid: 'SM123' }, error: null },
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.checkSeenSid('SM123');

      expect(result).toBe(true);
    });

    it('returns false when message SID does not exist', async () => {
      const supabase = createMockSupabase({
        fromResult: { data: null, error: null },
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.checkSeenSid('SM999');

      expect(result).toBe(false);
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        fromResult: { data: null, error: { message: 'DB error' } },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(db.checkSeenSid('SM123')).rejects.toEqual({
        message: 'DB error',
      });
    });
  });

  describe('markSidSeen', () => {
    it('inserts the message SID into whatsapp_seen_sid', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      await db.markSidSeen('SM123');

      expect(supabase.from).toHaveBeenCalledWith('whatsapp_seen_sid');
      expect(supabase._chainable.insert).toHaveBeenCalledWith({
        message_sid: 'SM123',
      });
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        fromResult: { data: null, error: { message: 'insert failed' } },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(db.markSidSeen('SM123')).rejects.toEqual({
        message: 'insert failed',
      });
    });
  });

  describe('checkRateLimit', () => {
    it('returns allowed status from RPC result', async () => {
      const supabase = createMockSupabase({
        rpcResult: {
          data: [{ allowed: true, retry_after_minutes: 0 }],
          error: null,
        },
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.checkRateLimit('+1234567890', 30, 3_600_000);

      expect(result).toEqual({ allowed: true, retryAfterMinutes: 0 });
    });

    it('returns retry minutes when rate limited', async () => {
      const supabase = createMockSupabase({
        rpcResult: {
          data: [{ allowed: false, retry_after_minutes: 15 }],
          error: null,
        },
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.checkRateLimit('+1234567890', 30, 3_600_000);

      expect(result).toEqual({ allowed: false, retryAfterMinutes: 15 });
    });

    it('throws when RPC returns an error', async () => {
      const supabase = createMockSupabase({
        rpcResult: { data: null, error: { message: 'RPC failed' } },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.checkRateLimit('+1234567890', 30, 3_600_000),
      ).rejects.toEqual({
        message: 'RPC failed',
      });
    });

    it('throws when RPC returns empty result', async () => {
      const supabase = createMockSupabase({
        rpcResult: { data: [], error: null },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.checkRateLimit('+1234567890', 30, 3_600_000),
      ).rejects.toThrow('Rate limit RPC returned no rows');
    });

    it('passes correct parameters to RPC', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      await db.checkRateLimit('whatsapp:+1234567890', 30, 3_600_000);

      expect(supabase.rpc).toHaveBeenCalledWith('check_rate_limit', {
        p_phone: 'whatsapp:+1234567890',
        p_max_messages: 30,
        p_window_ms: 3_600_000,
      });
    });
  });

  describe('getConversationHistory', () => {
    it('returns messages in chronological order after reversing descending query', async () => {
      const supabase = createMockSupabase();
      supabase._chainable.limit.mockResolvedValue({
        data: [
          { role: 'assistant', content: 'Reply' },
          { role: 'user', content: 'Hello' },
        ],
        error: null,
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.getConversationHistory('+1234567890', 50);

      expect(result).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Reply' },
      ]);
    });

    it('validates each row through ConversationMessageSchema', async () => {
      const supabase = createMockSupabase();
      supabase._chainable.limit.mockResolvedValue({
        data: [{ role: 'invalid_role', content: 'test' }],
        error: null,
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.getConversationHistory('+1234567890', 50),
      ).rejects.toThrow();
    });

    it('returns empty array when no history exists', async () => {
      const supabase = createMockSupabase();
      supabase._chainable.limit.mockResolvedValue({ data: [], error: null });
      const db = createSupabaseDbClient(supabase);

      const result = await db.getConversationHistory('+1234567890', 50);

      expect(result).toEqual([]);
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase();
      supabase._chainable.limit.mockResolvedValue({
        data: null,
        error: { message: 'query failed' },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.getConversationHistory('+1234567890', 50),
      ).rejects.toEqual({
        message: 'query failed',
      });
    });
  });

  describe('saveMessages', () => {
    it('maps messages to database rows with phone_number column', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      await db.saveMessages('whatsapp:+1234567890', [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ]);

      expect(supabase.from).toHaveBeenCalledWith('whatsapp_conversation');
      expect(supabase._chainable.insert).toHaveBeenCalledWith([
        {
          phone_number: 'whatsapp:+1234567890',
          role: 'user',
          content: 'Hello',
        },
        {
          phone_number: 'whatsapp:+1234567890',
          role: 'assistant',
          content: 'Hi there',
        },
      ]);
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        fromResult: { data: null, error: { message: 'insert failed' } },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.saveMessages('+1234567890', [{ role: 'user', content: 'Hello' }]),
      ).rejects.toEqual({ message: 'insert failed' });
    });
  });
});
