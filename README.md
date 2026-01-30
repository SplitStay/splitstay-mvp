# SplitStay

A platform for travelers to share accommodations and split costs.

## Prerequisites

- Node.js 20+
- Docker Desktop or Podman (for local Supabase)
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp src/.env.example .env
```

For local development, use these values:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<from npm run db:start output>
VITE_APP_URL=http://localhost:5173
```

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

## Podman Users

If using Podman instead of Docker, add this to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
export DOCKER_HOST=unix:///run/user/1000/podman/podman.sock
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Query for server state
- Supabase (PostgreSQL, Auth, Realtime, Storage)
- Biome for linting/formatting

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
└── migrations/     # Database migrations
```
