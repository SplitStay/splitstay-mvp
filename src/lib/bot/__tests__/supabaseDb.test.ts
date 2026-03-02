import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { createSupabaseDbClient } from '../supabaseDb';

type ChainableOverrides = {
  maybeSingle?: { data: unknown; error: unknown };
  limit?: { data: unknown; error: unknown };
  insert?: { data: unknown; error: unknown };
  gte?: { count: unknown; error: unknown };
};

const createMockSupabase = (
  overrides: {
    tables?: Partial<Record<string, ChainableOverrides>>;
    rpcResult?: { data: unknown; error: unknown };
  } = {},
) => {
  const chainables: Record<string, Record<string, unknown>> = {};

  const getChainable = (table: string) => {
    if (!chainables[table]) {
      const t = overrides.tables?.[table] ?? {};
      chainables[table] = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue(t.gte ?? { count: 0, error: null }),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(t.limit ?? { data: [], error: null }),
        maybeSingle: vi
          .fn()
          .mockResolvedValue(t.maybeSingle ?? { data: null, error: null }),
        insert: vi
          .fn()
          .mockResolvedValue(t.insert ?? { data: null, error: null }),
      };
    }
    return chainables[table];
  };

  return {
    from: vi.fn((table: string) => getChainable(table)),
    rpc: vi.fn().mockResolvedValue(
      overrides.rpcResult ?? {
        data: [{ allowed: true, retry_after_minutes: 0 }],
        error: null,
      },
    ),
  } as unknown as SupabaseClient;
};

describe('createSupabaseDbClient', () => {
  describe('checkSeenSid', () => {
    it('returns true when message SID exists', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_seen_sid: {
            maybeSingle: { data: { message_sid: 'SM123' }, error: null },
          },
        },
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.checkSeenSid('SM123');

      expect(result).toBe(true);
    });

    it('returns false when message SID does not exist', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      const result = await db.checkSeenSid('SM999');

      expect(result).toBe(false);
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_seen_sid: {
            maybeSingle: { data: null, error: { message: 'DB error' } },
          },
        },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(db.checkSeenSid('SM123')).rejects.toEqual({
        message: 'DB error',
      });
    });
  });

  describe('markSidSeen', () => {
    it('resolves without error on success', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      await expect(db.markSidSeen('SM123')).resolves.toBeUndefined();
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_seen_sid: {
            insert: { data: null, error: { message: 'insert failed' } },
          },
        },
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
  });

  describe('getConversationHistory', () => {
    it('returns messages in chronological order after reversing descending query', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_conversation: {
            limit: {
              data: [
                { role: 'assistant', content: 'Reply' },
                { role: 'user', content: 'Hello' },
              ],
              error: null,
            },
          },
        },
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.getConversationHistory('+1234567890', 50);

      expect(result).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Reply' },
      ]);
    });

    it('validates each row through ConversationMessageSchema', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_conversation: {
            limit: {
              data: [{ role: 'invalid_role', content: 'test' }],
              error: null,
            },
          },
        },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.getConversationHistory('+1234567890', 50),
      ).rejects.toThrow();
    });

    it('returns empty array when no history exists', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      const result = await db.getConversationHistory('+1234567890', 50);

      expect(result).toEqual([]);
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_conversation: {
            limit: { data: null, error: { message: 'query failed' } },
          },
        },
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
    it('resolves without error on success', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.saveMessages('whatsapp:+1234567890', [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
        ]),
      ).resolves.toBeUndefined();
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_conversation: {
            insert: { data: null, error: { message: 'insert failed' } },
          },
        },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.saveMessages('+1234567890', [{ role: 'user', content: 'Hello' }]),
      ).rejects.toEqual({ message: 'insert failed' });
    });
  });

  describe('saveFlaggedContent', () => {
    it('resolves without error on success', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.saveFlaggedContent(
          'whatsapp:+1234567890',
          'flagged text',
          'system_prompt_disclosure',
        ),
      ).resolves.toBeUndefined();
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_flagged_content: {
            insert: { data: null, error: { message: 'insert failed' } },
          },
        },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.saveFlaggedContent('+1234567890', 'text', 'reason'),
      ).rejects.toEqual({ message: 'insert failed' });
    });
  });

  describe('countRecentFlags', () => {
    it('returns count of recent flags for a phone number', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_flagged_content: { gte: { count: 3, error: null } },
        },
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.countRecentFlags('+1234567890', 3_600_000);

      expect(result).toBe(3);
    });

    it('returns zero when no flags exist', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      const result = await db.countRecentFlags('+1234567890', 3_600_000);

      expect(result).toBe(0);
    });

    it('throws when Supabase returns an error', async () => {
      const supabase = createMockSupabase({
        tables: {
          whatsapp_flagged_content: {
            gte: { count: null, error: { message: 'query failed' } },
          },
        },
      });
      const db = createSupabaseDbClient(supabase);

      await expect(
        db.countRecentFlags('+1234567890', 3_600_000),
      ).rejects.toEqual({ message: 'query failed' });
    });
  });

  describe('findUserByPhone', () => {
    it('queries the whatsapp column to find users by phone number', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      await db.findUserByPhone('whatsapp:+1234567890');

      const userChain = (supabase.from as ReturnType<typeof vi.fn>).mock.results
        .filter(
          (_r: unknown, i: number) =>
            (supabase.from as ReturnType<typeof vi.fn>).mock.calls[i][0] ===
            'user',
        )
        .map(
          (r: { value: Record<string, ReturnType<typeof vi.fn>> }) => r.value,
        );
      expect(userChain.length).toBeGreaterThan(0);
      expect(userChain[0].eq).toHaveBeenCalledWith('whatsapp', '+1234567890');
    });

    it('selects the name column instead of first_name', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      await db.findUserByPhone('whatsapp:+1234567890');

      const userChain = (supabase.from as ReturnType<typeof vi.fn>).mock.results
        .filter(
          (_r: unknown, i: number) =>
            (supabase.from as ReturnType<typeof vi.fn>).mock.calls[i][0] ===
            'user',
        )
        .map(
          (r: { value: Record<string, ReturnType<typeof vi.fn>> }) => r.value,
        );
      expect(userChain.length).toBeGreaterThan(0);
      const selectArg = userChain[0].select.mock.calls[0][0] as string;
      expect(selectArg).toContain('name');
      expect(selectArg).not.toContain('first_name');
    });

    it('maps the name field to displayName in the result', async () => {
      const supabase = createMockSupabase({
        tables: {
          user: {
            maybeSingle: {
              data: {
                id: 'user-1',
                name: 'Tommy',
                match_pref_language: 'dont_care',
                match_pref_travel_traits: 'dont_care',
                match_pref_age: 'dont_care',
                match_pref_gender: 'dont_care',
              },
              error: null,
            },
          },
        },
      });
      const db = createSupabaseDbClient(supabase);

      const result = await db.findUserByPhone('whatsapp:+1234567890');

      expect(result).toEqual({
        id: 'user-1',
        displayName: 'Tommy',
        preferencesConfigured: false,
      });
    });

    it('returns null when no user matches the phone number', async () => {
      const supabase = createMockSupabase();
      const db = createSupabaseDbClient(supabase);

      const result = await db.findUserByPhone('whatsapp:+9999999999');

      expect(result).toBeNull();
    });
  });
});
