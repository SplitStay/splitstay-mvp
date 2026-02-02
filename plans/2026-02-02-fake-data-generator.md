# Fake Data Generator

## Problem

Test files contain 7 `biome-ignore lint/suspicious/noExplicitAny` directives for Supabase auth mocks. The Supabase `User` type requires many fields (`id`, `app_metadata`, `user_metadata`, `aud`, `created_at`), but tests only provide partial data, requiring unsafe `as any` casts.

## Solution

Create a fake data generator system with:
- Pure generator functions for each entity
- Full TypeScript type inference via `Partial<T>` overrides
- Zod schema validation for generated data
- Vitest fixture integration for ergonomic test usage

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Pattern | Factory API | Single import point, easy to extend, works as Vitest fixture |
| Relationships | Explicit wiring | Caller provides `hostId`, `userId`, etc. - no magic auto-creation |
| Location | `src/lib/testing/` | Alongside lib modules, clearly test-focused |
| Barrel files | None | Direct imports only for clarity and tree-shaking |
| Shared state | None | Each generator call is independent - no cross-test pollution |

## File Structure

```
src/lib/testing/
├── createFakeApi.ts            # Factory wrapping all generators
├── fixtures.ts                 # Vitest fixture setup
├── generators/
│   ├── user.ts                 # createUser
│   ├── trip.ts                 # createTrip
│   └── supabaseAuth.ts         # createMockAuthUser
```

## Implementation

### Generator Functions

Each generator is a pure function with typed overrides:

```typescript
// src/lib/testing/generators/supabaseAuth.ts
import { faker } from '@faker-js/faker';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const createMockAuthUser = (overrides: Partial<SupabaseUser> = {}): SupabaseUser => {
  return {
    id: faker.string.uuid(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: faker.date.past().toISOString(),
    ...overrides,
  };
};
```

```typescript
// src/lib/testing/generators/user.ts
import { faker } from '@faker-js/faker';
import { UserSchema, type User } from '@/lib/schemas/userSchema';

export const createUser = (overrides: Partial<User> = {}): User => {
  const user = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    imageUrl: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
  return UserSchema.parse(user);
};
```

```typescript
// src/lib/testing/generators/trip.ts
import { faker } from '@faker-js/faker';
import { TripSchema, type Trip } from '@/lib/schemas/tripSchema';

export const createTrip = (overrides: Partial<Trip> = {}): Trip => {
  const trip = {
    id: faker.string.uuid(),
    hostId: overrides.hostId ?? faker.string.uuid(),
    name: faker.location.city(),
    description: faker.lorem.paragraph(),
    startDate: faker.date.future().toISOString(),
    endDate: faker.date.future().toISOString(),
    // ... other required fields
    ...overrides,
  };
  return TripSchema.parse(trip);
};
```

### Factory API

```typescript
// src/lib/testing/createFakeApi.ts
import { createUser } from './generators/user';
import { createTrip } from './generators/trip';
import { createMockAuthUser } from './generators/supabaseAuth';

export const createFakeApi = () => ({
  createUser,
  createTrip,
  createMockAuthUser,
});

export type FakeApi = ReturnType<typeof createFakeApi>;
```

### Vitest Fixture

```typescript
// src/lib/testing/fixtures.ts
import { test as base } from 'vitest';
import { createFakeApi, type FakeApi } from './createFakeApi';

export const test = base.extend<{ fake: FakeApi }>({
  fake: async ({}, use) => {
    await use(createFakeApi());
  },
});
```

## Usage

### Before (with biome-ignore)

```typescript
vi.mocked(supabase.auth.getUser).mockResolvedValue({
  data: { user: { id: VALID_USER_ID } },
  error: null,
  // biome-ignore lint/suspicious/noExplicitAny: Test mock
} as any);
```

### After (fully typed)

```typescript
import { test } from '@/lib/testing/fixtures';

test('returns user trips', async ({ fake }) => {
  const user = fake.createMockAuthUser({ id: VALID_USER_ID });

  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user },
    error: null,
  });

  // No biome-ignore needed - types are satisfied
});
```

## Initial Scope

1. **supabaseAuth** - Immediate priority (solves the 7 `noExplicitAny` issues)
2. **user** - Core entity, needed by most tests
3. **trip** - Primary domain entity

Additional generators (conversation, message) can be added as needed.

## Tasks

- [x] Create `src/lib/testing/generators/supabaseAuth.ts`
- [x] Create `src/lib/testing/generators/user.ts`
- [x] Create `src/lib/testing/generators/trip.ts`
- [x] Create `src/lib/testing/createFakeApi.ts`
- [x] Create `src/lib/testing/fixtures.ts`
- [x] Update existing tests to use fixtures
- [x] Remove all 7 `noExplicitAny` directives
- [x] Verify all tests pass
