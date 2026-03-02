import { supabase } from './supabase';

type PreferenceWeight = 'must_match' | 'prefer' | 'dont_care';

interface MatchingPreferences {
  match_pref_language: PreferenceWeight;
  match_pref_travel_traits: PreferenceWeight;
  match_pref_age: PreferenceWeight;
  match_pref_gender: PreferenceWeight;
  match_age_min: number | null;
  match_age_max: number | null;
}

export const getMatchingPreferences =
  async (): Promise<MatchingPreferences> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User must be authenticated');

    const { data, error } = await supabase
      .from('user')
      .select(
        'match_pref_language, match_pref_travel_traits, match_pref_age, match_pref_gender, match_age_min, match_age_max',
      )
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  };

export const updateMatchingPreferences = async (
  preferences: Partial<MatchingPreferences>,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase
    .from('user')
    .update(preferences)
    .eq('id', user.id)
    .select(
      'match_pref_language, match_pref_travel_traits, match_pref_age, match_pref_gender, match_age_min, match_age_max',
    )
    .single();

  if (error) throw error;
  return data;
};

export const getGenderPreferences = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase
    .from('user_gender_preference')
    .select('gender_id, gender(label)')
    .eq('user_id', user.id);

  if (error) throw error;
  return data ?? [];
};

export const updateGenderPreferences = async (genderIds: number[]) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User must be authenticated');

  await supabase.from('user_gender_preference').delete().eq('user_id', user.id);

  if (genderIds.length > 0) {
    const rows = genderIds.map((genderId) => ({
      user_id: user.id,
      gender_id: genderId,
    }));

    const { error } = await supabase
      .from('user_gender_preference')
      .insert(rows);

    if (error) throw error;
  }
};

export const validateAgeRange = (
  min: number | null,
  max: number | null,
): { valid: boolean; error?: string } => {
  if (min === null && max === null) {
    return { valid: true };
  }

  if (min !== null && min < 18) {
    return { valid: false, error: 'Minimum age must be at least 18' };
  }

  if (max !== null && max > 120) {
    return { valid: false, error: 'Maximum age cannot exceed 120' };
  }

  if (min !== null && max !== null && min > max) {
    return {
      valid: false,
      error: 'Minimum age cannot exceed maximum age',
    };
  }

  return { valid: true };
};
