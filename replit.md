# SplitStay - Travel Roommate Matching Application

## Overview

SplitStay is a full-stack web application that helps solo travelers find compatible roommates to share hotel accommodations and reduce costs. The application is built as a mobile-first progressive web app that connects verified travelers, facilitates cost splitting, and enables social connections during travel.

## System Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design
- **State Management**: TanStack Query for server state and React hooks for local state
- **Authentication**: Session-based authentication with secure cookie handling

## Key Components

### Frontend Architecture
- **React Router**: Using Wouter for lightweight client-side routing
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **Mobile-First Design**: Responsive design optimized for mobile devices with desktop fallback

### Backend Architecture
- **Express Server**: RESTful API endpoints with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store
- **File Handling**: Static file serving for profile images and assets

### Database Schema
- **Users**: Profile information, verification status, preferences, and emergency contacts
- **Hotels**: Accommodation details and amenities
- **Bookings**: Reservation information with dynamic pricing
- **Booking Participants**: Many-to-many relationship between users and bookings
- **Messages**: Chat functionality between matched users
- **Reviews**: Post-stay rating and feedback system
- **Research Data**: User behavior tracking and feedback collection

### Authentication & Security
- **Verification System**: Multi-level verification including ID, phone, email, and social media
- **Emergency Contacts**: Safety feature requiring emergency contact information
- **Session Security**: Secure session cookies with proper expiration handling

## Data Flow

1. **User Registration**: Users create profiles with personal information and travel preferences
2. **Roommate Search**: Location-based search with date filtering and preference matching
3. **Profile Browsing**: Filtered results with detailed profile cards and compatibility indicators
4. **Booking Request**: Users can request to book shared accommodations with matched roommates
5. **Communication**: Built-in messaging system for coordinating travel plans
6. **Stay Management**: Check-in flow, guest information, and real-time communication with hotel
7. **Post-Stay**: Review system for rating roommates and providing feedback

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL via Neon serverless
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Validation**: Zod for runtime type checking and form validation
- **Date Handling**: date-fns for consistent date formatting and calculations
- **Analytics**: Google Analytics for user behavior tracking

### Development Dependencies
- **Build Tools**: Vite for fast development and optimized production builds
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast bundling for server-side code

## Deployment Strategy

The application is configured for deployment on Replit with autoscaling:

- **Development**: `npm run dev` starts both frontend and backend in watch mode
- **Production Build**: `npm run build` creates optimized client bundle and server build
- **Production Start**: `npm run start` runs the production server
- **Database**: PostgreSQL module provisioned automatically on Replit
- **Port Configuration**: Server runs on port 5000, mapped to external port 80

## Changelog

- July 7, 2025: Fixed mobile navigation and restored login button - made navigation visible on all screen sizes, fixed "Get Started" button on "How it Works" page to navigate to profile creation, restored missing "Already have a profile? Log in" button below "Create My Profile" button
- July 6, 2025: Enhanced form validation and UX - renamed left panel to "Tell us about you", added required "Where are you from?" field with country dropdown, improved travel photo display size (80px), implemented comprehensive country validation for both origin and travel experience sections, added 32px vertical spacing between sections
- July 6, 2025: Final layout refinement - moved travel photos to right panel, improved spacing between sections (space-y-6), expanded container to 1350px max-width, eliminated scrollbars for optimal desktop experience
- July 6, 2025: Final MVP optimization - moved countries to travel section, implemented flex-wrap for traits with fixed height, added scroll containers for max height sections, balanced left/right panel heights for 1280px+ screens
- July 6, 2025: Optimized profile form layout - added travel photos upload (max 3), grouped inputs in side-by-side rows, implemented 2-column grid for traits, reduced padding/margins to eliminate scrolling on laptop screens
- July 6, 2025: Created combined side-by-side profile creation form with Step 1 (left panel) and Step 2 (right panel), responsive design that stacks on mobile, sticky footer with form validation
- July 6, 2025: Restored original beautiful landing page with badges, progress indicators, and detailed sections while maintaining profile form integration
- July 6, 2025: Integrated profile creation form directly into main landing page, removing intermediate navigation step
- July 6, 2025: Fixed persistent routing issues by implementing custom pathname-based routing solution, bypassing wouter dependency
- July 6, 2025: Completed two-step profile creation form with all web-first MVP optimizations
- July 6, 2025: Fixed server configuration for Vite development middleware and client-side routing issues
- July 6, 2025: Implemented two-step profile creation form with web-optimized design improvements
- June 18, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.