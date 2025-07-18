# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React 19 + TypeScript + Vite frontend application with Supabase backend integration.

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Framee Motion
- **Styling**: Tailwind CSS v4 with shadcn/ui components + Framer Motion for Animations
- **Backend**: Supabase (PostgreSQL database, auth, realtime)
- **Build Tool**: Vite with SWC for fast refresh
- **UI Library**: shadcn/ui (New York style variant)

### Database Schema
The application uses Supabase with the following main entities:
- **Users**: Basic user information (email, name, location, imageUrl)
- **Trips**: Travel trips with host/joinee relationships
- **Chats**: Trip-related messaging with participants
- **Messages**: Individual chat messages
- **Requests**: Trip join requests with status tracking
- **Reviews**: Trip reviews with star ratings

Key relationships:
- Trips have hosts and joinees (both users)
- Chats belong to trips and have multiple participants
- Messages belong to chats and participants
- Requests link users to trips they want to join

### Project Structure
- `src/App.tsx` - Main application component (currently boilerplate)
- `src/types/database.types.ts` - Auto-generated Supabase TypeScript types
- `src/lib/utils.ts` - Utility functions (currently just className merger)
- `supabase/config.toml` - Supabase local development configuration

### Key Configuration
- Path alias `@/*` maps to `src/*` for imports
- TypeScript with strict configuration
- Supabase local development on port 54321
- shadcn/ui components configured with Lucide icons
- ESLint with React and TypeScript rules

### Development Notes
- Uses Supabase local development environment
- Database types are generated from Supabase schema
- Currently appears to be in early development stage (still has Vite boilerplate)
- No custom components or business logic implemented yet

On inserting a row in the database in the auth.users, this trigger is executed to insert the data in the public.user table:

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.raw_user_meta_data ? 'avatar_url' then
    -- avatar_url key exists
    insert into public."user" (id, email, name, "imageUrl")
    values (
      new.id,
      new.raw_user_meta_data ->> 'email',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'avatar_url'
    );
  else
    -- no avatar_url: omit that column (uses its default or NULL)
    insert into public."user" (id, email, name)
    values (
      new.id,
      new.raw_user_meta_data ->> 'email',
      new.raw_user_meta_data ->> 'full_name'
    );
  end if;

  return new;
end;
$$;

-- (re‑)create the trigger so it picks up the new function:
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

To establish the relations between both of them, this modification is done:

alter table public."user"
add constraint user_id_fkey
foreign key (id)
references auth.users(id)
on delete cascade;


### Responsive Design Requirements

Forms and UI components should be optimized for both mobile and desktop experiences:

**Mobile-First Approach:**
- Forms should be narrow and vertically optimized for mobile devices
- Use appropriate spacing for touch interfaces
- Maintain full functionality on small screens

**Desktop Enhancements:**
- Increase form width on larger screens (lg: breakpoint and above)
- Reduce vertical spacing/padding on desktop to prevent excessive white space
- Use responsive utility classes: `lg:max-w-lg`, `lg:p-8`, `lg:mb-6`, etc.
- Consider wider layouts for complex forms like PostTripPage (`lg:max-w-4xl`)

**Implementation Guidelines:**
- Use Tailwind's responsive prefixes (`lg:`) for desktop-specific styling
- Maintain existing mobile functionality while enhancing desktop experience
- Keep forms visually balanced across all screen sizes

**Important**
Always use the database types as defined by supabase