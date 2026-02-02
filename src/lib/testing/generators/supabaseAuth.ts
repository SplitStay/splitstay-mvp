import { faker } from '@faker-js/faker';
import type { User as SupabaseUser, UserResponse } from '@supabase/supabase-js';

/**
 * Creates a mock Supabase auth user with all required fields.
 *
 * Supabase's User type requires fields like app_metadata, user_metadata,
 * aud, and created_at. This generator provides sensible defaults while
 * allowing typed overrides.
 */
export const createMockAuthUser = (
  overrides: Partial<SupabaseUser> = {},
): SupabaseUser => {
  return {
    id: faker.string.uuid(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: faker.date.past().toISOString(),
    ...overrides,
  };
};

/**
 * Creates a mock UserResponse for supabase.auth.getUser() calls.
 *
 * This is the complete response shape that getUser() returns,
 * including the nested user object and error field.
 */
export const createMockUserResponse = (
  userOverrides: Partial<SupabaseUser> | null = {},
): UserResponse => {
  if (userOverrides === null) {
    return {
      data: { user: null },
      error: null,
    };
  }

  return {
    data: { user: createMockAuthUser(userOverrides) },
    error: null,
  };
};
