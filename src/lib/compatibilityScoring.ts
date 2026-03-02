type PreferenceWeight = 'must_match' | 'prefer' | 'dont_care';

export interface ScoringProfile {
  userId: string;
  languages: string[] | null;
  travelTraits: string[] | null;
  age: number | null;
  genderId: number | null;
}

export interface ScoringPreferences {
  match_pref_language: PreferenceWeight;
  match_pref_travel_traits: PreferenceWeight;
  match_pref_age: PreferenceWeight;
  match_pref_gender: PreferenceWeight;
  match_age_min: number | null;
  match_age_max: number | null;
  languages: string[] | null;
  travelTraits?: string[] | null;
  genderPreferences: number[];
}

export const scoreLanguage = (
  scorerLanguages: string[] | null,
  targetLanguages: string[] | null,
): number => {
  if (!scorerLanguages?.length || !targetLanguages?.length) return 0.0;
  const scorerSet = new Set(scorerLanguages);
  return targetLanguages.some((lang) => scorerSet.has(lang)) ? 1.0 : 0.0;
};

export const scoreAge = (
  minAge: number | null,
  maxAge: number | null,
  targetAge: number | null,
): number => {
  if (minAge === null || maxAge === null || targetAge === null) return 1.0;

  if (targetAge >= minAge && targetAge <= maxAge) return 1.0;

  const rangeWidth = maxAge - minAge;
  if (rangeWidth === 0) return targetAge === minAge ? 1.0 : 0.0;

  const distance = targetAge < minAge ? minAge - targetAge : targetAge - maxAge;

  return Math.max(0, 1 - distance / rangeWidth);
};

export const scoreTravelTraits = (
  scorerTraits: string[] | null,
  targetTraits: string[] | null,
): number => {
  if (!scorerTraits?.length || !targetTraits?.length) return 0.0;

  const scorerSet = new Set(scorerTraits);
  const shared = targetTraits.filter((t) => scorerSet.has(t)).length;
  return shared / scorerTraits.length;
};

export const scoreGender = (
  preferredGenderIds: number[],
  targetGenderId: number | null,
): number => {
  if (preferredGenderIds.length === 0 || targetGenderId === null) return 1.0;
  return preferredGenderIds.includes(targetGenderId) ? 1.0 : 0.0;
};

export const applyMustMatchFilters = (
  profiles: ScoringProfile[],
  prefs: ScoringPreferences,
): ScoringProfile[] => {
  return profiles.filter((profile) => {
    if (prefs.match_pref_language === 'must_match') {
      if (scoreLanguage(prefs.languages, profile.languages) === 0) return false;
    }

    if (prefs.match_pref_travel_traits === 'must_match') {
      if (
        scoreTravelTraits(prefs.travelTraits ?? null, profile.travelTraits) ===
        0
      )
        return false;
    }

    if (prefs.match_pref_age === 'must_match') {
      if (scoreAge(prefs.match_age_min, prefs.match_age_max, profile.age) === 0)
        return false;
    }

    if (prefs.match_pref_gender === 'must_match') {
      if (scoreGender(prefs.genderPreferences, profile.genderId) === 0)
        return false;
    }

    return true;
  });
};

export const computeCompatibilityScore = (
  target: ScoringProfile,
  prefs: ScoringPreferences & { travelTraits?: string[] | null },
): number => {
  const dimensions: { weight: PreferenceWeight; score: number }[] = [
    {
      weight: prefs.match_pref_language,
      score: scoreLanguage(prefs.languages, target.languages),
    },
    {
      weight: prefs.match_pref_travel_traits,
      score: scoreTravelTraits(prefs.travelTraits ?? null, target.travelTraits),
    },
    {
      weight: prefs.match_pref_age,
      score: scoreAge(prefs.match_age_min, prefs.match_age_max, target.age),
    },
    {
      weight: prefs.match_pref_gender,
      score: scoreGender(prefs.genderPreferences, target.genderId),
    },
  ];

  const activeDimensions = dimensions.filter((d) => d.weight === 'prefer');

  if (activeDimensions.length === 0) return 0;

  const total = activeDimensions.reduce((sum, d) => sum + d.score, 0);
  return total / activeDimensions.length;
};
