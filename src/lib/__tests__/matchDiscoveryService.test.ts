import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

import {
  expressInterest,
  getEventMatches,
  undoInterest,
} from '../matchDiscoveryService';
import { supabase } from '../supabase';

const VALID_USER_ID = '660e8400-e29b-41d4-a716-446655440001';
const VALID_EVENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const TARGET_USER_ID = '880e8400-e29b-41d4-a716-446655440003';

describe('matchDiscoveryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEventMatches', () => {
    it('calls the get_event_matches RPC with the event ID', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockProfiles = [
        {
          user_id: TARGET_USER_ID,
          name: 'Alice',
          compatibility_score: 0.85,
        },
      ];

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockProfiles,
        error: null,
      } as ReturnType<typeof supabase.rpc>);

      const result = await getEventMatches(VALID_EVENT_ID);

      expect(supabase.rpc).toHaveBeenCalledWith('get_event_matches', {
        p_event_id: VALID_EVENT_ID,
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });

    it('throws when RPC returns an error', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'RPC failed', code: 'P0001' },
      } as ReturnType<typeof supabase.rpc>);

      await expect(getEventMatches(VALID_EVENT_ID)).rejects.toThrow(
        'RPC failed',
      );
    });
  });

  describe('expressInterest', () => {
    it('calls the express_interest RPC and returns the result', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { is_mutual: false },
        error: null,
      } as ReturnType<typeof supabase.rpc>);

      const result = await expressInterest(VALID_EVENT_ID, TARGET_USER_ID);

      expect(supabase.rpc).toHaveBeenCalledWith('express_interest', {
        p_event_id: VALID_EVENT_ID,
        p_target_user_id: TARGET_USER_ID,
      });
      expect(result.is_mutual).toBe(false);
    });

    it('returns mutual match when both users have expressed interest', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { is_mutual: true },
        error: null,
      } as ReturnType<typeof supabase.rpc>);

      const result = await expressInterest(VALID_EVENT_ID, TARGET_USER_ID);

      expect(result.is_mutual).toBe(true);
    });
  });

  describe('undoInterest', () => {
    it('deletes the interest record', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await undoInterest(VALID_EVENT_ID, TARGET_USER_ID);

      expect(mockFrom).toHaveBeenCalledWith('match_interest');
    });
  });
});
