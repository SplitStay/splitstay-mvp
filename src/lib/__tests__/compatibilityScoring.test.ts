import { describe, expect, it } from 'vitest';
import {
  applyMustMatchFilters,
  computeCompatibilityScore,
  type ScoringPreferences,
  type ScoringProfile,
  scoreAge,
  scoreGender,
  scoreLanguage,
  scoreTravelTraits,
} from '../compatibilityScoring';

describe('compatibilityScoring', () => {
  describe('scoreLanguage', () => {
    it('returns 1.0 when users share at least one language', () => {
      expect(scoreLanguage(['en', 'es'], ['es', 'fr'])).toBe(1.0);
    });

    it('returns 0.0 when no languages are shared', () => {
      expect(scoreLanguage(['en'], ['fr', 'de'])).toBe(0.0);
    });

    it('returns 0.0 when either user has null languages', () => {
      expect(scoreLanguage(null, ['en'])).toBe(0.0);
      expect(scoreLanguage(['en'], null)).toBe(0.0);
    });

    it('returns 0.0 when both users have empty language arrays', () => {
      expect(scoreLanguage([], [])).toBe(0.0);
    });
  });

  describe('scoreAge', () => {
    it('returns 1.0 when target age is within range', () => {
      expect(scoreAge(25, 35, 30)).toBe(1.0);
    });

    it('returns 1.0 at range boundaries', () => {
      expect(scoreAge(25, 35, 25)).toBe(1.0);
      expect(scoreAge(25, 35, 35)).toBe(1.0);
    });

    it('applies linear decay for ages outside range', () => {
      // 40 is 5 beyond the max boundary of 35, range width is 10
      // score = max(0, 1 - 5/10) = 0.5
      expect(scoreAge(25, 35, 40)).toBe(0.5);
    });

    it('floors at 0.0 for distant ages', () => {
      // 46 is 11 beyond the max boundary, range width 10
      // score = max(0, 1 - 11/10) = max(0, -0.1) = 0.0
      expect(scoreAge(25, 35, 46)).toBe(0.0);
    });

    it('applies decay on the low side', () => {
      // 20 is 5 below the min boundary of 25, range width 10
      // score = max(0, 1 - 5/10) = 0.5
      expect(scoreAge(25, 35, 20)).toBe(0.5);
    });

    it('returns 1.0 when no age range is set', () => {
      expect(scoreAge(null, null, 30)).toBe(1.0);
    });

    it('returns 1.0 when target age is null', () => {
      expect(scoreAge(25, 35, null)).toBe(1.0);
    });
  });

  describe('scoreTravelTraits', () => {
    it('returns ratio of shared traits', () => {
      // 3 shared out of 5 total = 0.6
      const a = ['adventure', 'food', 'culture', 'nature', 'nightlife'];
      const b = ['adventure', 'food', 'culture'];
      expect(scoreTravelTraits(a, b)).toBeCloseTo(0.6);
    });

    it('returns 0.0 when no traits are shared', () => {
      expect(scoreTravelTraits(['a', 'b'], ['c', 'd'])).toBe(0.0);
    });

    it('returns 1.0 when all traits match', () => {
      const traits = ['adventure', 'food', 'culture'];
      expect(scoreTravelTraits(traits, traits)).toBe(1.0);
    });

    it('returns 0.0 when either user has null traits', () => {
      expect(scoreTravelTraits(null, ['a'])).toBe(0.0);
      expect(scoreTravelTraits(['a'], null)).toBe(0.0);
    });
  });

  describe('scoreGender', () => {
    it('returns 1.0 when target gender matches any preferred gender', () => {
      expect(scoreGender([1, 2], 1)).toBe(1.0);
    });

    it('returns 0.0 when target gender does not match any preferred', () => {
      expect(scoreGender([1, 2], 3)).toBe(0.0);
    });

    it('returns 1.0 when no gender preference set (empty array)', () => {
      expect(scoreGender([], 1)).toBe(1.0);
    });

    it('returns 1.0 when target gender is null', () => {
      expect(scoreGender([1, 2], null)).toBe(1.0);
    });
  });

  describe('applyMustMatchFilters', () => {
    const baseProfile: ScoringProfile = {
      userId: 'user-b',
      languages: ['en', 'fr'],
      travelTraits: ['adventure'],
      age: 30,
      genderId: 1,
    };

    it('filters out profiles that fail must_match language', () => {
      const prefs: ScoringPreferences = {
        match_pref_language: 'must_match',
        match_pref_travel_traits: 'dont_care',
        match_pref_age: 'dont_care',
        match_pref_gender: 'dont_care',
        match_age_min: null,
        match_age_max: null,
        languages: ['de'],
        genderPreferences: [],
      };

      const result = applyMustMatchFilters([baseProfile], prefs);
      expect(result).toHaveLength(0);
    });

    it('keeps profiles that pass must_match language', () => {
      const prefs: ScoringPreferences = {
        match_pref_language: 'must_match',
        match_pref_travel_traits: 'dont_care',
        match_pref_age: 'dont_care',
        match_pref_gender: 'dont_care',
        match_age_min: null,
        match_age_max: null,
        languages: ['en'],
        genderPreferences: [],
      };

      const result = applyMustMatchFilters([baseProfile], prefs);
      expect(result).toHaveLength(1);
    });

    it('filters on must_match gender', () => {
      const prefs: ScoringPreferences = {
        match_pref_language: 'dont_care',
        match_pref_travel_traits: 'dont_care',
        match_pref_age: 'dont_care',
        match_pref_gender: 'must_match',
        match_age_min: null,
        match_age_max: null,
        languages: [],
        genderPreferences: [2],
      };

      const result = applyMustMatchFilters([baseProfile], prefs);
      expect(result).toHaveLength(0);
    });
  });

  describe('computeCompatibilityScore', () => {
    const targetProfile: ScoringProfile = {
      userId: 'user-b',
      languages: ['en', 'fr'],
      travelTraits: ['adventure', 'food', 'culture'],
      age: 30,
      genderId: 1,
    };

    it('returns equal scores when all dimensions are dont_care', () => {
      const prefs: ScoringPreferences = {
        match_pref_language: 'dont_care',
        match_pref_travel_traits: 'dont_care',
        match_pref_age: 'dont_care',
        match_pref_gender: 'dont_care',
        match_age_min: null,
        match_age_max: null,
        languages: [],
        genderPreferences: [],
      };

      const score = computeCompatibilityScore(targetProfile, prefs);
      expect(score).toBe(0);
    });

    it('scores prefer dimensions and returns weighted average', () => {
      const prefs: ScoringPreferences = {
        match_pref_language: 'prefer',
        match_pref_travel_traits: 'prefer',
        match_pref_age: 'dont_care',
        match_pref_gender: 'dont_care',
        match_age_min: null,
        match_age_max: null,
        languages: ['en'],
        genderPreferences: [],
      };

      const score = computeCompatibilityScore(targetProfile, prefs);
      // language: 1.0, travel traits: needs scorer's traits
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('scoring is asymmetric between two users', () => {
      const userA: ScoringPreferences = {
        match_pref_language: 'must_match',
        match_pref_travel_traits: 'dont_care',
        match_pref_age: 'dont_care',
        match_pref_gender: 'dont_care',
        match_age_min: null,
        match_age_max: null,
        languages: ['de'],
        genderPreferences: [],
      };

      const userB: ScoringPreferences = {
        match_pref_language: 'dont_care',
        match_pref_travel_traits: 'dont_care',
        match_pref_age: 'dont_care',
        match_pref_gender: 'dont_care',
        match_age_min: null,
        match_age_max: null,
        languages: ['en'],
        genderPreferences: [],
      };

      const profileA: ScoringProfile = {
        userId: 'user-a',
        languages: ['de'],
        travelTraits: [],
        age: 30,
        genderId: 1,
      };

      const profileB: ScoringProfile = {
        userId: 'user-b',
        languages: ['en'],
        travelTraits: [],
        age: 30,
        genderId: 1,
      };

      // A has must_match on language and shares no language with B
      const filteredForA = applyMustMatchFilters([profileB], userA);
      expect(filteredForA).toHaveLength(0);

      // B has dont_care on language, so A passes
      const filteredForB = applyMustMatchFilters([profileA], userB);
      expect(filteredForB).toHaveLength(1);
    });

    it('prefer dimensions rank users correctly', () => {
      const prefs: ScoringPreferences = {
        match_pref_language: 'dont_care',
        match_pref_travel_traits: 'prefer',
        match_pref_age: 'dont_care',
        match_pref_gender: 'dont_care',
        match_age_min: null,
        match_age_max: null,
        languages: [],
        genderPreferences: [],
      };

      const scorerTraits = [
        'adventure',
        'food',
        'culture',
        'nature',
        'nightlife',
      ];

      const profileHigh: ScoringProfile = {
        userId: 'high',
        languages: [],
        travelTraits: ['adventure', 'food', 'culture'],
        age: 30,
        genderId: 1,
      };

      const profileLow: ScoringProfile = {
        userId: 'low',
        languages: [],
        travelTraits: ['adventure'],
        age: 30,
        genderId: 1,
      };

      const prefsWithTraits = { ...prefs, travelTraits: scorerTraits };

      const scoreHigh = computeCompatibilityScore(profileHigh, prefsWithTraits);
      const scoreLow = computeCompatibilityScore(profileLow, prefsWithTraits);

      expect(scoreHigh).toBeGreaterThan(scoreLow);
    });
  });
});
