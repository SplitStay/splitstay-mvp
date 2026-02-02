@technical @seed-data
Feature: Seed Data Generator
  As a developer
  I want seed data generated from TypeScript source of truth
  So that I avoid dual maintenance of reference data

  # Accommodation Type Definitions
  @accommodation-types
  Scenario: Accommodation types are defined with strict validation
    Given the accommodation type definitions in src/lib/testing/generators/accommodationType.ts
    When the module loads
    Then valid data includes id, name, and display order for each type
    And validation fails if data is empty
    And validation fails if data does not match expected literal values

  # SQL Generation
  @sql-generation
  Scenario: Generator script produces valid seed SQL
    Given accommodation types are defined in the fake data API
    When I run npm run db:seed:gen
    Then supabase/seed.sql is created
    And the file has a header marking it as generated
    And the SQL uses ON CONFLICT for idempotency
    And string values are properly escaped

  # Test Data Generators
  @test-generators
  Scenario: Trip generator uses valid accommodation type IDs
    Given accommodation types are defined in the fake data API
    When createTrip is called without an accommodationTypeId override
    Then the generated trip has a valid accommodationTypeId from the defined types

  @test-generators
  Scenario: Fake API exports accommodation types
    Given the createFakeApi function in src/lib/testing/createFakeApi.ts
    When I call createFakeApi()
    Then the returned object includes ACCOMMODATION_TYPES

  # Build Configuration
  @build-config
  Scenario: TypeScript configuration includes scripts directory
    Given tsconfig.node.json exists
    When I add scripts to the include array
    Then scripts/*.ts files are type-checked

  @build-config
  Scenario: npm script runs the generator
    Given package.json has a db:seed:gen script
    When I run npm run db:seed:gen
    Then the generator executes via tsx
    And supabase/seed.sql is regenerated
    And the script exits with code 0 on success
    And the script exits with code 1 on any error

  # Database Seeding
  @database
  Scenario: Remove manual seed.sql and regenerate
    Given a manually created supabase/seed.sql exists
    When the generator runs
    Then it overwrites the file with generated content

  @database
  Scenario: Generated seed SQL applies successfully to database
    Given npm run db:seed:gen has been run
    When I run npm run db:reset
    Then the database contains the expected accommodation types
    And no SQL errors occur
