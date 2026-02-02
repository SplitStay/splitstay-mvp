import {
  createMockAuthUser,
  createMockUserResponse,
} from './generators/supabaseAuth';
import { createTrip, createTripWithHost } from './generators/trip';
import { createUser } from './generators/user';

/**
 * Creates a fake data API for use in tests.
 *
 * Provides a single import point for all test data generators,
 * designed to be used as a Vitest fixture for ergonomic test usage.
 *
 * @example
 * ```typescript
 * import { test } from '@/lib/testing/fixtures';
 *
 * test('host can create a trip', ({ fake }) => {
 *   const host = fake.createUser();
 *   const trip = fake.createTrip({ hostId: host.id });
 *   // ...
 * });
 * ```
 */
export const createFakeApi = () => ({
  // Supabase auth mocks
  createMockAuthUser,
  createMockUserResponse,

  // Domain entity generators
  createUser,
  createTrip,
  createTripWithHost,
});

export type FakeApi = ReturnType<typeof createFakeApi>;
