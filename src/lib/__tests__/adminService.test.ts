/**
 * Additional adminService tests not covered by admin.feature.
 *
 * Tests for feature scenarios are in admin.spec.ts which binds to
 * features/admin.feature via vitest-cucumber.
 *
 * This file contains supplementary tests for:
 * - Edge cases not in the feature file
 * - Helper functions (isTripHidden)
 * - getAllTripsForAdmin functionality
 */
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

describe('adminService - supplementary tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isCurrentUserAdmin - edge cases', () => {
    test('returns false when user is not authenticated', async ({ fake }) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse(null),
      );

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });

    test('returns false when admin check returns an error', async ({
      fake,
    }) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue(
        fake.createMockUserResponse({ id: VALID_USER_ID }),
      );

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'SOME_ERROR', message: 'Database error' },
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await isCurrentUserAdmin();
      expect(result).toBe(false);
    });

    test('returns false when user is not an admin (PGRST116)', async ({
      fake,
    }) => {
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
  });

  describe('hideTrip - happy path', () => {
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
  });

  describe('unhideTrip - happy path', () => {
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

    it('throws error when trip fetch fails', async () => {
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'trip') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          };
        }
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(getAllTripsForAdmin()).rejects.toThrow(
        'Failed to load trips. Please try again.',
      );
    });

    it('throws error when hidden trips fetch fails', async () => {
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'trip') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        if (table === 'hidden_trips') {
          return {
            select: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          };
        }
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await expect(getAllTripsForAdmin()).rejects.toThrow(
        'Failed to load trip status. Please try again.',
      );
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

    it('returns false when trip is not hidden (PGRST116)', async () => {
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

    it('returns false when there is a database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'SOME_ERROR', message: 'Database error' },
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
