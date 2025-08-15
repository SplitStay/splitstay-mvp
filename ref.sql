-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.accommodation_type (
  id text NOT NULL,
  name text NOT NULL,
  displayOrder integer NOT NULL DEFAULT 0,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT accommodation_type_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_archived_by_user1 boolean NOT NULL DEFAULT false,
  is_archived_by_user2 boolean NOT NULL DEFAULT false,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.user(id),
  CONSTRAINT conversations_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.user(id)
);
CREATE TABLE public.email_notifications (
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
CREATE TABLE public.location (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL,
  countryCode text NOT NULL,
  displayName text NOT NULL,
  latitude numeric,
  longitude numeric,
  region text,
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT location_pkey PRIMARY KEY (id)
);
CREATE TABLE public.message_delivery_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['sent'::text, 'delivered'::text, 'failed'::text, 'read'::text])),
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT message_delivery_log_pkey PRIMARY KEY (id),
  CONSTRAINT message_delivery_log_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id),
  CONSTRAINT message_delivery_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id)
);
CREATE TABLE public.message_read_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT message_read_status_pkey PRIMARY KEY (id),
  CONSTRAINT message_read_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id),
  CONSTRAINT message_read_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone,
  edited_at timestamp with time zone,
  message_type text DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'system'::text])),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.user(id)
);
CREATE TABLE public.messaging_performance_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  operation text NOT NULL,
  duration_ms integer NOT NULL,
  user_id uuid,
  conversation_id uuid,
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT messaging_performance_log_pkey PRIMARY KEY (id),
  CONSTRAINT messaging_performance_log_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messaging_performance_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id)
);
CREATE TABLE public.request (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  userId uuid,
  tripId uuid,
  status USER-DEFINED DEFAULT 'pending'::request_status,
  message text,
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT request_pkey PRIMARY KEY (id),
  CONSTRAINT request_userId_fkey FOREIGN KEY (userId) REFERENCES public.user(id),
  CONSTRAINT request_tripid_fkey FOREIGN KEY (tripId) REFERENCES public.trip(id)
);
CREATE TABLE public.review (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reviewerId uuid,
  revieweeId uuid,
  tripId uuid,
  stars USER-DEFINED NOT NULL,
  comment text NOT NULL,
  imageUrl text,
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT review_pkey PRIMARY KEY (id),
  CONSTRAINT review_tripid_fkey FOREIGN KEY (tripId) REFERENCES public.trip(id),
  CONSTRAINT review_reviewerId_fkey FOREIGN KEY (reviewerId) REFERENCES public.user(id),
  CONSTRAINT review_revieweeId_fkey FOREIGN KEY (revieweeId) REFERENCES public.user(id)
);
CREATE TABLE public.role (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT role_pkey PRIMARY KEY (id)
);
CREATE TABLE public.room (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  villa_id uuid NOT NULL,
  name text NOT NULL,
  pictures ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  description text,
  occupant_id uuid,
  CONSTRAINT room_pkey PRIMARY KEY (id),
  CONSTRAINT room_villa_id_fkey FOREIGN KEY (villa_id) REFERENCES public.villa(id),
  CONSTRAINT room_occupant_id_fkey FOREIGN KEY (occupant_id) REFERENCES auth.users(id)
);
CREATE TABLE public.room_request (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'declined'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT room_request_pkey PRIMARY KEY (id),
  CONSTRAINT room_request_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT room_request_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.room(id)
);
CREATE TABLE public.trip (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  locationId uuid,
  startDate date,
  endDate date,
  hostId uuid,
  joineeId uuid,
  bookingUrl text,
  thumbnailUrl text,
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  accommodationTypeId text,
  personalNote text,
  vibe text,
  tripLink character varying UNIQUE,
  flexible boolean NOT NULL DEFAULT false,
  CONSTRAINT trip_pkey PRIMARY KEY (id),
  CONSTRAINT trip_accommodation_type_id_fkey FOREIGN KEY (accommodationTypeId) REFERENCES public.accommodation_type(id),
  CONSTRAINT trip_joineeId_fkey FOREIGN KEY (joineeId) REFERENCES public.user(id),
  CONSTRAINT trip_hostId_fkey FOREIGN KEY (hostId) REFERENCES public.user(id),
  CONSTRAINT trip_locationId_fkey FOREIGN KEY (locationId) REFERENCES public.location(id)
);
CREATE TABLE public.user (
  id uuid NOT NULL,
  email text NOT NULL,
  name text,
  bio text,
  birthPlace text,
  currentPlace text,
  dayOfBirth integer,
  monthOfBirth integer,
  yearOfBirth integer,
  gender text,
  imageUrl text,
  profilePicture text,
  instagramUrl text,
  personalizedLink text,
  profileCreated boolean DEFAULT false,
  shareModalShown boolean DEFAULT false,
  languages jsonb,
  learningLanguages jsonb,
  mostInfluencedCountry text,
  mostInfluencedCountryDescription text,
  mostInfluencedExperience text,
  travelPhotos jsonb,
  travelTraits jsonb,
  whatsapp text,
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  role_id uuid,
  CONSTRAINT user_pkey PRIMARY KEY (id),
  CONSTRAINT user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id),
  CONSTRAINT user_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_presence (
  user_id uuid NOT NULL,
  is_online boolean NOT NULL DEFAULT false,
  last_seen_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  typing_in_conversation_id uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  device_info jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT user_presence_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id),
  CONSTRAINT user_presence_typing_in_conversation_id_fkey FOREIGN KEY (typing_in_conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.villa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  location_id uuid,
  pictures ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  description text,
  created_by uuid,
  CONSTRAINT villa_pkey PRIMARY KEY (id),
  CONSTRAINT villa_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT villa_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.location(id)
);