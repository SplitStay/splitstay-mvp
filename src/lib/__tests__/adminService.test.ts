import { beforeEach, describe, expect, it, vi } from 'vitest';
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

import {
  getAllTripsForAdmin,
  hideTrip,
  isCurrentUserAdmin,
  isTripHidden,
  unhideTrip,
} from '../adminService';
import { supabase } from '../supabase';

// Use valid UUIDs for tests
const VALID_TRIP_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_USER_ID = '660e8400-e29b-41d4-a716-446655440001';

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isCurrentUserAdmin', () => {
    test('returns true when user is an admin', async ({ fake }) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse({ id: VALID_USER_ID }),
      );

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { userId: VALID_USER_ID, createdAt: '2026-01-28' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await isCurrentUserAdmin();
      expect(result).toBe(true);
    });

    test('returns false when user is not an admin', async ({ fake }) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse({ id: VALID_USER_ID }),
      );

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });

    test('returns false when user is not authenticated', async ({ fake }) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse(null),
      );

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });
  });

  describe('hideTrip', () => {
    it('hides a trip successfully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { tripId: VALID_TRIP_ID, createdAt: '2026-01-28' },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(hideTrip(VALID_TRIP_ID)).resolves.not.toThrow();
      expect(mockFrom).toHaveBeenCalledWith('hidden_trips');
    });

    it('throws error when trip is already hidden', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'duplicate key' },
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(hideTrip(VALID_TRIP_ID)).rejects.toThrow(
        'Trip is already hidden',
      );
    });

    it('throws user-friendly error for non-existent trip', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23503', message: 'foreign key violation' },
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(hideTrip(VALID_TRIP_ID)).rejects.toThrow('Trip not found');
    });

    it('throws error for invalid trip ID format', async () => {
      await expect(hideTrip('not-a-uuid')).rejects.toThrow('Invalid trip ID');
    });
  });

  describe('unhideTrip', () => {
    it('unhides a trip successfully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
            count: 1,
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(unhideTrip(VALID_TRIP_ID)).resolves.not.toThrow();
      expect(mockFrom).toHaveBeenCalledWith('hidden_trips');
    });

    it('throws error when trip is not hidden', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
            count: 0,
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(unhideTrip(VALID_TRIP_ID)).rejects.toThrow(
        'Trip is not hidden',
      );
    });

    it('throws error for invalid trip ID format', async () => {
      await expect(unhideTrip('invalid')).rejects.toThrow('Invalid trip ID');
    });
  });

  describe('getAllTripsForAdmin', () => {
    it('returns all trips with hidden status and host info', async () => {
      const mockTrips = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Trip 1',
          location: 'Paris',
          host: { name: 'John', imageUrl: 'https://example.com/john.jpg' },
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Trip 2',
          location: 'London',
          host: { name: 'Jane', imageUrl: null },
        },
      ];
      const mockHiddenTrips = [
        { tripId: '550e8400-e29b-41d4-a716-446655440001' },
      ];

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'trip') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockTrips,
                error: null,
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

      const result = await getAllTripsForAdmin();

      expect(result).toHaveLength(2);
      expect(result[0].isHidden).toBe(true);
      expect(result[1].isHidden).toBe(false);
    });
  });

  describe('isTripHidden', () => {
    it('returns true when trip is hidden', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { tripId: VALID_TRIP_ID },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await isTripHidden(VALID_TRIP_ID);
      expect(result).toBe(true);
    });

    it('returns false when trip is not hidden', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await isTripHidden(VALID_TRIP_ID);
      expect(result).toBe(false);
    });
  });
});
