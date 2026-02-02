import { test as base } from 'vitest';
import { createFakeApi, type FakeApi } from './createFakeApi';

/**
 * Extended Vitest test function with fake data fixture.
 *
 * Provides a `fake` object in each test for generating typed test data.
 *
 * @example
 * ```typescript
 * import { test } from '@/lib/testing/fixtures';
 *
 * test('returns user trips', async ({ fake }) => {
 *   const user = fake.createMockAuthUser({ id: 'user-123' });
 *
 *   vi.mocked(supabase.auth.getUser).mockResolvedValue(
 *     fake.createMockUserResponse({ id: user.id })
 *   );
 *
 *   // Test logic...
 * });
 * ```
 */
export const test = base.extend<{ fake: FakeApi }>({
  // Vitest requires destructuring pattern; we don't depend on other fixtures
  fake: async ({ fake: _unused }, use) => {
    await use(createFakeApi());
  },
});

// Re-export describe, expect, etc. for convenience
export { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
