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
  getGenderPreferences,
  getMatchingPreferences,
  updateGenderPreferences,
  updateMatchingPreferences,
  validateAgeRange,
} from '../matchingPreferencesService';
import { supabase } from '../supabase';

const VALID_USER_ID = '660e8400-e29b-41d4-a716-446655440001';

describe('matchingPreferencesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMatchingPreferences', () => {
    it('returns current matching preferences for the user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                match_pref_language: 'dont_care',
                match_pref_travel_traits: 'prefer',
                match_pref_age: 'must_match',
                match_pref_gender: 'dont_care',
                match_age_min: 25,
                match_age_max: 40,
              },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getMatchingPreferences();

      expect(mockFrom).toHaveBeenCalledWith('user');
      expect(result.match_pref_language).toBe('dont_care');
      expect(result.match_pref_age).toBe('must_match');
      expect(result.match_age_min).toBe(25);
    });

    it('defaults to fully open when no preferences set', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                match_pref_language: 'dont_care',
                match_pref_travel_traits: 'dont_care',
                match_pref_age: 'dont_care',
                match_pref_gender: 'dont_care',
                match_age_min: null,
                match_age_max: null,
              },
              error: null,
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getMatchingPreferences();

      expect(result.match_pref_language).toBe('dont_care');
      expect(result.match_pref_travel_traits).toBe('dont_care');
      expect(result.match_pref_age).toBe('dont_care');
      expect(result.match_pref_gender).toBe('dont_care');
    });
  });

  describe('updateMatchingPreferences', () => {
    it('updates the user preference columns', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  match_pref_language: 'must_match',
                  match_pref_travel_traits: 'prefer',
                  match_pref_age: 'must_match',
                  match_pref_gender: 'prefer',
                  match_age_min: 25,
                  match_age_max: 40,
                },
                error: null,
              }),
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await updateMatchingPreferences({
        match_pref_language: 'must_match',
        match_pref_travel_traits: 'prefer',
        match_pref_age: 'must_match',
        match_pref_gender: 'prefer',
        match_age_min: 25,
        match_age_max: 40,
      });

      expect(mockFrom).toHaveBeenCalledWith('user');
      expect(result.match_pref_language).toBe('must_match');
    });
  });

  describe('getGenderPreferences', () => {
    it('returns gender preferences for the user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { gender_id: 1, gender: { label: 'Man' } },
              { gender_id: 2, gender: { label: 'Woman' } },
            ],
            error: null,
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      const result = await getGenderPreferences();

      expect(mockFrom).toHaveBeenCalledWith('user_gender_preference');
      expect(result).toHaveLength(2);
    });
  });

  describe('updateGenderPreferences', () => {
    it('replaces all gender preferences with the new set', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: VALID_USER_ID } },
        error: null,
      } as ReturnType<typeof supabase.auth.getUser> extends Promise<infer R>
        ? R
        : never);

      let callCount = 0;
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({
            data: [
              { user_id: VALID_USER_ID, gender_id: 1 },
              { user_id: VALID_USER_ID, gender_id: 3 },
            ],
            error: null,
          }),
        };
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      await updateGenderPreferences([1, 3]);

      expect(mockFrom).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateAgeRange', () => {
    it('returns valid for correct age range', () => {
      const result = validateAgeRange(25, 40);
      expect(result.valid).toBe(true);
    });

    it('returns invalid when min exceeds max', () => {
      const result = validateAgeRange(40, 25);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns invalid when age is below 18', () => {
      const result = validateAgeRange(15, 30);
      expect(result.valid).toBe(false);
    });

    it('returns invalid when age exceeds 120', () => {
      const result = validateAgeRange(25, 130);
      expect(result.valid).toBe(false);
    });

    it('returns valid when both are null (no age preference)', () => {
      const result = validateAgeRange(null, null);
      expect(result.valid).toBe(true);
    });
  });
});
