import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import {
  getUpcomingEvents,
  getUserRegistrations,
  registerForEvent,
} from '../eventService';
import { supabase } from '../supabase';

const VALID_USER_ID = '660e8400-e29b-41d4-a716-446655440001';
const VALID_EVENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUpcomingEvents', () => {
    it('returns events with end_date >= today', async () => {
      const mockEvents = [
        {
          id: VALID_EVENT_ID,
          name: 'Summer Festival',
          start_date: '2026-07-01',
          end_date: '2026-07-10',
          location: 'Barcelona, Spain',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockEvents,
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getUpcomingEvents();

      expect(mockFrom).toHaveBeenCalledWith('event');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Summer Festival');
    });

    it('excludes past events', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getUpcomingEvents();

      expect(result).toHaveLength(0);
    });
  });

  describe('registerForEvent', () => {
    it('creates a registration for the authenticated user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'reg-id',
                user_id: VALID_USER_ID,
                event_id: VALID_EVENT_ID,
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await registerForEvent(VALID_EVENT_ID);

      expect(mockFrom).toHaveBeenCalledWith('event_registration');
      expect(result.event_id).toBe(VALID_EVENT_ID);
    });

    it('throws when user is not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      await expect(registerForEvent(VALID_EVENT_ID)).rejects.toThrow(
        'User must be authenticated',
      );
    });
  });

  describe('getUserRegistrations', () => {
    it('returns events the user is registered for', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'reg-id',
                  user_id: VALID_USER_ID,
                  event_id: VALID_EVENT_ID,
                  created_at: '2026-01-01T00:00:00Z',
                  updated_at: '2026-01-01T00:00:00Z',
                  event: {
                    id: VALID_EVENT_ID,
                    name: 'Summer Festival',
                    start_date: '2026-07-01',
                    end_date: '2026-07-10',
                    location: 'Barcelona, Spain',
                  },
                },
              ],
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getUserRegistrations();

      expect(mockFrom).toHaveBeenCalledWith('event_registration');
      expect(result).toHaveLength(1);
      expect(result[0].event.name).toBe('Summer Festival');
    });
  });
});
