# Local Development Bootstrap Guide

This document provides context for setting up a high-quality local development environment for SplitStay MVP.

## Development History

### Original Development (May - Sept 2025)

**Phase 1: Replit (May 2025)**
- Author: `connect120@users.noreply.replit.com`
- ~40 commits with auto-generated "Deployed your application" messages
- Development model: Edit in Replit → auto-deploy → test on deployed app
- No local development infrastructure was set up

**Phase 2: Direct commits (July - Sept 2025)**
- Author: `limaj.sulejman@gmail.com`
- ~55 commits with terse messages ("fix", "_", etc.)
- Rapid iteration, likely deploying to test changes
- Database changes made directly in Supabase Dashboard

**Key insight**: The codebase was developed without local development tooling. All testing was done against the production Supabase instance.

### Database Evolution

The database was **not** evolved through migrations. Evidence:
- Schema changes were made directly in Supabase Dashboard
- `ref.sql` at repo root is a manual schema dump (242 lines)
- Ad-hoc SQL scripts at root (`cleanup-users.sql`, `fix_triggers_webhook.sql`)
- Only one migration existed before recent work

## Current State (Post Jan 28, 2026)

### What's Been Set Up

| Component | Status | Notes |
|-----------|--------|-------|
| Test framework | ✅ Done | Vitest + React Testing Library |
| Test setup file | ✅ Done | `src/test/setup.ts` with jest-dom |
| Unit tests | ✅ Started | 19 tests for adminService, tripService |
| Baseline migration | ✅ Done | `00000000000000_baseline.sql` (490 lines) |
| Feature migration | ✅ Done | `20260128000000_admin_moderation.sql` |
| Local Supabase config | ⚠️ Partial | `.env` points to `192.168.1.133:54321` |
| Seed data | ❌ Missing | No `seed.sql` file |
| Integration tests | ❌ Missing | All tests mock Supabase |
| E2E tests | ❌ Missing | No Playwright/Cypress setup |

### Test Infrastructure

```
src/
├── test/
│   └── setup.ts              # jest-dom matchers
├── lib/
│   └── __tests__/
│       ├── adminService.test.ts   # 13 tests
│       └── tripService.test.ts    # 5 tests
└── sanity.test.ts                 # 1 test
```

All existing tests mock `supabase` client - no database integration tests yet.

### Migration Files

```
supabase/migrations/
├── 00000000000000_baseline.sql           # Full schema (from ref.sql)
├── 20240101000000_fix_notifications_and_counters.sql  # Legacy
└── 20260128000000_admin_moderation.sql   # Admin features
```

The baseline migration is idempotent and includes:
- All enums (request_status, review_stars)
- All tables in dependency order (21 tables)
- All indexes
- All triggers and functions

### Environment Configuration

**`.env`** (local development):
```
VITE_SUPABASE_URL=http://192.168.1.133:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
VITE_APP_URL=http://192.168.1.133:5173
```

**`.env.dev`** (production Supabase):
```
VITE_SUPABASE_URL=https://dhqvohruecmttgfkfdeb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_APP_URL=http://localhost:5173
```

### External Services

These environment variables are used but not configured locally:

| Service | Env Var | Purpose | Required? |
|---------|---------|---------|-----------|
| Amplitude | `VITE_AMPLITUDE_API_KEY` | Analytics | Optional |
| Iframely | `VITE_IFRAMELY_API_KEY` | Link previews | Optional |
| LocationIQ | `VITE_LOCATION_IQ_API_KEY` | Geocoding | Feature-dependent |
| Mapbox | `VITE_MAPBOX_ACCESS_TOKEN` | Maps/autocomplete | Feature-dependent |

## Remaining Work

### High Priority

1. **Local Supabase Setup**
   - Verify Docker is running
   - Run `supabase start` to spin up local containers
   - Apply migrations with `supabase db reset`
   - Verify tables are created correctly

2. **Seed Data**
   - Create `supabase/seed.sql` with:
     - Test users (with different roles)
     - Sample trips (public, private, hidden)
     - Sample conversations and messages
     - At least one admin user
   - Document how to reset to clean state

3. **Auth Setup for Local**
   - Configure auth providers in `supabase/config.toml`
   - Create test accounts that work offline
   - Document login flow for local testing

### Medium Priority

4. **Integration Tests**
   - Add tests that hit actual local Supabase
   - Test RLS policies work correctly
   - Test realtime subscriptions
   - Consider separate test database

5. **Mock External Services**
   - Create stubs for Amplitude (or disable in dev)
   - Mock Iframely responses for link previews
   - Mock LocationIQ/Mapbox for location features
   - Document which features degrade gracefully

6. **Dev Scripts**
   - `npm run dev:local` - start with local Supabase
   - `npm run dev:prod` - start with production Supabase
   - `npm run db:reset` - reset local database
   - `npm run db:seed` - seed local database

### Lower Priority

7. **E2E Testing**
   - Set up Playwright or Cypress
   - Create smoke tests for critical flows
   - Document how to run E2E locally

8. **CI/CD**
   - GitHub Actions for test runs
   - Database migration validation
   - Type checking and linting

## Database Schema Reference

Key tables and their relationships:

```
auth.users (Supabase managed)
    │
    ├── public.user (1:1, trigger-synced)
    │       │
    │       ├── trip.hostId (host)
    │       ├── trip.joineeId (joinee)
    │       ├── conversations.user1_id / user2_id
    │       ├── messages.sender_id
    │       ├── request.userId
    │       └── review.reviewerId / revieweeId
    │
    └── admin_users.userId (admin status)

trip
    │
    ├── hidden_trips.tripId (admin moderation)
    ├── request.tripId (join requests)
    └── review.tripId

searchable_trips (VIEW)
    └── trip WHERE ispublic AND NOT hidden
```

## Commands Reference

```bash
# Start development
npm run dev                    # Vite dev server

# Testing
npm run test                   # Watch mode
npm run test:run               # Single run

# Code quality
npm run check                  # Biome lint + format check
npm run check:fix              # Auto-fix issues

# Supabase (when Docker is running)
supabase start                 # Start local Supabase
supabase stop                  # Stop local Supabase
supabase db reset              # Reset and re-run migrations
supabase status                # Check container status
```

## Known Issues

See `BUGS.md` for documented bugs. Key issue:
- Supabase Storage API returns HTTP 400 instead of 403 for authorization errors

## Files to Reference

- `ref.sql` - Original schema dump (useful for understanding current production)
- `supabase/config.toml` - Supabase local configuration
- `src/types/database.types.ts` - Auto-generated TypeScript types
- `.cursor/rules/Project.mdc` - Legacy project documentation
