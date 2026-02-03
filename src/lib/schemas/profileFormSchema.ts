import { z } from 'zod';

/**
 * Schema for Step 1: Basic Info
 */
export const ProfileBasicInfoSchema = z.object({
  fullName: z.string(),
  dayOfBirth: z.string(),
  monthOfBirth: z.string(),
  yearOfBirth: z.string(),
  gender: z.string(),
});

/**
 * Schema for Step 2: Location
 */
export const ProfileLocationSchema = z.object({
  birthPlace: z.string(),
  currentPlace: z.string(),
});

/**
 * Schema for Step 3: Languages
 */
export const ProfileLanguagesSchema = z.object({
  languages: z.array(z.string()),
});

/**
 * Schema for Step 4: Preferences
 */
export const ProfilePreferencesSchema = z.object({
  bio: z.string(),
  travelStyle: z.string(),
  interests: z.array(z.string()),
});

/**
 * Complete profile form data schema combining all steps.
 */
export const ProfileFormDataSchema = ProfileBasicInfoSchema.merge(
  ProfileLocationSchema,
)
  .merge(ProfileLanguagesSchema)
  .merge(ProfilePreferencesSchema);

/**
 * Partial profile form data for incremental updates during multi-step form.
 */
export const PartialProfileFormDataSchema = ProfileFormDataSchema.partial();
