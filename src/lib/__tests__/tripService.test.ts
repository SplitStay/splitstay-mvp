import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock supabase before importing the service
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { supabase } from '../supabase';
import { getTripById, getUserTrips, searchTrips } from '../tripService';

const VALID_USER_ID = '660e8400-e29b-41d4-a716-446655440001';
const VALID_TRIP_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('tripService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchTrips', () => {
    it('queries searchable_trips view to exclude hidden trips', async () => {
      const mockTrips = [
        { id: VALID_TRIP_ID, name: 'Visible Trip', location: 'Paris' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockTrips,
                error: null,
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await searchTrips({});

      // Verify it queries the searchable_trips view
      expect(mockFrom).toHaveBeenCalledWith('searchable_trips');
      expect(result).toHaveLength(1);
    });
  });

  describe('getTripById', () => {
    it('returns trip for owner even if hidden', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
        // biome-ignore lint/suspicious/noExplicitAny: Test mock
      } as any);

      const mockTrip = {
        id: VALID_TRIP_ID,
        name: 'My Trip',
        hostId: VALID_USER_ID,
        host: { name: 'Owner', imageUrl: null },
      };

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'trip') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTrip,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'hidden_trips') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { tripId: VALID_TRIP_ID },
                  error: null,
                }),
              }),
            }),
          };
        }
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getTripById(VALID_TRIP_ID);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(VALID_TRIP_ID);
      expect(result?.isHiddenByAdmin).toBe(true);
    });

    it('returns null for hidden trip when user is not owner', async () => {
      const differentUserId = '770e8400-e29b-41d4-a716-446655440002';
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: differentUserId } },
        error: null,
        // biome-ignore lint/suspicious/noExplicitAny: Test mock
      } as any);

      const mockTrip = {
        id: VALID_TRIP_ID,
        name: 'Someone Else Trip',
        hostId: VALID_USER_ID, // Different from current user
        host: { name: 'Other Owner', imageUrl: null },
      };

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'trip') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTrip,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'hidden_trips') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { tripId: VALID_TRIP_ID }, // Trip IS hidden
                  error: null,
                }),
              }),
            }),
          };
        }
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getTripById(VALID_TRIP_ID);

      expect(result).toBeNull();
    });

    it('returns trip for non-hidden trip regardless of user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
        // biome-ignore lint/suspicious/noExplicitAny: Test mock
      } as any);

      const mockTrip = {
        id: VALID_TRIP_ID,
        name: 'Public Trip',
        hostId: VALID_USER_ID,
        host: { name: 'Host', imageUrl: null },
      };

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'trip') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTrip,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'hidden_trips') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { code: 'PGRST116' }, // Not found = not hidden
                }),
              }),
            }),
          };
        }
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getTripById(VALID_TRIP_ID);

      expect(result).not.toBeNull();
      expect(result?.isHiddenByAdmin).toBe(false);
    });
  });

  describe('getUserTrips', () => {
    it('includes hidden status for user trips', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
        // biome-ignore lint/suspicious/noExplicitAny: Test mock
      } as any);

      const mockTrips = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Trip 1',
          hostId: VALID_USER_ID,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Trip 2',
          hostId: VALID_USER_ID,
        },
      ];
      const mockHiddenTrips = [
        { tripId: '550e8400-e29b-41d4-a716-446655440001' },
      ];

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'trip') {
          return {
            select: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockTrips,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'hidden_trips') {
          return {
            select: vi.fn().mockResolvedValue({
              data: mockHiddenTrips,
              error: null,
            }),
          };
        }
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getUserTrips();

      expect(result).toHaveLength(2);
      expect(result[0].isHiddenByAdmin).toBe(true);
      expect(result[1].isHiddenByAdmin).toBe(false);
    });
  });
});
