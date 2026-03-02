import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { supabase } from '../supabase';
import {
  findOverlappingEvents,
  findOverlappingTrips,
  linkTripToEvent,
  unlinkTripFromEvent,
} from '../tripEventLinkingService';

const VALID_USER_ID = '660e8400-e29b-41d4-a716-446655440001';
const VALID_TRIP_ID = '770e8400-e29b-41d4-a716-446655440002';
const VALID_EVENT_ID = '880e8400-e29b-41d4-a716-446655440003';

describe('tripEventLinkingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findOverlappingTrips', () => {
    it('returns trips whose dates overlap with the event', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockTrips = [
        {
          id: VALID_TRIP_ID,
          name: 'Beach House',
          startDate: '2026-07-01',
          endDate: '2026-07-10',
          event_id: null,
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({
                  data: mockTrips,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await findOverlappingTrips(
        VALID_EVENT_ID,
        '2026-07-05',
        '2026-07-15',
      );

      expect(mockFrom).toHaveBeenCalledWith('trip');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Beach House');
    });

    it('excludes trips already linked to an event', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await findOverlappingTrips(
        VALID_EVENT_ID,
        '2026-07-05',
        '2026-07-15',
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('findOverlappingEvents', () => {
    it('returns registered events that overlap with the trip dates', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockRegistrations = [
        {
          event_id: VALID_EVENT_ID,
          event: {
            id: VALID_EVENT_ID,
            name: 'Summer Festival',
            start_date: '2026-07-01',
            end_date: '2026-07-10',
            location: 'Barcelona',
          },
        },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockRegistrations,
            error: null,
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await findOverlappingEvents('2026-07-05', '2026-07-15');

      expect(mockFrom).toHaveBeenCalledWith('event_registration');
      expect(result).toHaveLength(1);
      expect(result[0].event.name).toBe('Summer Festival');
    });
  });

  describe('linkTripToEvent', () => {
    it('sets the event_id on the trip', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: VALID_TRIP_ID,
                  event_id: VALID_EVENT_ID,
                },
                error: null,
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await linkTripToEvent(VALID_TRIP_ID, VALID_EVENT_ID);

      expect(mockFrom).toHaveBeenCalledWith('trip');
      expect(result.event_id).toBe(VALID_EVENT_ID);
    });
  });

  describe('unlinkTripFromEvent', () => {
    it('clears the event_id on the trip', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: VALID_TRIP_ID,
                  event_id: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await unlinkTripFromEvent(VALID_TRIP_ID);

      expect(mockFrom).toHaveBeenCalledWith('trip');
      expect(result.event_id).toBeNull();
    });

    it('throws when trip has members and cannot be unlinked', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: {
                  code: 'P0001',
                  message:
                    'Cannot unlink trip from event: trip has active members',
                },
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(unlinkTripFromEvent(VALID_TRIP_ID)).rejects.toThrow(
        'Cannot unlink trip from event: trip has active members',
      );
    });
  });
});
