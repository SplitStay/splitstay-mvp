-- Supplier intake tables: event, supplier, property_listing, property_room
-- These tables support the supplier flow where professional STR managers
-- list multi-bedroom properties for event-scoped room-by-room booking.

-- pg_trgm enables fuzzy text matching for event name detection from WhatsApp messages
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Events that suppliers can list properties against
CREATE TABLE IF NOT EXISTS "public"."event" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "location" text NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "event_name_key" UNIQUE ("name"),
    CONSTRAINT "event_end_date_check" CHECK (end_date >= start_date),
    CONSTRAINT "event_name_length_check" CHECK (length(name) <= 200),
    CONSTRAINT "event_location_length_check" CHECK (length(location) <= 500)
);

-- GIN trigram index for fuzzy matching event names from WhatsApp messages
CREATE INDEX "idx_event_name_trgm" ON "public"."event" USING gin ("name" gin_trgm_ops);

-- Suppliers: property owners/managers/agents who provide inventory
CREATE TABLE IF NOT EXISTS "public"."supplier" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "phone_number" text NOT NULL,
    "name" text NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supplier_phone_number_key" UNIQUE ("phone_number"),
    CONSTRAINT "supplier_name_length_check" CHECK (length(name) <= 200),
    CONSTRAINT "supplier_phone_length_check" CHECK (length(phone_number) <= 50)
);

-- Property listings: a supplier's property listed for a specific event
CREATE TABLE IF NOT EXISTS "public"."property_listing" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "supplier_id" uuid NOT NULL,
    "event_id" uuid NOT NULL,
    "location" text NOT NULL,
    "accommodation_type_id" text,
    "num_bedrooms" integer NOT NULL,
    "price_per_night" numeric NOT NULL,
    "house_rules" text,
    "status" text NOT NULL DEFAULT 'confirmed',
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT "property_listing_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_listing_supplier_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id"),
    CONSTRAINT "property_listing_event_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id"),
    CONSTRAINT "property_listing_accommodation_type_fkey" FOREIGN KEY ("accommodation_type_id") REFERENCES "public"."accommodation_type"("id"),
    CONSTRAINT "property_listing_num_bedrooms_check" CHECK (num_bedrooms >= 1),
    CONSTRAINT "property_listing_price_check" CHECK (price_per_night > 0),
    CONSTRAINT "property_listing_status_check" CHECK (status IN ('confirmed', 'approved', 'rejected')),
    CONSTRAINT "property_listing_location_length_check" CHECK (length(location) <= 500),
    CONSTRAINT "property_listing_house_rules_length_check" CHECK (length(house_rules) <= 2000),
    CONSTRAINT "property_listing_supplier_event_key" UNIQUE ("supplier_id", "event_id")
);

CREATE INDEX "idx_property_listing_event_status" ON "public"."property_listing" USING btree ("event_id", "status");

-- Individual rooms within a property listing
CREATE TABLE IF NOT EXISTS "public"."property_room" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "property_listing_id" uuid NOT NULL,
    "room_number" integer NOT NULL,
    "available_from" date NOT NULL,
    "available_to" date NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT "property_room_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_room_listing_fkey" FOREIGN KEY ("property_listing_id") REFERENCES "public"."property_listing"("id") ON DELETE CASCADE,
    CONSTRAINT "property_room_dates_check" CHECK (available_to >= available_from),
    CONSTRAINT "property_room_listing_number_key" UNIQUE ("property_listing_id", "room_number")
);

-- RLS: event table - authenticated can read, admin (service role) can write
ALTER TABLE "public"."event" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_select_authenticated" ON "public"."event"
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "event_all_service_role" ON "public"."event"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS: supplier, property_listing, property_room - service role only
ALTER TABLE "public"."supplier" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supplier_all_service_role" ON "public"."supplier"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "public"."property_listing" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_listing_all_service_role" ON "public"."property_listing"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "public"."property_room" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_room_all_service_role" ON "public"."property_room"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Find events matching a message body using trigram word similarity
CREATE OR REPLACE FUNCTION "public"."find_matching_events"(
    p_message_body text
) RETURNS TABLE (id uuid, name text, start_date date, end_date date, location text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    RETURN QUERY
    SELECT e.id, e.name, e.start_date, e.end_date, e.location
    FROM public.event e
    WHERE e.end_date >= CURRENT_DATE
    AND public.word_similarity(e.name, p_message_body) > 0.4
    ORDER BY public.word_similarity(e.name, p_message_body) DESC;
END;
$$;

-- Check if a supplier already has a listing for an event
CREATE OR REPLACE FUNCTION "public"."find_property_listing_exists"(
    p_phone_number text,
    p_event_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.property_listing pl
        JOIN public.supplier s ON s.id = pl.supplier_id
        WHERE s.phone_number = p_phone_number
        AND pl.event_id = p_event_id
    );
END;
$$;

-- Atomic function to save a complete property listing with rooms
CREATE OR REPLACE FUNCTION "public"."save_property_listing"(
    p_phone_number text,
    p_supplier_name text,
    p_event_id uuid,
    p_location text,
    p_accommodation_type_id text,
    p_num_bedrooms integer,
    p_price_per_night numeric,
    p_house_rules text,
    p_rooms jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_supplier_id uuid;
    v_listing_id uuid;
    v_event_record record;
    v_room record;
BEGIN
    -- Look up the event to validate room dates
    SELECT id, start_date, end_date INTO v_event_record
    FROM public.event
    WHERE id = p_event_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found: %', p_event_id;
    END IF;

    -- Validate all room dates fall within the event window
    FOR v_room IN SELECT * FROM jsonb_to_recordset(p_rooms)
        AS x(room_number integer, available_from date, available_to date)
    LOOP
        IF v_room.available_from < v_event_record.start_date THEN
            RAISE EXCEPTION 'Room % available_from (%) is before event start date (%)',
                v_room.room_number, v_room.available_from, v_event_record.start_date;
        END IF;
        IF v_room.available_to > v_event_record.end_date THEN
            RAISE EXCEPTION 'Room % available_to (%) is after event end date (%)',
                v_room.room_number, v_room.available_to, v_event_record.end_date;
        END IF;
    END LOOP;

    -- Upsert supplier by phone number
    INSERT INTO public.supplier (phone_number, name)
    VALUES (p_phone_number, p_supplier_name)
    ON CONFLICT (phone_number) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = now()
    RETURNING id INTO v_supplier_id;

    -- Insert property listing
    INSERT INTO public.property_listing (
        supplier_id, event_id, location, accommodation_type_id,
        num_bedrooms, price_per_night, house_rules, status
    ) VALUES (
        v_supplier_id, p_event_id, p_location, p_accommodation_type_id,
        p_num_bedrooms, p_price_per_night, p_house_rules, 'confirmed'
    ) RETURNING id INTO v_listing_id;

    -- Insert rooms
    INSERT INTO public.property_room (property_listing_id, room_number, available_from, available_to)
    SELECT v_listing_id, x.room_number, x.available_from, x.available_to
    FROM jsonb_to_recordset(p_rooms)
        AS x(room_number integer, available_from date, available_to date);

    RETURN v_listing_id;
END;
$$;
