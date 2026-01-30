# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start Vite dev server with HMR (--host flag exposes to network)
npm run build        # Production build (TypeScript + Vite)
npm run lint         # Biome lint across all files
npm run format       # Biome format with auto-fix
npm run check        # Biome check (lint + format)
npm run check:fix    # Biome check with auto-fix
npm run preview      # Serve production build locally
npm run db:start     # Start local Supabase
npm run db:stop      # Stop local Supabase
npm run db:reset     # Reset database and apply migrations
npm run db:types     # Regenerate TypeScript types from database
npm run db:schemas   # Regenerate Zod schemas from types
npm run db:gen       # Regenerate both types and schemas
```

### Podman Users

If using podman instead of Docker, set `DOCKER_HOST` in your shell profile:

```bash
export DOCKER_HOST=unix:///run/user/1000/podman/podman.sock
```

No test framework is currently configured.

## Architecture

Single-page React 19 application with a Supabase backend (PostgreSQL, auth, realtime). Deployed on Vercel.

### Tech Stack

- **React 19** with TypeScript (strict mode), built with **Vite 7** + SWC
- **Biome** for linting and formatting
- **Tailwind CSS 3** with **shadcn/ui** (New York variant) for components
- **Framer Motion** for animations
- **TanStack Query v5** for server state (5-min stale time, 10-min GC)
- **React Router v7** for client-side routing
- **Supabase** for database, auth (email/password, Google OAuth, Facebook OAuth), and realtime

### Source Layout

```
src/
├── pages/              # Route-level page components
├── components/         # Shared components
│   └── ui/             # shadcn/ui base components
├── contexts/           # AuthContext (Supabase auth), GuestModeContext
├── hooks/              # Custom hooks (useUser)
├── lib/                # Service modules (see below)
├── types/              # TypeScript types, including Supabase-generated database.types.ts
└── utils/              # Utility functions
```

### Service Layer (`src/lib/`)

- **supabase.ts** — Supabase client singleton
- **tripService.ts** — Trip CRUD (create, update, search, delete)
- **chatService.ts** — Conversations, messages, realtime chat
- **presenceService.ts** — User online/offline tracking
- **accommodationService.ts** — Room/accommodation configuration
- **emailService.ts** — Email delivery
- **storageService.ts** — Browser localStorage abstraction
- **locationiq.ts** — Geocoding/location search via LocationIQ
- **iframely.ts** — Link previews via Iframely API
- **amplitude.ts** — Analytics event tracking

### Routing & Auth Guards

Routes in `App.tsx` use three guard components:
- **PublicRoute** — No auth required
- **GuestFriendlyRoute** — Accessible to all, may show different UI for guests
- **AuthRequiredRoute** — Redirects to `/login?redirect=...` if unauthenticated

### Database

Supabase-managed PostgreSQL. Types are auto-generated in `src/types/database.types.ts`. Key entities: users, trips, chats, messages, requests (join requests), reviews. A database trigger (`on_auth_user_created`) syncs `auth.users` inserts to the `public.user` table.

Always use the database types as defined by Supabase.

### Zod Schemas

Zod schemas are auto-generated from the database using [supazod](https://github.com/dohooo/supazod):

1. **Generated schemas** (`src/lib/schemas/database.schemas.ts`) — Auto-generated from Supabase types. Do not edit manually.
2. **Application schemas** (`src/lib/schemas/tripSchema.ts`, etc.) — Import from generated schemas and add application-level transforms (e.g., null-to-default conversions).

After changing database schema:
```bash
npm run db:gen  # Regenerates types and Zod schemas
```

Use standard Zod 4 (`import { z } from 'zod'`), not `zod/v4-mini`.

## Conventions

- **Import alias:** `@/*` maps to `src/*`
- **Styling:** Tailwind CSS utilities + shadcn/ui components + CSS variables for theming. Custom colors: `navy` (brand blue `#1A1E62`), `cream` (background `#F5F1EB`)
- **State:** React Context for auth/guest mode, TanStack Query for server data, local state for component-level concerns
- **Environment variables:** Prefixed with `VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`)
- **Commits:** Never include `Co-Authored-By` or other AI attribution lines in commit messages
