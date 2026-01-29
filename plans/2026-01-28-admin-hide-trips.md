# Feature: Trip Moderation

**Created**: 2026-01-28
**Goal**: Allow admin users to hide inappropriate trips from the find-partners listing while preserving them for their owners.

## User Requirements

<!-- DONE -->
Scenario: Admin hides a trip from the public listing
  Given I am logged in as a admin
  And I am on the admin page
  When I hide a trip
  Then the trip no longer appears on the find-partners page for any user

<!-- DONE -->
Scenario: Admin unhides a previously hidden trip
  Given I am logged in as a admin
  And a trip has been hidden
  When I unhide that trip
  Then the trip appears on the find-partners page again

<!-- DONE -->
Scenario: Trip owner sees their hidden trip on their dashboard
  Given my trip has been hidden by a admin
  When I view my dashboard
  Then I see my trip with a "Hidden by admin" indicator

<!-- DONE -->
Scenario: Hidden trip is not viewable by non-owners via direct URL
  Given a trip has been hidden by a admin
  And I am not the trip owner
  When I navigate to the trip's direct URL
  Then I see a not-found page

<!-- DONE -->
Scenario: Hidden trip is not viewable by unauthenticated users via direct URL
  Given a trip has been hidden by a admin
  And I am not logged in
  When I navigate to the trip's direct URL
  Then I see a not-found page

<!-- DONE -->
Scenario: Trip owner can view their hidden trip via direct URL
  Given my trip has been hidden by a admin
  When I navigate to my trip's direct URL
  Then I see my trip's detail page with a "Hidden by admin" indicator

<!-- DONE -->
Scenario: Non-admin user cannot access the admin page
  Given I am logged in as a regular user
  When I navigate to the admin page
  Then I see a not-found page

<!-- DONE -->
Scenario: Unauthenticated user cannot access the admin page
  Given I am not logged in
  When I navigate to the admin page
  Then I am redirected to the login page

<!-- DONE -->
Scenario: Admin sees all trips with their moderation status
  Given I am logged in as a admin
  When I view the admin page
  Then I see a list of all trips with their current visibility status
  And I can distinguish which trips are hidden and which are visible

<!-- DONE -->
Scenario: Admin sees a loading state while trips are being fetched
  Given I am logged in as a admin
  When the admin page is loading trip data
  Then I see a loading indicator

<!-- DONE -->
Scenario: Admin sees an empty state when no trips exist
  Given I am logged in as a admin
  And there are no trips in the system
  When I view the admin page
  Then I see a message indicating there are no trips

<!-- DONE -->
Scenario: Hide/unhide toggle shows progress while the action is in flight
  Given I am logged in as a admin
  And I am on the admin page
  When I toggle a trip's visibility
  Then the toggle is disabled until the action completes

<!-- DONE -->
Scenario: Admin sees an error message when a hide/unhide action fails
  Given I am logged in as a admin
  And I am on the admin page
  When I toggle a trip's visibility and the action fails
  Then I see an error message
  And the trip's visibility status is unchanged

## Technical Specifications

### Infrastructure Prerequisites

- [ ] Create hidden_trips table with tripId (PK, FK to trip ON DELETE CASCADE) and createdAt
- [ ] Create searchable_trips view excluding hidden trips via NOT EXISTS
- [ ] Create admin_users table with userId (FK to auth.users)
- [ ] Configure RLS on hidden_trips and admin_users tables
- [ ] Enable pgTAP extension and create supabase/tests/ directory
- [ ] Regenerate database.types.ts to include hidden_trips and admin_users types
- [ ] Install zod@^4.3.6
- [ ] Install vitest@^4.0.18, jsdom, @testing-library/react@^16.3.0, @testing-library/dom, @testing-library/jest-dom@^6.9.1, @testing-library/user-event@^14.6.1, @amiceli/vitest-cucumber@^5.2.1
- [ ] Configure vitest for React with jsdom environment and vitest-cucumber .feature file binding

### Database Behaviors

<!-- DONE -->
Scenario: Searchable trips excludes hidden trips
  Given a trip exists and has been marked as hidden
  When searchable trips are queried
  Then the hidden trip does not appear in results
  And non-hidden trips still appear

<!-- DONE -->
Scenario: Non-admin cannot hide a trip
  Given a user who is not a admin
  When they attempt to mark a trip as hidden
  Then the operation is rejected

<!-- DONE -->
Scenario: Admin can hide a trip
  Given a user who is a admin
  When they mark a trip as hidden
  Then the operation succeeds

<!-- DONE -->
Scenario: Non-admin cannot unhide a trip
  Given a user who is not a admin
  When they attempt to remove a trip's hidden status
  Then the operation is rejected

<!-- DONE -->
Scenario: Admin can unhide a trip
  Given a user who is a admin
  When they remove a trip's hidden status
  Then the operation succeeds

<!-- DONE -->
Scenario: Non-admin cannot modify admin membership
  Given a user who is not a admin
  When they attempt to grant or revoke admin status
  Then the operation is rejected

<!-- DONE -->
Scenario: User can only read their own admin status
  Given an authenticated user
  When they check admin status
  Then they can only see whether they themselves are a admin
  And they cannot see other users' admin status

### Service Layer

<!-- DONE -->
Scenario: Search results exclude hidden trips
  Given hidden trips exist
  When trips are fetched for the find-partners page
  Then hidden trips are excluded from results

<!-- DONE -->
Scenario: Hidden trip is not fetchable by non-owners
  Given a trip has been hidden
  When a non-owner fetches the trip by ID
  Then the trip is not returned

<!-- DONE -->
Scenario: Trip owner can fetch their own hidden trip
  Given a trip has been hidden
  When the trip owner fetches the trip by ID
  Then the trip is returned

<!-- DONE -->
Scenario: Owner's trip list includes hidden trips with their status
  Given a user has a trip that has been hidden
  When they fetch their own trips for their dashboard
  Then hidden trips are still included
  And each trip indicates whether it is hidden

<!-- DONE -->
Scenario: Hiding a trip persists the hidden state
  Given a tripId
  When the hide action is called
  Then the input is validated
  And the trip is recorded as hidden

<!-- DONE -->
Scenario: Unhiding a trip removes the hidden state
  Given a tripId of a hidden trip
  When the unhide action is called
  Then the input is validated
  And the trip is no longer recorded as hidden

<!-- DONE -->
Scenario: Admin trip list includes all trips with hidden status
  Given trips exist, some hidden and some not
  When the admin trip list is fetched
  Then all trips are returned with host user name and image
  And each trip indicates whether it is hidden

<!-- DONE -->
Scenario: Authenticated user can check their own admin status
  Given an authenticated user
  When they check their admin status
  Then they receive a boolean indicating whether they are a admin

<!-- DONE -->
Scenario: Hiding an already-hidden trip returns an error
  Given a trip that is already hidden
  When the hide action is called for that trip
  Then an error is returned indicating the trip is already hidden

<!-- DONE -->
Scenario: Unhiding a non-hidden trip returns an error
  Given a trip that is not hidden
  When the unhide action is called for that trip
  Then an error is returned indicating the trip is not hidden

<!-- DONE -->
Scenario: Hiding a non-existent trip returns a user-friendly error
  Given an invalid tripId
  When the hide action is called for that tripId
  Then a user-friendly error is returned
  And the error does not leak database details

<!-- DONE -->
Scenario: Service returns user-friendly error when database is unavailable
  Given the database is temporarily unavailable
  When any admin action is attempted
  Then a user-friendly error is returned
  And the error does not leak infrastructure details

### UI Components

<!-- DONE -->
Scenario: Moderator page displays all trips with visibility controls
  Given the admin page is rendered for a admin
  Then it shows a table with: trip name, host name, location, date, visibility status
  And each row has a control to hide or unhide the trip

<!-- DONE -->
Scenario: Hidden trips display a "Hidden by admin" indicator on the owner's dashboard
  Given a trip has been hidden
  When the trip is rendered on the owner's dashboard
  Then a "Hidden by admin" indicator is displayed

## Notes

### Design Decisions
- **hidden_trips linking table**: Moderation status is modeled as a relationship (hidden_trips) rather than a column on the trip table. This avoids the column-level RLS problem entirely — RLS on hidden_trips controls who can hide/unhide, using standard row-level policies. ON DELETE CASCADE cleans up automatically when a trip is deleted.
- **searchable_trips database view**: A SQL view that excludes hidden trips via NOT EXISTS. Testable in pgTAP, and the client queries the view instead of the trip table for find-partners. Keeps the join logic in SQL where it belongs.
- **Separate from isPublic**: User-controlled `isPublic` on the trip table is unrelated to moderation. The two concerns are modeled independently.
- **Admin table in database**: An `admin_users` table determines admin status. No client-side secrets, no env vars leaked in the bundle. Admin identity verified via `auth.uid()` from the cryptographically signed JWT. Admins managed by inserting/deleting rows in the table.
- **Soft hide**: Trips remain in the database and visible to their owners. The find-partners listing and direct URL access (for non-owners) filter them out.
- **Admin page access**: URL-only (`/admin`). No navigation link. Non-admins and unauthenticated users see a 404.
- **First admin bootstrapping**: The first admin row is inserted directly via the Supabase dashboard SQL editor or CLI using the service role key, which bypasses RLS. This avoids the chicken-and-egg problem where only admins can insert into admin_users but none exist yet. Subsequent admins can be added the same way or by an existing admin if that capability is built later.
- **Zod v4-mini**: New service functions use zod/v4-mini for input/output validation at boundaries.
- **RLS enforcement**: Database-level security via Row Level Security on hidden_trips and admin_users tables. No triggers or RPCs needed.
- **pgTAP for database testing**: RLS policies and the searchable_trips view are tested via pgTAP, run with `supabase test db`. Tests simulate authenticated users by setting `request.jwt.claims` (the PostgreSQL config parameter that `auth.uid()` reads from). Each test sets this parameter within a transaction so tests are isolated.
- **@amiceli/vitest-cucumber**: Gherkin scenarios are extracted into `.feature` files and deterministically bound to step definitions in `.spec.ts` files. vitest-cucumber validates that every scenario has matching steps — missing scenarios or steps fail the test run.

### Key Files to Modify
- `src/lib/tripService.ts` — Add `hideTripByAdmin`, `unhideTripByAdmin`, `getAllTripsForAdmin`; modify `searchTrips` to query searchable_trips view; modify `getTripById` to exclude hidden trips for non-owners; modify `getUserTrips` to include hidden status
- `src/lib/adminService.ts` — New service for admin status checks (query admin_users table)
- `src/App.tsx` — Add `/admin` route with `AuthRequiredRoute`
- `src/pages/AdminPage.tsx` — New admin page component
- `src/components/TripCard.tsx` — Add "Hidden by admin" badge
- `src/types/database.types.ts` — Regenerate after migration
- `supabase/migrations/` — Create hidden_trips table, searchable_trips view, admin_users table, enable pgTAP, configure RLS policies
- `supabase/tests/` — pgTAP tests for RLS policies and searchable_trips view
- `vitest.config.ts` — Vitest configuration with jsdom environment
- `src/features/admin-moderation.feature` — Gherkin scenarios for user-facing admin behaviors
- `src/features/admin-moderation-services.feature` — Gherkin scenarios for service layer behaviors
- `src/features/__tests__/admin-moderation.spec.tsx` — Step definitions for user-facing scenarios
- `src/features/__tests__/admin-moderation-services.spec.ts` — Step definitions for service scenarios

### Admin Page UI Design
The admin page must match the existing SplitStay visual style. Reference these patterns:
- **Page layout**: `min-h-screen bg-gray-50` with `max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8` content area. White sticky header with `border-b border-gray-200` (see FindPartnerPage.tsx, DashboardPage.tsx)
- **Card containers**: `bg-white rounded-lg shadow-sm border border-gray-200` with `p-6` padding and `border-b border-gray-200` section dividers (see TripDetailPage.tsx)
- **Typography**: Page title `text-3xl font-bold text-gray-900`, section headings `text-xl font-semibold text-gray-900`, body text `text-gray-700`, meta text `text-xs text-gray-500`
- **Buttons**: Primary `bg-blue-600 hover:bg-blue-700 text-white rounded-lg`, destructive actions use red
- **Badges**: Use the existing shadcn Badge component. Status colors: `bg-green-100 text-green-700` (visible), `bg-red-100 text-red-700` (hidden)
- **Table rows**: White background, `border-b border-gray-200` separators, `hover:bg-gray-50` on hover, `p-4` cell padding
- **Empty state**: Centered icon in `bg-gray-100 rounded-full`, heading, description, CTA button (see DashboardPage.tsx empty states)
- **Loading**: `animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600` spinner
- **Responsive**: Stack columns on mobile (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), full-width buttons on small screens
- **Icons**: lucide-react at `w-5 h-5`, paired with text using `gap-2`

### Table Naming Convention
- Database uses camelCase for columns (`tripId`, `userId`, `createdAt`) matching existing columns: `hostId`, `joineeId`, `isPublic`
- Table names use snake_case (`hidden_trips`, `admin_users`) following PostgreSQL convention

### Dependency Versions (verified 2026-01-28)
All new dependencies have been verified compatible with the existing stack (React 19.1.0, Vite 7.3.1, TypeScript 5.8.3):

| Package | Version | Notes |
|---------|---------|-------|
| zod | ^4.3.6 | No peer dependencies |
| vitest | ^4.0.18 | Supports Vite ^6.0.0 \| ^7.0.0 |
| jsdom | * | Vitest peer dep for component testing |
| @testing-library/react | ^16.3.0 | Supports React 19; requires @testing-library/dom as peer |
| @testing-library/dom | * | Peer dep of @testing-library/react v16+ |
| @testing-library/jest-dom | ^6.9.1 | Framework-agnostic DOM matchers |
| @testing-library/user-event | ^14.6.1 | Framework-agnostic; includes own types |
| @amiceli/vitest-cucumber | ^5.2.1 | Requires vitest ^4.0.4 |
