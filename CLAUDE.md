# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start development server with both frontend and backend in watch mode
- `npm run build` - Build production bundle (client + server)
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Apply database schema changes to PostgreSQL

### Database Operations
- Schema is defined in `shared/schema.ts` using Drizzle ORM
- Database URL is required via `DATABASE_URL` environment variable
- Use `npm run db:push` to apply schema changes to the database

## Architecture Overview

SplitStay is a full-stack travel roommate matching application with the following architecture:

### Monorepo Structure
- `client/` - React frontend (Vite + TypeScript)
- `server/` - Express.js backend (Node.js + TypeScript)  
- `shared/` - Shared types and database schema
- `public/` - Static assets and images

### Technology Stack
- **Frontend**: React 18 + TypeScript, Vite build system, Wouter routing
- **Backend**: Express.js with TypeScript, session-based authentication
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations
- **UI**: shadcn/ui components built on Radix UI + Tailwind CSS
- **State**: TanStack Query for server state, React Hook Form + Zod validation
- **Deployment**: Configured for Replit with autoscaling

### Key Path Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/` 
- `@assets/` → `attached_assets/`

## Core Application Flow

1. **User Journey**: Registration → Profile Creation → Roommate Search → Booking Request → Communication → Stay Management → Reviews
2. **Authentication**: Session-based with secure cookies, multi-level verification system
3. **Database Schema**: Users, Hotels, Bookings, Messages, Reviews, Research data
4. **Mobile-First**: Responsive design optimized for mobile with desktop fallback

## Database Schema (Drizzle ORM)

Key tables in `shared/schema.ts`:
- `users` - Profile info, verification status, preferences, emergency contacts
- `hotels` - Accommodation details and amenities  
- `bookings` - Reservation information with dynamic pricing
- `bookingParticipants` - Many-to-many users ↔ bookings
- `messages` - Chat functionality between matched users
- `reviews` - Post-stay rating and feedback system
- `researchData` - User behavior tracking and feedback

## Development Notes

### Form Handling
- React Hook Form + Zod validation throughout
- Form components in `client/src/components/ui/`
- Validation schemas often co-located with forms

### UI Components
- shadcn/ui component library (see `components.json`)
- All components in `client/src/components/ui/`
- Custom components in `client/src/components/`

### Routing
- Uses Wouter for lightweight client-side routing
- Route definitions in `client/src/App.tsx`
- Pages in `client/src/pages/`

### API Structure
- RESTful endpoints defined in `server/routes.ts`
- Request logging middleware for API calls
- Error handling with proper HTTP status codes

### External Integrations
- URL parsing for booking platforms (Booking.com, Airbnb, etc.)
- Google Analytics for user behavior tracking
- Research data collection system for user feedback

## Important Files

- `package.json` - Main scripts and dependencies
- `vite.config.ts` - Frontend build configuration with path aliases
- `drizzle.config.ts` - Database configuration and migrations
- `server/index.ts` - Express server entry point
- `client/src/App.tsx` - React app with routing
- `shared/schema.ts` - Database schema and types
- `replit.md` - Comprehensive project documentation with changelog