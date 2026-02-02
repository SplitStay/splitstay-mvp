# Feature: Seed SQL Generator

**Created**: 2026-02-02
**Goal**: Eliminate dual maintenance by generating seed.sql from TypeScript as the single source of truth for accommodation types.

## User Requirements

<!-- TODO -->
Scenario: User can categorize their accommodation when posting a trip
  Given I am creating a new trip
  When I reach the accommodation details step
  Then I can select from accommodation categories like Hostel Room, Hotel Room, Apartment, or House

## Technical Specifications

<!-- TODO -->
# Living: none (initial implementation)
# Action: creates
Scenario: Accommodation types are defined with strict validation
  Given the accommodation type definitions in src/lib/testing/generators/accommodationType.ts
  When the module loads
  Then valid data includes id, name, and display order for each type
  And validation fails if data is empty
  And validation fails if data does not match expected literal values

<!-- TODO -->
# Living: none (initial implementation)
# Action: creates
Scenario: Generator script produces valid seed SQL
  Given accommodation types are defined in the fake data API
  When I run npm run db:seed:gen
  Then supabase/seed.sql is created
  And the file has a header marking it as generated
  And the SQL uses ON CONFLICT for idempotency
  And string values are properly escaped

<!-- TODO -->
# Living: none (initial implementation)
# Action: creates
Scenario: Trip generator uses valid accommodation type IDs
  Given accommodation types are defined in the fake data API
  When createTrip is called without an accommodationTypeId override
  Then the generated trip has a valid accommodationTypeId from the defined types

<!-- TODO -->
# Living: none (initial implementation)
# Action: creates
Scenario: Fake API exports accommodation types
  Given the createFakeApi function in src/lib/testing/createFakeApi.ts
  When I call createFakeApi()
  Then the returned object includes ACCOMMODATION_TYPES

<!-- TODO -->
# Living: none (initial implementation)
# Action: creates
Scenario: TypeScript configuration includes scripts directory
  Given tsconfig.node.json exists
  When I add scripts to the include array
  Then scripts/*.ts files are type-checked

<!-- TODO -->
# Living: none (initial implementation)
# Action: creates
Scenario: npm script runs the generator
  Given package.json has a db:seed:gen script
  When I run npm run db:seed:gen
  Then the generator executes via tsx
  And supabase/seed.sql is regenerated
  And the script exits with code 0 on success
  And the script exits with code 1 on any error

<!-- TODO -->
# Living: none (initial implementation)
# Action: creates
Scenario: Remove manual seed.sql and regenerate
  Given a manually created supabase/seed.sql exists
  When the generator runs
  Then it overwrites the file with generated content
  And the bug in BUGS.md is removed

<!-- TODO -->
# Living: none (initial implementation)
# Action: creates
Scenario: Generated seed SQL applies successfully to database
  Given npm run db:seed:gen has been run
  When I run npm run db:reset
  Then the database contains the expected accommodation types
  And no SQL errors occur

## Notes

### Design Decisions

1. **Zod literal schema as source of truth** - The schema defines exact valid values using `z.literal()`. This provides compile-time type checking and runtime validation. The tuple structure prevents duplicates; `.refine()` ensures non-empty.

2. **ESM compatibility** - Uses `import.meta.url` pattern instead of `__dirname` since the project uses ES modules.

3. **SQL escaping** - Simple single-quote escaping (`'` → `''`). The literal Zod schema prevents injection concerns since all values are known at compile time.

4. **Idempotent SQL** - Uses `ON CONFLICT (id) DO UPDATE` so seed.sql is safe to run multiple times.

5. **Narrow scope** - Only handles accommodation types. Other reference tables (role, location) are not needed for current functionality.

### Files to Create/Modify

- **Create**: `src/lib/testing/generators/accommodationType.ts`
- **Create**: `scripts/generate-seed.ts`
- **Modify**: `src/lib/testing/generators/trip.ts` (use real accommodation type IDs)
- **Modify**: `src/lib/testing/createFakeApi.ts` (export ACCOMMODATION_TYPES)
- **Modify**: `tsconfig.node.json` (include scripts directory)
- **Modify**: `package.json` (add db:seed:gen script)
- **Regenerate**: `supabase/seed.sql` (generated, not manually edited)
- **Modify**: `BUGS.md` (remove fixed bug)
