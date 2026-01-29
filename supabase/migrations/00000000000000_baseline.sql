-- Baseline Migration: Creates all tables that exist in production
-- This migration is idempotent - safe to run on existing databases
-- Generated from ref.sql schema dump

-- =============================================================================
-- ENUMS
-- =============================================================================

-- request_status enum
DO $$
BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'active', 'declined');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- review_stars enum
DO $$
BEGIN
  CREATE TYPE review_stars AS ENUM ('1', '2', '3', '4', '5');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- TABLES (in dependency order)
-- =============================================================================

-- 1. role (no dependencies)
CREATE TABLE IF NOT EXISTS public.role (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT role_pkey PRIMARY KEY (id)
);

-- 2. user (refs auth.users, role)
CREATE TABLE IF NOT EXISTS public."user" (
  id uuid NOT NULL,
  email text NOT NULL,
  name text,
  bio text,
  "birthPlace" text,
  "currentPlace" text,
  "dayOfBirth" integer,
  "monthOfBirth" integer,
  "yearOfBirth" integer,
  gender text,
  "imageUrl" text,
  "profilePicture" text,
  "instagramUrl" text,
  "personalizedLink" text,
  languages jsonb,
  "learningLanguages" jsonb,
  "mostInfluencedCountry" text,
  "mostInfluencedCountryDescription" text,
  "mostInfluencedExperience" text,
  "travelPhotos" jsonb,
  "travelTraits" jsonb,
  whatsapp text,
  "profileCreated" boolean DEFAULT false,
  "shareModalShown" boolean DEFAULT false,
  "fullName" text,
  "createdAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  role_id uuid,
  CONSTRAINT user_pkey PRIMARY KEY (id)
);

-- Add user foreign keys only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_id_fkey') THEN
    ALTER TABLE public."user" ADD CONSTRAINT user_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_role_id_fkey') THEN
    ALTER TABLE public."user" ADD CONSTRAINT user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id);
  END IF;
END $$;

-- 3. location (no dependencies)
CREATE TABLE IF NOT EXISTS public.location (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL,
  "countryCode" text NOT NULL,
  "displayName" text NOT NULL,
  latitude numeric,
  longitude numeric,
  region text,
  "createdAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT location_pkey PRIMARY KEY (id)
);

-- 4. accommodation_type (no dependencies)
CREATE TABLE IF NOT EXISTS public.accommodation_type (
  id text NOT NULL,
  name text NOT NULL,
  "displayOrder" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT accommodation_type_pkey PRIMARY KEY (id)
);

-- 5. trip (refs user, location, accommodation_type)
CREATE TABLE IF NOT EXISTS public.trip (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  "locationId" uuid,
  "hostId" uuid,
  "joineeId" uuid,
  "accommodationTypeId" text,
  "personalNote" text,
  vibe text,
  "tripLink" character varying UNIQUE,
  estimatedmonth text,
  estimatedyear text,
  numberofrooms integer,
  rooms jsonb,
  matchwith text CHECK (matchwith = ANY (ARRAY['male'::text, 'female'::text, 'anyone'::text])),
  ispublic boolean DEFAULT true,
  "startDate" date,
  "endDate" date,
  "bookingUrl" text,
  "thumbnailUrl" text,
  flexible boolean NOT NULL DEFAULT false,
  "createdAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT trip_pkey PRIMARY KEY (id)
);

-- Add trip foreign keys only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_locationId_fkey') THEN
    ALTER TABLE public.trip ADD CONSTRAINT "trip_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.location(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_hostId_fkey') THEN
    ALTER TABLE public.trip ADD CONSTRAINT "trip_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES public."user"(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_joineeId_fkey') THEN
    ALTER TABLE public.trip ADD CONSTRAINT "trip_joineeId_fkey" FOREIGN KEY ("joineeId") REFERENCES public."user"(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_accommodation_type_id_fkey') THEN
    ALTER TABLE public.trip ADD CONSTRAINT trip_accommodation_type_id_fkey FOREIGN KEY ("accommodationTypeId") REFERENCES public.accommodation_type(id);
  END IF;
END $$;

-- 6. request (refs user, trip)
CREATE TABLE IF NOT EXISTS public.request (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid,
  "tripId" uuid,
  message text,
  status request_status DEFAULT 'pending'::request_status,
  "createdAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT request_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'request_userId_fkey') THEN
    ALTER TABLE public.request ADD CONSTRAINT "request_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'request_tripid_fkey') THEN
    ALTER TABLE public.request ADD CONSTRAINT request_tripid_fkey FOREIGN KEY ("tripId") REFERENCES public.trip(id);
  END IF;
END $$;

-- 7. review (refs user, trip)
CREATE TABLE IF NOT EXISTS public.review (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  "reviewerId" uuid,
  "revieweeId" uuid,
  "tripId" uuid,
  stars review_stars NOT NULL,
  comment text NOT NULL,
  "imageUrl" text,
  "createdAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT review_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'review_reviewerId_fkey') THEN
    ALTER TABLE public.review ADD CONSTRAINT "review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."user"(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'review_revieweeId_fkey') THEN
    ALTER TABLE public.review ADD CONSTRAINT "review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES public."user"(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'review_tripid_fkey') THEN
    ALTER TABLE public.review ADD CONSTRAINT review_tripid_fkey FOREIGN KEY ("tripId") REFERENCES public.trip(id);
  END IF;
END $$;

-- 8. villa (refs auth.users, location)
CREATE TABLE IF NOT EXISTS public.villa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  location_id uuid,
  pictures text[] DEFAULT '{}'::text[],
  description text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT villa_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'villa_created_by_fkey') THEN
    ALTER TABLE public.villa ADD CONSTRAINT villa_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'villa_location_id_fkey') THEN
    ALTER TABLE public.villa ADD CONSTRAINT villa_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.location(id);
  END IF;
END $$;

-- 9. room (refs villa, auth.users)
CREATE TABLE IF NOT EXISTS public.room (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  villa_id uuid NOT NULL,
  name text NOT NULL,
  pictures text[] DEFAULT '{}'::text[],
  description text,
  occupant_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT room_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_villa_id_fkey') THEN
    ALTER TABLE public.room ADD CONSTRAINT room_villa_id_fkey FOREIGN KEY (villa_id) REFERENCES public.villa(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_occupant_id_fkey') THEN
    ALTER TABLE public.room ADD CONSTRAINT room_occupant_id_fkey FOREIGN KEY (occupant_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- 10. room_request (refs room, auth.users)
CREATE TABLE IF NOT EXISTS public.room_request (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'declined'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT room_request_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_request_room_id_fkey') THEN
    ALTER TABLE public.room_request ADD CONSTRAINT room_request_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.room(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_request_user_id_fkey') THEN
    ALTER TABLE public.room_request ADD CONSTRAINT room_request_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- 11. conversations (refs user)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  is_archived_by_user1 boolean NOT NULL DEFAULT false,
  is_archived_by_user2 boolean NOT NULL DEFAULT false,
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_user1_id_fkey') THEN
    ALTER TABLE public.conversations ADD CONSTRAINT conversations_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public."user"(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_user2_id_fkey') THEN
    ALTER TABLE public.conversations ADD CONSTRAINT conversations_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public."user"(id);
  END IF;
END $$;

-- 12. messages (refs conversations, user)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'system'::text])),
  metadata jsonb DEFAULT '{}'::jsonb,
  deleted_at timestamp with time zone,
  edited_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_conversation_id_fkey') THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_fkey') THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public."user"(id);
  END IF;
END $$;

-- 13. message_read_status (refs messages, user)
CREATE TABLE IF NOT EXISTS public.message_read_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT message_read_status_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'message_read_status_message_id_fkey') THEN
    ALTER TABLE public.message_read_status ADD CONSTRAINT message_read_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'message_read_status_user_id_fkey') THEN
    ALTER TABLE public.message_read_status ADD CONSTRAINT message_read_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
  END IF;
END $$;

-- 14. message_delivery_log (refs messages, user)
CREATE TABLE IF NOT EXISTS public.message_delivery_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid,
  user_id uuid,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['sent'::text, 'delivered'::text, 'failed'::text, 'read'::text])),
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT message_delivery_log_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'message_delivery_log_message_id_fkey') THEN
    ALTER TABLE public.message_delivery_log ADD CONSTRAINT message_delivery_log_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'message_delivery_log_user_id_fkey') THEN
    ALTER TABLE public.message_delivery_log ADD CONSTRAINT message_delivery_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
  END IF;
END $$;

-- 15. messaging_performance_log (refs user, conversations)
CREATE TABLE IF NOT EXISTS public.messaging_performance_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  conversation_id uuid,
  operation text NOT NULL,
  duration_ms integer NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT messaging_performance_log_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messaging_performance_log_user_id_fkey') THEN
    ALTER TABLE public.messaging_performance_log ADD CONSTRAINT messaging_performance_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messaging_performance_log_conversation_id_fkey') THEN
    ALTER TABLE public.messaging_performance_log ADD CONSTRAINT messaging_performance_log_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);
  END IF;
END $$;

-- 16. user_presence (refs user, conversations)
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid NOT NULL,
  is_online boolean NOT NULL DEFAULT false,
  last_seen_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  typing_in_conversation_id uuid,
  device_info jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_presence_pkey PRIMARY KEY (user_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_presence_user_id_fkey') THEN
    ALTER TABLE public.user_presence ADD CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_presence_typing_in_conversation_id_fkey') THEN
    ALTER TABLE public.user_presence ADD CONSTRAINT user_presence_typing_in_conversation_id_fkey FOREIGN KEY (typing_in_conversation_id) REFERENCES public.conversations(id);
  END IF;
END $$;

-- 17. email_notifications (no dependencies)
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text])),
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_notifications_pkey PRIMARY KEY (id)
);

-- =============================================================================
-- LEGACY TABLES (from database.types.ts, may overlap with above)
-- These use different naming conventions (chat vs conversations)
-- =============================================================================

-- chat table (legacy naming)
CREATE TABLE IF NOT EXISTS public.chat (
  id text NOT NULL,
  title text NOT NULL,
  "tripId" uuid,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_tripId_trip_id_fk') THEN
    ALTER TABLE public.chat ADD CONSTRAINT "chat_tripId_trip_id_fk" FOREIGN KEY ("tripId") REFERENCES public.trip(id);
  END IF;
END $$;

-- chat_participant table
CREATE TABLE IF NOT EXISTS public.chat_participant (
  id text NOT NULL,
  "chatId" text,
  "userId" uuid,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_participant_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_participant_chatId_chat_id_fk') THEN
    ALTER TABLE public.chat_participant ADD CONSTRAINT "chat_participant_chatId_chat_id_fk" FOREIGN KEY ("chatId") REFERENCES public.chat(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_participant_userId_user_id_fk') THEN
    ALTER TABLE public.chat_participant ADD CONSTRAINT "chat_participant_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id);
  END IF;
END $$;

-- message table (legacy naming - different from messages)
CREATE TABLE IF NOT EXISTS public.message (
  id text NOT NULL,
  "chatId" text,
  "participantId" text,
  content text NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_pkey PRIMARY KEY (id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'message_chatId_chat_id_fk') THEN
    ALTER TABLE public.message ADD CONSTRAINT "message_chatId_chat_id_fk" FOREIGN KEY ("chatId") REFERENCES public.chat(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'message_participantId_chat_participant_id_fk') THEN
    ALTER TABLE public.message ADD CONSTRAINT "message_participantId_chat_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES public.chat_participant(id);
  END IF;
END $$;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public."user" IS 'User profiles linked to auth.users';
COMMENT ON TABLE public.trip IS 'Travel trips posted by users seeking partners';
COMMENT ON TABLE public.request IS 'Join requests from users to trip hosts';
COMMENT ON TABLE public.conversations IS 'Direct message conversations between users';
COMMENT ON TABLE public.messages IS 'Messages within conversations';
