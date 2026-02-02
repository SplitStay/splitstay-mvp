# Feature: Vitest-Cucumber Integration for BDD Testing

**Created**: 2026-02-02
**Goal**: Enable executable BDD tests by connecting existing Gherkin feature files to Vitest via @amiceli/vitest-cucumber

## Context

Splitstay has 11 feature files in `/features/` serving as living documentation. The `@amiceli/vitest-cucumber` package is installed but not wired up. This plan establishes the test infrastructure and implements the first feature (`authentication.feature`) as a template.

## Design Decisions

1. **Step definitions co-located with source** - Files live at `src/**/__tests__/*.spec.ts` near the code they test
2. **Fixture-based test pattern** - Adopt bc-app's pattern with `test.extend<Fixtures>()` for injected dependencies
3. **vi.mock over MSW** - Mock Supabase client directly (existing pattern) rather than network-level mocking
4. **Mix of unit and component tests** - Choose layer per scenario following testing pyramid (favor unit > component > e2e)
5. **Mock at service boundary, assert on user-visible outcomes** - Tests validate behavior, not implementation wiring

## User Requirements

These scenarios from `features/authentication.feature` will have executable tests:

<!-- DONE -->
Scenario: Sign up with password that is too short
  Given I am on the sign-up page
  When I complete the signup form with a password shorter than 6 characters
  And I click "Sign up"
  Then I should see "Password must be at least 6 characters"
  # Note: This tests client-side validation for UX. Server-side validation is
  # enforced by Supabase's password policy and assumed correct.

<!-- DONE -->
Scenario: Sign-up form requires terms agreement
  Given I am on the sign-up page
  When I fill in all fields but do not check the terms agreement
  Then the "Sign up" button should be disabled

<!-- DONE -->
Scenario: Sign in with valid credentials
  Given I have a confirmed account with a completed profile
  And I am on the sign-in page
  When I enter my email and password
  And I click "Sign in"
  Then I should be redirected to my dashboard

<!-- DONE -->
Scenario: Sign in with invalid credentials
  Given I am on the sign-in page
  When I enter an email and password combination that is incorrect
  And I click "Sign in"
  Then I should see "Invalid login credentials"
  And I should remain on the sign-in page

<!-- DONE -->
Scenario: Sign out
  Given I am signed in
  When I click to sign out
  Then I should be signed out
  And I should be redirected to the landing page

## Technical Specifications

<!-- DONE -->
Scenario: Test fixtures provide injected dependencies
  Given a test file imports the custom test function
  When a test runs
  Then it receives Wrapper, supabaseMock, user, and testData fixtures
  And fixtures are properly typed

<!-- DONE -->
Scenario: Supabase mock fixture intercepts auth calls
  Given a test uses the supabaseMock fixture
  When the component calls supabase.auth methods
  Then the mock intercepts the call
  And returns configured responses

<!-- DONE -->
Scenario: Wrapper fixture provides all required providers
  Given a component requires AuthContext, Router, and QueryClient
  When rendered with the Wrapper fixture
  Then all providers are available
  And the component renders without errors
  And a fresh QueryClient is created per test to prevent state leakage

<!-- DONE -->
Scenario: Step definitions bind to feature file scenarios
  Given a spec file loads features/authentication.feature
  When Vitest runs
  Then each implemented scenario executes as a test
  And unimplemented scenarios are skipped or pending

## Deferred (e2e-only)

These scenarios require browser automation and are out of scope:
- OAuth flows (external redirects)
- Email confirmation (deep-link handling)
- Password reset with token (deep-link handling)
- Rate limiting (timing-dependent)

## File Structure

```
src/
├── test/
│   ├── setup.ts                    # Existing setup
│   ├── fixtures.ts                 # NEW: test.extend<Fixtures>() definition
│   └── renderWithProviders.tsx     # NEW: Wrapper component
├── lib/
│   └── testing/
│       └── supabaseMock.ts         # NEW: Supabase mock factory
├── pages/
│   └── __tests__/
│       └── authentication.spec.ts  # NEW: Step definitions for auth feature
features/
└── authentication.feature          # Existing (unchanged)
```

## Notes

- Start with authentication.feature as the template; patterns established here apply to remaining 10 features
- Existing tests (tripService.test.ts, etc.) continue to work unchanged
- The fixture pattern can be incrementally adopted by other test files
