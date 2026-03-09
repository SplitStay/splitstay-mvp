import { beforeEach, describe, expect, vi } from 'vitest';
import { test } from '@/lib/testing/fixtures';

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

/**
 * Creates a complete mock trip with all required fields for schema validation.
 *
 * Uses lowercase field names to match the actual database column names
 * (PostgreSQL lowercases unquoted identifiers).
 */
function createMockTrip(overrides: Record<string, unknown> = {}) {
  return {
    id: VALID_TRIP_ID,
    name: 'Test Trip',
    description: 'A test trip',
    location: 'Paris',
    locationId: null,
    hostId: VALID_USER_ID,
    joineeId: null,
    accommodationTypeId: null,
    personalNote: null,
    vibe: null,
    tripLink: null,
    estimatedmonth: null,
    estimatedyear: null,
    numberofrooms: null,
    matchwith: null,
    ispublic: true,
    rooms: null,
    startDate: null,
    endDate: null,
    bookingUrl: null,
    thumbnailUrl: null,
    flexible: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    host: { name: 'Host Name', imageUrl: null },
    joinee: null,
    accommodation_type: null,
    ...overrides,
  };
}

/**
 * Builds a Supabase query chain mock where every method returns the chain
 * itself, except the terminal method which resolves with the given data.
 *
 * Pass `spies` to capture calls to specific methods (e.g., `select`).
 */
function buildSupabaseChain({
  resolveWith,
  spies = {},
}: {
  resolveWith: { data: unknown; error: unknown };
  spies?: Record<string, ReturnType<typeof vi.fn>>;
}) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = () => chain;
  for (const method of [
    'select',
    'eq',
    'or',
    'ilike',
    'gte',
    'lte',
    'order',
    'limit',
    'single',
  ]) {
    chain[method] = spies[method]
      ? spies[method].mockReturnValue(chain)
      : vi.fn(self);
  }
  // Terminal: limit and single resolve with data
  chain.limit = vi.fn().mockResolvedValue(resolveWith);
  chain.single = vi.fn().mockResolvedValue(resolveWith);
  return chain as unknown as ReturnType<typeof supabase.from>;
}

describe('tripService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchTrips', () => {
    it('queries searchable_trips with joineeId join, not trip_member', async () => {
      const selectSpy = vi.fn();
      const chain = buildSupabaseChain({
        resolveWith: { data: [createMockTrip()], error: null },
        spies: { select: selectSpy },
      });
      vi.mocked(supabase.from).mockReturnValue(chain);

      await searchTrips({});

      expect(supabase.from).toHaveBeenCalledWith('searchable_trips');
      const selectArg = selectSpy.mock.calls[0][0] as string;
      expect(selectArg).toContain('joinee:user!joineeId');
      expect(selectArg).not.toContain('trip_member');
    });
  });

  describe('getTripById', () => {
    test('returns trip for owner even if hidden', async ({ fake }) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse({ id: VALID_USER_ID }),
      );

      const mockTrip = createMockTrip({
        name: 'My Trip',
        host: { name: 'Owner', imageUrl: null },
      });

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

    test('returns null for hidden trip when user is not owner', async ({
      fake,
    }) => {
      const differentUserId = '770e8400-e29b-41d4-a716-446655440002';
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse({ id: differentUserId }),
      );

      const mockTrip = createMockTrip({
        name: 'Someone Else Trip',
        hostId: VALID_USER_ID, // Different from current user
        host: { name: 'Other Owner', imageUrl: null },
      });

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

    test('returns trip for non-hidden trip regardless of user', async ({
      fake,
    }) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse(null),
      );

      const mockTrip = createMockTrip({
        name: 'Public Trip',
        host: { name: 'Host', imageUrl: null },
      });

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
    test('includes hidden status for user trips', async ({ fake }) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse({ id: VALID_USER_ID }),
      );

      const mockTrips = [
        createMockTrip({
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Trip 1',
        }),
        createMockTrip({
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Trip 2',
        }),
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
