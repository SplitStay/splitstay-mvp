# SplitStay

A platform for travelers to share accommodations and split costs.

## Prerequisites

- Node.js 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Podman](https://podman.io/) (for local Supabase)
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with local development values:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<from npm run db:start output>
VITE_APP_URL=http://localhost:5173
```

**Podman users:** See the [Podman Users](#podman-users) section before proceeding.

### 3. Start local Supabase

```bash
npm run db:start
```

This starts PostgreSQL, Auth, Storage, and other Supabase services locally. Copy the `anon key` from the output into your `.env` file.

### 4. Apply database migrations

```bash
npm run db:reset
```

### 5. Start the dev server

```bash
npm run dev
```

The app will be available at http://localhost:5173

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run check` | Run Biome lint + format check |
| `npm run check:fix` | Auto-fix lint and format issues |
| `npm run db:start` | Start local Supabase |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:reset` | Reset database and apply migrations |
| `npm run db:gen` | Regenerate TypeScript types and Zod schemas |
| `npm run edge:build` | Bundle edge function source into deployable artifact |
| `npm run edge:serve` | Build and serve edge functions locally |

## Pre-commit Hooks

Git hooks are managed by [Lefthook](https://github.com/evilmartians/lefthook) and installed automatically via `npm install`.

The pre-commit hook runs:
1. **Lint** — Biome lint + format check
2. **Typecheck** — TypeScript compilation
3. **Test** — Unit tests

To run hooks manually: `npx lefthook run pre-commit`

## Database Migrations

Migrations are SQL files that modify the database schema. They run in order and are tracked so each migration only runs once.

### Creating a Migration

```bash
npx supabase migration new <migration_name>
```

This creates `supabase/migrations/YYYYMMDDHHMMSS_<migration_name>.sql`.

**Naming conventions:**
- Use snake_case: `add_user_preferences`, `fix_trip_constraints`
- Be descriptive: `add_hidden_trips_table` not `update_schema`

### Writing Migrations

- Use `CREATE TABLE IF NOT EXISTS` for new tables
- Quote camelCase column names: `"isPublic"`, `"createdAt"` (PostgreSQL lowercases unquoted identifiers, so `isPublic` becomes `ispublic`)
- Always include `created_at`/`updated_at` timestamps with defaults (enables sorting by recency and debugging data issues)

### Testing a Migration

```bash
# 1. Reset database and apply all migrations
npm run db:reset

# 2. Verify the schema is correct
npx supabase db lint

# 3. Test your changes manually or via the app
npm run dev

# 4. Regenerate types and schemas
npm run db:gen

# 5. Verify TypeScript compiles
npm run check
```

### Rolling Back (Local Development)

```bash
# Reset to clean state and reapply all migrations
npm run db:reset
```

For partial rollbacks, manually edit/remove migration files before reset.

## Type Generation Workflow

TypeScript types and [Zod](https://zod.dev/) validation schemas are auto-generated from the database. Zod validates data at runtime and infers TypeScript types from the same definition.

After modifying database migrations:

```bash
npm run db:reset   # Apply migrations
npm run db:gen     # Regenerate types and schemas
```

**Generated files (do not edit):**
- `src/types/database.types.ts` — TypeScript types
- `src/lib/schemas/database.schemas.ts` — Zod schemas

**Application schemas** (e.g., `src/lib/schemas/tripSchema.ts`) import from the generated schemas and add transforms.

## Podman Users

If using Podman instead of Docker, add the following to your `.env` file. Replace `<your-user-id>` with your actual user ID (run `id -u` to find it):

```bash
DOCKER_HOST=unix:///run/user/<your-user-id>/podman/podman.sock
```

## Deployment

See [DEPLOYING.md](DEPLOYING.md) for production deployment instructions, including database migrations, edge functions, and environment variable configuration.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Query for server state
- Supabase (PostgreSQL, Auth, Realtime, Storage)
- Biome for linting/formatting
- Vercel for hosting

## Project Structure

```
src/
├── pages/          # Route components
├── components/     # Shared components
│   └── ui/         # shadcn/ui components
├── contexts/       # React contexts (Auth, GuestMode)
├── hooks/          # Custom hooks
├── lib/            # Service modules (API clients, business logic)
├── types/          # TypeScript types
└── utils/          # Utility functions

supabase/
├── functions/      # Deno edge functions (bundled from _src.ts)
└── migrations/     # Database migrations
```
