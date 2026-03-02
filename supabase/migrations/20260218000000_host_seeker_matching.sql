-- Host/Seeker Profile Matching: event-scoped matching between hosts and seekers
-- with user-defined compatibility preferences.

-- ============================================================
-- 1. Gender lookup table (3NF normalization)
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."gender" (
    "id" text NOT NULL,
    CONSTRAINT "gender_pkey" PRIMARY KEY ("id")
);

INSERT INTO "public"."gender" ("id") VALUES
    ('man'),
    ('woman'),
    ('trans_man'),
    ('trans_woman'),
    ('non_binary'),
    ('prefer_not_to_say')
ON CONFLICT DO NOTHING;

ALTER TABLE "public"."gender" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gender_select_all" ON "public"."gender"
    FOR SELECT USING (true);

-- ============================================================
-- 2. User table additions: matching preferences
-- ============================================================

ALTER TABLE "public"."user"
    ADD COLUMN IF NOT EXISTS "match_pref_language" text NOT NULL DEFAULT 'dont_care',
    ADD COLUMN IF NOT EXISTS "match_pref_travel_traits" text NOT NULL DEFAULT 'dont_care',
    ADD COLUMN IF NOT EXISTS "match_pref_age" text NOT NULL DEFAULT 'dont_care',
    ADD COLUMN IF NOT EXISTS "match_pref_gender" text NOT NULL DEFAULT 'dont_care',
    ADD COLUMN IF NOT EXISTS "match_age_min" integer,
    ADD COLUMN IF NOT EXISTS "match_age_max" integer;

ALTER TABLE "public"."user"
    ADD CONSTRAINT "user_match_pref_language_check"
        CHECK ("match_pref_language" IN ('must_match', 'prefer', 'dont_care')),
    ADD CONSTRAINT "user_match_pref_travel_traits_check"
        CHECK ("match_pref_travel_traits" IN ('must_match', 'prefer', 'dont_care')),
    ADD CONSTRAINT "user_match_pref_age_check"
        CHECK ("match_pref_age" IN ('must_match', 'prefer', 'dont_care')),
    ADD CONSTRAINT "user_match_pref_gender_check"
        CHECK ("match_pref_gender" IN ('must_match', 'prefer', 'dont_care')),
    ADD CONSTRAINT "user_match_age_min_check"
        CHECK ("match_age_min" IS NULL OR "match_age_min" >= 18),
    ADD CONSTRAINT "user_match_age_max_check"
        CHECK ("match_age_max" IS NULL OR "match_age_max" <= 120),
    ADD CONSTRAINT "user_match_age_range_check"
        CHECK ("match_age_min" IS NULL OR "match_age_max" IS NULL OR "match_age_min" <= "match_age_max");

-- ============================================================
-- 3. User gender preference table (multi-select gender matching)
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."user_gender_preference" (
    "user_id" uuid NOT NULL,
    "gender" text NOT NULL,
    CONSTRAINT "user_gender_preference_pkey" PRIMARY KEY ("user_id", "gender"),
    CONSTRAINT "user_gender_preference_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE,
    CONSTRAINT "user_gender_preference_gender_fkey" FOREIGN KEY ("gender") REFERENCES "public"."gender"("id")
);

ALTER TABLE "public"."user_gender_preference" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_gender_preference_select_own" ON "public"."user_gender_preference"
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_gender_preference_insert_own" ON "public"."user_gender_preference"
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_gender_preference_delete_own" ON "public"."user_gender_preference"
    FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- 4. Event registration table
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."event_registration" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "event_id" uuid NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "event_registration_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "event_registration_user_event_key" UNIQUE ("user_id", "event_id"),
    CONSTRAINT "event_registration_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE,
    CONSTRAINT "event_registration_event_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_event_registration_event" ON "public"."event_registration" USING btree ("event_id");
CREATE INDEX "idx_event_registration_user" ON "public"."event_registration" USING btree ("user_id");

ALTER TABLE "public"."event_registration" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_registration_select_authenticated" ON "public"."event_registration"
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "event_registration_insert_own" ON "public"."event_registration"
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "event_registration_delete_own" ON "public"."event_registration"
    FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- 5. Trip: add event_id FK
-- ============================================================

ALTER TABLE "public"."trip"
    ADD COLUMN IF NOT EXISTS "event_id" uuid;

ALTER TABLE "public"."trip"
    ADD CONSTRAINT "trip_event_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id");

CREATE INDEX "idx_trip_event_id" ON "public"."trip" USING btree ("event_id");

-- ============================================================
-- 6. Trip member table (replaces joineeId)
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."trip_member" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "trip_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "joined_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "trip_member_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "trip_member_trip_user_key" UNIQUE ("trip_id", "user_id"),
    CONSTRAINT "trip_member_trip_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE CASCADE,
    CONSTRAINT "trip_member_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_trip_member_user" ON "public"."trip_member" USING btree ("user_id");

ALTER TABLE "public"."trip_member" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_member_select_authenticated" ON "public"."trip_member"
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "trip_member_insert_own" ON "public"."trip_member"
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Trigger to enforce room-based capacity
CREATE OR REPLACE FUNCTION "public"."check_trip_capacity"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_room_count integer;
    v_member_count integer;
BEGIN
    SELECT COALESCE("numberofrooms", 0) INTO v_room_count
    FROM public.trip
    WHERE id = NEW.trip_id;

    SELECT COUNT(*) INTO v_member_count
    FROM public.trip_member
    WHERE trip_id = NEW.trip_id;

    IF v_member_count >= v_room_count THEN
        RAISE EXCEPTION 'Trip is full: % members for % rooms', v_member_count, v_room_count;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER "trip_member_capacity_check"
    BEFORE INSERT ON "public"."trip_member"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."check_trip_capacity"();

-- ============================================================
-- 7. Migrate joineeId data to trip_member
-- ============================================================

INSERT INTO "public"."trip_member" ("trip_id", "user_id")
SELECT "id", "joineeId"
FROM "public"."trip"
WHERE "joineeId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. Update accept_trip_request to use trip_member
-- ============================================================

CREATE OR REPLACE FUNCTION "public"."accept_trip_request"("p_request_id" uuid, "p_trip_id" uuid, "p_user_id" uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_trip_host_id uuid;
    v_request_user_id uuid;
    v_trip_chat_id uuid;
    v_room_count integer;
    v_member_count integer;
BEGIN
    -- Get trip host and room count
    SELECT "hostId", COALESCE("numberofrooms", 0)
    INTO v_trip_host_id, v_room_count
    FROM public.trip
    WHERE id = p_trip_id;

    -- Verify the user is the host of the trip
    IF v_trip_host_id != p_user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Only the trip host can accept requests'
        );
    END IF;

    -- Check if trip is full (member count >= room count)
    SELECT COUNT(*) INTO v_member_count
    FROM public.trip_member
    WHERE trip_id = p_trip_id;

    IF v_member_count >= v_room_count THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Trip is full'
        );
    END IF;

    -- Get the user who made the request
    SELECT "userId" INTO v_request_user_id
    FROM public.request
    WHERE id = p_request_id AND "tripId" = p_trip_id;

    IF v_request_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Request not found'
        );
    END IF;

    -- Insert into trip_member
    INSERT INTO public.trip_member (trip_id, user_id)
    VALUES (p_trip_id, v_request_user_id)
    ON CONFLICT (trip_id, user_id) DO NOTHING;

    -- Update the request status to 'active'
    UPDATE public.request
    SET status = 'active'
    WHERE id = p_request_id;

    -- Decline all other pending requests for this trip
    UPDATE public.request
    SET status = 'declined'
    WHERE "tripId" = p_trip_id
    AND id != p_request_id
    AND status = 'pending';

    -- Create or get the trip chat
    SELECT id INTO v_trip_chat_id
    FROM public.chat
    WHERE "tripId" = p_trip_id AND type = 'trip';

    IF v_trip_chat_id IS NULL THEN
        INSERT INTO public.chat (title, "tripId", type)
        VALUES ('Trip Chat', p_trip_id, 'trip')
        RETURNING id INTO v_trip_chat_id;
    END IF;

    -- Ensure both users are participants in the trip chat
    INSERT INTO public.chat_participant ("chatId", "userId")
    VALUES
        (v_trip_chat_id, v_trip_host_id),
        (v_trip_chat_id, v_request_user_id)
    ON CONFLICT DO NOTHING;

    RETURN json_build_object(
        'success', true,
        'trip_id', p_trip_id,
        'member_user_id', v_request_user_id,
        'chat_id', v_trip_chat_id
    );
END;
$$;

-- ============================================================
-- 9. Update delete_user_and_data to use trip_member
-- ============================================================

CREATE OR REPLACE FUNCTION "public"."delete_user_and_data"("target_user_id" uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_user_id uuid := target_user_id;
    trip_record record;
    v_first_member_id uuid;
BEGIN
    -- Delete user presence
    DELETE FROM public.user_presence WHERE user_id = v_user_id;

    -- Delete reviews where user is reviewer or reviewee
    DELETE FROM public.review WHERE "reviewerId" = v_user_id OR "revieweeId" = v_user_id;

    -- Handle requests
    DELETE FROM public.request WHERE "userId" = v_user_id;

    -- Handle chat participations and messages
    DELETE FROM public.message WHERE sender_id = v_user_id;
    DELETE FROM public.chat_participant WHERE "userId" = v_user_id;

    -- Delete empty chats (no participants left)
    DELETE FROM public.chat WHERE id NOT IN (
        SELECT DISTINCT "chatId" FROM public.chat_participant
    );

    -- Delete match interests
    DELETE FROM public.match_interest WHERE user_id = v_user_id OR target_user_id = v_user_id;

    -- Delete event registrations
    DELETE FROM public.event_registration WHERE user_id = v_user_id;

    -- Delete gender preferences
    DELETE FROM public.user_gender_preference WHERE user_id = v_user_id;

    -- Remove user from trip_member
    DELETE FROM public.trip_member WHERE user_id = v_user_id;

    -- For each trip hosted by this user, transfer or delete
    FOR trip_record IN
        SELECT id FROM public.trip WHERE "hostId" = v_user_id
    LOOP
        -- Find the first member to transfer ownership to
        SELECT user_id INTO v_first_member_id
        FROM public.trip_member
        WHERE trip_id = trip_record.id
        ORDER BY joined_at ASC
        LIMIT 1;

        IF v_first_member_id IS NOT NULL THEN
            -- Transfer ownership to first member
            UPDATE public.trip
            SET "hostId" = v_first_member_id
            WHERE id = trip_record.id;

            -- Remove new host from members
            DELETE FROM public.trip_member
            WHERE trip_id = trip_record.id AND user_id = v_first_member_id;
        ELSE
            -- No members, safe to delete the trip
            DELETE FROM public.trip WHERE id = trip_record.id;
        END IF;
    END LOOP;

    -- Finally, delete the user from auth.users (cascades to public.user)
    DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- ============================================================
-- 10. Drop joineeId column (data migrated to trip_member)
-- ============================================================

-- Drop the searchable_trips view that depends on joineeId via t.*
DROP VIEW IF EXISTS "public"."searchable_trips";

DROP INDEX IF EXISTS "public"."idx_trip_joinee_id";
ALTER TABLE "public"."trip" DROP CONSTRAINT IF EXISTS "trip_joineeId_fkey";
ALTER TABLE "public"."trip" DROP COLUMN IF EXISTS "joineeId";

-- Recreate searchable_trips view without joineeId
CREATE OR REPLACE VIEW "public"."searchable_trips" AS
SELECT t.*
FROM "public"."trip" t
WHERE t."ispublic" = true
  AND NOT EXISTS (
    SELECT 1 FROM "public"."hidden_trips" ht WHERE ht."tripId" = t.id
  );

GRANT SELECT ON "public"."searchable_trips" TO authenticated;
GRANT SELECT ON "public"."searchable_trips" TO anon;

-- ============================================================
-- 11. Match interest table
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."match_interest" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "event_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "target_user_id" uuid NOT NULL,
    "interested" boolean NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "match_interest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "match_interest_event_users_key" UNIQUE ("event_id", "user_id", "target_user_id"),
    CONSTRAINT "match_interest_event_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE CASCADE,
    CONSTRAINT "match_interest_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE,
    CONSTRAINT "match_interest_target_user_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE,
    CONSTRAINT "match_interest_not_self_check" CHECK ("user_id" != "target_user_id")
);

-- Composite index for mutual match detection
CREATE INDEX "idx_match_interest_reciprocal" ON "public"."match_interest"
    USING btree ("event_id", "target_user_id", "user_id", "interested");

ALTER TABLE "public"."match_interest" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "match_interest_select_own" ON "public"."match_interest"
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "match_interest_insert_own" ON "public"."match_interest"
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "match_interest_update_own" ON "public"."match_interest"
    FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "match_interest_delete_own" ON "public"."match_interest"
    FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- 12. Allow anonymous users to read events
-- ============================================================

CREATE POLICY "event_select_anon" ON "public"."event"
    FOR SELECT TO anon USING (true);

-- ============================================================
-- 13. Trip-event link date overlap validation trigger
-- ============================================================

CREATE OR REPLACE FUNCTION "public"."check_trip_event_date_overlap"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_event_start date;
    v_event_end date;
BEGIN
    IF NEW.event_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT start_date, end_date INTO v_event_start, v_event_end
    FROM public.event
    WHERE id = NEW.event_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found: %', NEW.event_id;
    END IF;

    -- Trip dates must overlap with event dates
    IF NEW."startDate" IS NOT NULL AND NEW."endDate" IS NOT NULL THEN
        IF NEW."endDate" < v_event_start OR NEW."startDate" > v_event_end THEN
            RAISE EXCEPTION 'Trip dates (% to %) do not overlap with event dates (% to %)',
                NEW."startDate", NEW."endDate", v_event_start, v_event_end;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER "trip_event_date_overlap_check"
    BEFORE INSERT OR UPDATE OF "event_id", "startDate", "endDate" ON "public"."trip"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."check_trip_event_date_overlap"();

-- ============================================================
-- 14. Prevent unlinking trip from event when trip has members
-- ============================================================

CREATE OR REPLACE FUNCTION "public"."check_trip_unlink_event"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_member_count integer;
BEGIN
    -- Only check when event_id is being set to NULL (unlinking)
    IF OLD.event_id IS NOT NULL AND NEW.event_id IS NULL THEN
        SELECT COUNT(*) INTO v_member_count
        FROM public.trip_member
        WHERE trip_id = NEW.id;

        IF v_member_count > 0 THEN
            RAISE EXCEPTION 'Cannot unlink trip from event: trip has % member(s)', v_member_count;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER "trip_unlink_event_check"
    BEFORE UPDATE OF "event_id" ON "public"."trip"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."check_trip_unlink_event"();

-- ============================================================
-- 15. Express interest with atomic mutual match detection
-- ============================================================

CREATE OR REPLACE FUNCTION "public"."express_interest"(
    p_event_id uuid,
    p_target_user_id uuid,
    p_interested boolean
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_reciprocal boolean;
    v_is_mutual boolean := false;
    v_conversation_id uuid;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF v_user_id = p_target_user_id THEN
        RAISE EXCEPTION 'Cannot express interest in yourself';
    END IF;

    -- Insert or update interest
    INSERT INTO public.match_interest (event_id, user_id, target_user_id, interested)
    VALUES (p_event_id, v_user_id, p_target_user_id, p_interested)
    ON CONFLICT (event_id, user_id, target_user_id) DO UPDATE
    SET interested = p_interested, updated_at = now();

    -- Check for mutual interest
    IF p_interested THEN
        SELECT interested INTO v_reciprocal
        FROM public.match_interest
        WHERE event_id = p_event_id
        AND user_id = p_target_user_id
        AND target_user_id = v_user_id;

        IF v_reciprocal IS TRUE THEN
            v_is_mutual := true;

            -- Create conversation between matched users
            -- Use the existing conversation pattern (user1_id < user2_id)
            SELECT id INTO v_conversation_id
            FROM public.conversations
            WHERE user1_id = LEAST(v_user_id, p_target_user_id)
            AND user2_id = GREATEST(v_user_id, p_target_user_id);

            IF v_conversation_id IS NULL THEN
                INSERT INTO public.conversations (user1_id, user2_id)
                VALUES (LEAST(v_user_id, p_target_user_id), GREATEST(v_user_id, p_target_user_id))
                RETURNING id INTO v_conversation_id;
            END IF;
        END IF;
    END IF;

    RETURN json_build_object(
        'success', true,
        'is_mutual', v_is_mutual,
        'conversation_id', v_conversation_id
    );
END;
$$;

-- ============================================================
-- 16. Compatibility scoring RPC
-- ============================================================

CREATE OR REPLACE FUNCTION "public"."get_event_matches"(
    p_event_id uuid,
    p_user_id uuid DEFAULT NULL
) RETURNS TABLE (
    user_id uuid,
    name text,
    bio text,
    image_url text,
    gender text,
    languages jsonb,
    travel_traits jsonb,
    year_of_birth integer,
    compatibility_score numeric,
    shared_languages jsonb,
    shared_traits jsonb,
    trip_id uuid,
    trip_name text,
    trip_location text,
    trip_start_date date,
    trip_end_date date,
    number_of_rooms integer,
    accommodation_type text
) LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_user_id uuid := COALESCE(p_user_id, auth.uid());
    v_is_host boolean;
    v_user_languages jsonb;
    v_user_traits jsonb;
    v_pref_language text;
    v_pref_traits text;
    v_pref_age text;
    v_pref_gender text;
    v_age_min integer;
    v_age_max integer;
    v_user_genders text[];
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Determine if caller is a host (has a trip linked to this event)
    SELECT EXISTS (
        SELECT 1 FROM public.trip
        WHERE "hostId" = v_user_id AND event_id = p_event_id
    ) INTO v_is_host;

    -- Get caller's profile and preferences
    SELECT
        u."languages", u."travelTraits",
        u.match_pref_language, u.match_pref_travel_traits,
        u.match_pref_age, u.match_pref_gender,
        u.match_age_min, u.match_age_max
    INTO
        v_user_languages, v_user_traits,
        v_pref_language, v_pref_traits,
        v_pref_age, v_pref_gender,
        v_age_min, v_age_max
    FROM public."user" u
    WHERE u.id = v_user_id;

    -- Get caller's gender preferences
    SELECT ARRAY_AGG(ugp.gender) INTO v_user_genders
    FROM public.user_gender_preference ugp
    WHERE ugp.user_id = v_user_id;

    RETURN QUERY
    WITH candidates AS (
        SELECT
            u.id AS candidate_id,
            u.name AS candidate_name,
            u.bio AS candidate_bio,
            u."imageUrl" AS candidate_image_url,
            u.gender AS candidate_gender,
            u."languages" AS candidate_languages,
            u."travelTraits" AS candidate_traits,
            u."yearOfBirth" AS candidate_year_of_birth,
            t.id AS candidate_trip_id,
            t.name AS candidate_trip_name,
            t.location AS candidate_trip_location,
            t."startDate" AS candidate_trip_start_date,
            t."endDate" AS candidate_trip_end_date,
            t."numberofrooms" AS candidate_number_of_rooms,
            at.name AS candidate_accommodation_type
        FROM public.event_registration er
        JOIN public."user" u ON u.id = er.user_id
        -- Left join trip for host info (seekers won't have a linked trip)
        LEFT JOIN public.trip t ON t."hostId" = u.id AND t.event_id = p_event_id
        LEFT JOIN public.accommodation_type at ON at.id = t."accommodationTypeId"
        WHERE er.event_id = p_event_id
        AND er.user_id != v_user_id
        -- Show opposite role: if caller is host, show seekers (no trip); if seeker, show hosts (has trip)
        AND (
            (v_is_host AND NOT EXISTS (
                SELECT 1 FROM public.trip t2
                WHERE t2."hostId" = u.id AND t2.event_id = p_event_id
            ))
            OR
            (NOT v_is_host AND EXISTS (
                SELECT 1 FROM public.trip t2
                WHERE t2."hostId" = u.id AND t2.event_id = p_event_id
            ))
        )
        -- Exclude profiles already acted on
        AND NOT EXISTS (
            SELECT 1 FROM public.match_interest mi
            WHERE mi.event_id = p_event_id
            AND mi.user_id = v_user_id
            AND mi.target_user_id = u.id
        )
        -- Exclude hosts whose trips are full
        AND (
            v_is_host -- seekers don't have trips to check
            OR NOT EXISTS (
                SELECT 1 FROM public.trip t3
                WHERE t3."hostId" = u.id AND t3.event_id = p_event_id
                AND (
                    SELECT COUNT(*) FROM public.trip_member tm
                    WHERE tm.trip_id = t3.id
                ) >= COALESCE(t3."numberofrooms", 0)
            )
        )
    ),
    scored AS (
        SELECT
            c.*,
            -- Language score: binary (1.0 if any shared, 0.0 if none)
            CASE
                WHEN v_user_languages IS NULL OR c.candidate_languages IS NULL THEN 0.0
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(v_user_languages) ul
                    JOIN jsonb_array_elements_text(c.candidate_languages) cl ON ul = cl
                ) THEN 1.0
                ELSE 0.0
            END AS language_score,

            -- Travel traits score: proportion of shared traits
            CASE
                WHEN v_user_traits IS NULL OR c.candidate_traits IS NULL THEN 0.0
                WHEN jsonb_array_length(v_user_traits) = 0 THEN 0.0
                ELSE (
                    SELECT COUNT(*)::numeric / jsonb_array_length(v_user_traits)
                    FROM jsonb_array_elements_text(v_user_traits) ut
                    JOIN jsonb_array_elements_text(c.candidate_traits) ct ON ut = ct
                )
            END AS traits_score,

            -- Age score: 1.0 within range, linear decay outside
            CASE
                WHEN v_age_min IS NULL OR v_age_max IS NULL OR c.candidate_year_of_birth IS NULL THEN 0.0
                WHEN (EXTRACT(YEAR FROM CURRENT_DATE) - c.candidate_year_of_birth)
                    BETWEEN v_age_min AND v_age_max THEN 1.0
                ELSE GREATEST(0.0,
                    1.0 - (
                        LEAST(
                            ABS((EXTRACT(YEAR FROM CURRENT_DATE) - c.candidate_year_of_birth) - v_age_min),
                            ABS((EXTRACT(YEAR FROM CURRENT_DATE) - c.candidate_year_of_birth) - v_age_max)
                        )::numeric / GREATEST(1, v_age_max - v_age_min)
                    )
                )
            END AS age_score,

            -- Gender score: 1.0 if candidate gender in user preferences, 0.0 otherwise
            CASE
                WHEN v_user_genders IS NULL OR array_length(v_user_genders, 1) IS NULL THEN 1.0
                WHEN c.candidate_gender = ANY(v_user_genders) THEN 1.0
                ELSE 0.0
            END AS gender_score,

            -- Shared languages for display
            (
                SELECT COALESCE(jsonb_agg(ul), '[]'::jsonb)
                FROM jsonb_array_elements_text(v_user_languages) ul
                WHERE ul IN (
                    SELECT jsonb_array_elements_text(c.candidate_languages)
                )
            ) AS calc_shared_languages,

            -- Shared traits for display
            (
                SELECT COALESCE(jsonb_agg(ut), '[]'::jsonb)
                FROM jsonb_array_elements_text(v_user_traits) ut
                WHERE ut IN (
                    SELECT jsonb_array_elements_text(c.candidate_traits)
                )
            ) AS calc_shared_traits
        FROM candidates c
    ),
    filtered AS (
        SELECT s.*
        FROM scored s
        WHERE
            -- Must match filters: exclude if score = 0
            (v_pref_language != 'must_match' OR s.language_score > 0)
            AND (v_pref_traits != 'must_match' OR s.traits_score > 0)
            AND (v_pref_age != 'must_match' OR s.age_score > 0)
            AND (v_pref_gender != 'must_match' OR s.gender_score > 0)
    )
    SELECT
        f.candidate_id,
        f.candidate_name,
        f.candidate_bio,
        f.candidate_image_url,
        f.candidate_gender,
        f.candidate_languages,
        f.candidate_traits,
        f.candidate_year_of_birth,
        -- Weighted compatibility score (only "prefer" dimensions contribute)
        (
            CASE WHEN v_pref_language = 'prefer' THEN f.language_score ELSE 0 END +
            CASE WHEN v_pref_traits = 'prefer' THEN f.traits_score ELSE 0 END +
            CASE WHEN v_pref_age = 'prefer' THEN f.age_score ELSE 0 END +
            CASE WHEN v_pref_gender = 'prefer' THEN f.gender_score ELSE 0 END
        ) / GREATEST(1, (
            CASE WHEN v_pref_language = 'prefer' THEN 1 ELSE 0 END +
            CASE WHEN v_pref_traits = 'prefer' THEN 1 ELSE 0 END +
            CASE WHEN v_pref_age = 'prefer' THEN 1 ELSE 0 END +
            CASE WHEN v_pref_gender = 'prefer' THEN 1 ELSE 0 END
        )) AS compat_score,
        f.calc_shared_languages,
        f.calc_shared_traits,
        f.candidate_trip_id,
        f.candidate_trip_name,
        f.candidate_trip_location,
        f.candidate_trip_start_date,
        f.candidate_trip_end_date,
        f.candidate_number_of_rooms,
        f.candidate_accommodation_type
    FROM filtered f
    ORDER BY (
        CASE WHEN v_pref_language = 'prefer' THEN f.language_score ELSE 0 END +
        CASE WHEN v_pref_traits = 'prefer' THEN f.traits_score ELSE 0 END +
        CASE WHEN v_pref_age = 'prefer' THEN f.age_score ELSE 0 END +
        CASE WHEN v_pref_gender = 'prefer' THEN f.gender_score ELSE 0 END
    ) DESC;
END;
$$;
