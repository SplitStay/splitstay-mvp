CREATE TABLE public.accommodation_type (
  id text NOT NULL,
  name text NOT NULL,
  displayOrder integer NOT NULL DEFAULT 0,
  createdAt timestamp with time zone NOT NULL DEFAULT now(),
  updatedAt timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT accommodation_type_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversations (
  is_archived_by_user2 boolean NOT NULL DEFAULT false,
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_archived_by_user1 boolean NOT NULL DEFAULT false,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.user(id),
  CONSTRAINT conversations_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.user(id)
);
CREATE TABLE public.email_notifications (
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  body text NOT NULL,
  sent_at timestamp with time zone,
  error_message text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.location (
  city text NOT NULL,
  country text NOT NULL,
  countryCode text NOT NULL,
  displayName text NOT NULL,
  latitude numeric,
  longitude numeric,
  region text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT location_pkey PRIMARY KEY (id)
);
CREATE TABLE public.message_delivery_log (
  message_id uuid,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['sent'::text, 'delivered'::text, 'failed'::text, 'read'::text])),
  user_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
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
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  message_type text DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'system'::text])),
  metadata jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone,
  edited_at timestamp with time zone,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.user(id)
);
CREATE TABLE public.messaging_performance_log (
  operation text NOT NULL,
  duration_ms integer NOT NULL,
  user_id uuid,
  conversation_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT messaging_performance_log_pkey PRIMARY KEY (id),
  CONSTRAINT messaging_performance_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id),
  CONSTRAINT messaging_performance_log_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.request (
  userId uuid,
  tripId uuid,
  message text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status USER-DEFINED DEFAULT 'pending'::request_status,
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT request_pkey PRIMARY KEY (id),
  CONSTRAINT request_tripid_fkey FOREIGN KEY (tripId) REFERENCES public.trip(id),
  CONSTRAINT request_userId_fkey FOREIGN KEY (userId) REFERENCES public.user(id)
);
CREATE TABLE public.review (
  reviewerId uuid,
  revieweeId uuid,
  tripId uuid,
  stars USER-DEFINED NOT NULL,
  comment text NOT NULL,
  imageUrl text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT review_pkey PRIMARY KEY (id),
  CONSTRAINT review_revieweeId_fkey FOREIGN KEY (revieweeId) REFERENCES public.user(id),
  CONSTRAINT review_tripid_fkey FOREIGN KEY (tripId) REFERENCES public.trip(id),
  CONSTRAINT review_reviewerId_fkey FOREIGN KEY (reviewerId) REFERENCES public.user(id)
);
CREATE TABLE public.role (
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  level integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT role_pkey PRIMARY KEY (id)
);
CREATE TABLE public.room (
  villa_id uuid NOT NULL,
  name text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pictures ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  description text,
  occupant_id uuid,
  CONSTRAINT room_pkey PRIMARY KEY (id),
  CONSTRAINT room_occupant_id_fkey FOREIGN KEY (occupant_id) REFERENCES auth.users(id),
  CONSTRAINT room_villa_id_fkey FOREIGN KEY (villa_id) REFERENCES public.villa(id)
);
CREATE TABLE public.room_request (
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'declined'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT room_request_pkey PRIMARY KEY (id),
  CONSTRAINT room_request_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.room(id),
  CONSTRAINT room_request_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.trip (
  accommodationTypeId text,
  personalNote text,
  vibe text,
  name text NOT NULL,
  tripLink character varying UNIQUE,
  estimatedmonth text,
  estimatedyear text,
  numberofrooms integer,
  rooms jsonb,
  matchwith text CHECK (matchwith = ANY (ARRAY['male'::text, 'female'::text, 'anyone'::text])),
  ispublic boolean DEFAULT true,
  startDate date,
  endDate date,
  description text NOT NULL,
  location text NOT NULL,
  locationId uuid,
  hostId uuid,
  joineeId uuid,
  bookingUrl text,
  thumbnailUrl text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  flexible boolean NOT NULL DEFAULT false,
  CONSTRAINT trip_pkey PRIMARY KEY (id),
  CONSTRAINT trip_locationId_fkey FOREIGN KEY (locationId) REFERENCES public.location(id),
  CONSTRAINT trip_hostId_fkey FOREIGN KEY (hostId) REFERENCES public.user(id),
  CONSTRAINT trip_joineeId_fkey FOREIGN KEY (joineeId) REFERENCES public.user(id),
  CONSTRAINT trip_accommodation_type_id_fkey FOREIGN KEY (accommodationTypeId) REFERENCES public.accommodation_type(id)
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
  languages jsonb,
  learningLanguages jsonb,
  mostInfluencedCountry text,
  mostInfluencedCountryDescription text,
  mostInfluencedExperience text,
  travelPhotos jsonb,
  travelTraits jsonb,
  whatsapp text,
  profileCreated boolean DEFAULT false,
  shareModalShown boolean DEFAULT false,
  createdAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updatedAt timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  role_id uuid,
  CONSTRAINT user_pkey PRIMARY KEY (id),
  CONSTRAINT user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id),
  CONSTRAINT user_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_presence (
  user_id uuid NOT NULL,
  typing_in_conversation_id uuid,
  is_online boolean NOT NULL DEFAULT false,
  last_seen_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  device_info jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT user_presence_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id),
  CONSTRAINT user_presence_typing_in_conversation_id_fkey FOREIGN KEY (typing_in_conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.villa (
  name text NOT NULL,
  location text NOT NULL,
  location_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pictures ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  description text,
  created_by uuid,
  CONSTRAINT villa_pkey PRIMARY KEY (id),
  CONSTRAINT villa_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT villa_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.location(id)
);