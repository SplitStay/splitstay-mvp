

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."request_status" AS ENUM (
    'active',
    'pending',
    'declined'
);


ALTER TYPE "public"."request_status" OWNER TO "postgres";


CREATE TYPE "public"."review_stars" AS ENUM (
    '1',
    '2',
    '3',
    '4',
    '5'
);


ALTER TYPE "public"."review_stars" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_room_request"("p_request_id" "uuid", "p_room_id" "uuid", "p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_request_record record;
  v_room_record record;
BEGIN
  -- Check if request exists and is pending
  SELECT * INTO v_request_record
  FROM public.room_request
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;

  -- Check if room exists and is available
  SELECT * INTO v_room_record
  FROM public.room
  WHERE id = p_room_id AND occupant_id IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not available');
  END IF;

  -- Update room with occupant
  UPDATE public.room
  SET occupant_id = p_user_id,
      updated_at = now()
  WHERE id = p_room_id;

  -- Update request status to active
  UPDATE public.room_request
  SET status = 'active',
      updated_at = now()
  WHERE id = p_request_id;

  -- Decline all other pending requests for this room
  UPDATE public.room_request
  SET status = 'declined',
      updated_at = now()
  WHERE room_id = p_room_id 
    AND id <> p_request_id 
    AND status = 'pending';

  RETURN json_build_object('success', true);
END;
$$;


ALTER FUNCTION "public"."accept_room_request"("p_request_id" "uuid", "p_room_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_trip_request"("p_request_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_trip_host_id uuid;
    v_request_user_id uuid;
    v_existing_joinee_id uuid;
    v_trip_chat_id uuid;
BEGIN
    -- Get trip host and existing joinee
    SELECT "hostId", "joineeId" INTO v_trip_host_id, v_existing_joinee_id
    FROM public.trip
    WHERE id = p_trip_id;

    -- Verify the user is the host of the trip
    IF v_trip_host_id != p_user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Only the trip host can accept requests'
        );
    END IF;

    -- Check if trip already has a joinee
    IF v_existing_joinee_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Trip already has a joinee'
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

    -- Update the trip to set the joinee
    UPDATE public.trip
    SET "joineeId" = v_request_user_id
    WHERE id = p_trip_id;

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
        -- Create trip chat
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
        'joinee_id', v_request_user_id,
        'chat_id', v_trip_chat_id
    );
END;
$$;


ALTER FUNCTION "public"."accept_trip_request"("p_request_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."accept_trip_request"("p_request_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") IS 'Atomically accepts a trip request by updating both trip and request tables in a single transaction';



CREATE OR REPLACE FUNCTION "public"."check_message_rate_limit"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    message_count integer;
BEGIN
    -- Check messages sent in last minute
    SELECT COUNT(*) INTO message_count
    FROM public.messages
    WHERE sender_id = p_user_id
    AND created_at > now() - interval '1 minute'
    AND deleted_at IS NULL;
    
    -- Allow max 30 messages per minute (reasonable for conversations)
    RETURN message_count < 30;
END;
$$;


ALTER FUNCTION "public"."check_message_rate_limit"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_message"("p_message_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_start_time timestamptz;
    v_conversation_id uuid;
BEGIN
    v_start_time := clock_timestamp();
    
    -- Get conversation ID and validate ownership
    SELECT conversation_id INTO v_conversation_id
    FROM public.messages
    WHERE id = p_message_id AND sender_id = p_user_id AND deleted_at IS NULL;
    
    IF v_conversation_id IS NULL THEN
        PERFORM public.raise_messaging_error(
            'MESSAGE_NOT_FOUND_OR_UNAUTHORIZED',
            'Message not found or user not authorized to delete',
            jsonb_build_object('message_id', p_message_id, 'user_id', p_user_id)
        );
    END IF;
    
    -- Authorization check
    IF p_user_id != auth.uid() THEN
        PERFORM public.raise_messaging_error(
            'UNAUTHORIZED_DELETE_MESSAGE',
            'User not authorized to delete message',
            jsonb_build_object('user_id', p_user_id, 'auth_uid', auth.uid())
        );
    END IF;
    
    -- Soft delete message
    UPDATE public.messages
    SET 
        deleted_at = now(),
        updated_at = now()
    WHERE id = p_message_id;
    
    -- Log performance
    PERFORM public.log_messaging_performance(
        'delete_message',
        extract(milliseconds from clock_timestamp() - v_start_time)::integer,
        p_user_id,
        v_conversation_id
    );
    
    RETURN TRUE;
    
EXCEPTION WHEN OTHERS THEN
    PERFORM public.raise_messaging_error(
        'DELETE_MESSAGE_ERROR',
        'Failed to delete message',
        jsonb_build_object(
            'message_id', p_message_id,
            'user_id', p_user_id,
            'sql_error', SQLERRM
        )
    );
    RAISE;
END;
$$;


ALTER FUNCTION "public"."delete_message"("p_message_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_account"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_user_id uuid;
    trip_record RECORD;
BEGIN
    -- Get the user id from the current session
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Delete messages first (depends on chat_participant)
    DELETE FROM public.message 
    WHERE "participantId" IN (
        SELECT id FROM public.chat_participant WHERE "userId" = v_user_id
    );

    -- Delete chat participants for this user
    DELETE FROM public.chat_participant WHERE "userId" = v_user_id;

    -- Delete chats where this user was the only participant (orphaned chats)
    DELETE FROM public.chat 
    WHERE id NOT IN (
        SELECT DISTINCT "chatId" FROM public.chat_participant
    );

    -- Delete reviews where user is reviewer or reviewee
    DELETE FROM public.review 
    WHERE "reviewerId" = v_user_id OR "revieweeId" = v_user_id;

    -- Delete requests for trips hosted by this user or requests made by this user
    DELETE FROM public.request 
    WHERE "userId" = v_user_id 
    OR "tripId" IN (
        SELECT id FROM public.trip WHERE "hostId" = v_user_id
    );

    -- For each trip hosted by this user, we need to handle them carefully
    FOR trip_record IN 
        SELECT id, "joineeId" FROM public.trip WHERE "hostId" = v_user_id
    LOOP
        -- If there's a joinee, transfer ownership to them
        IF trip_record."joineeId" IS NOT NULL THEN
            UPDATE public.trip 
            SET "hostId" = trip_record."joineeId", "joineeId" = NULL
            WHERE id = trip_record.id;
        ELSE
            -- No joinee, safe to delete the trip
            DELETE FROM public.trip WHERE id = trip_record.id;
        END IF;
    END LOOP;

    -- Remove user as joinee from trips (set joineeId to NULL)
    UPDATE public.trip SET "joineeId" = NULL WHERE "joineeId" = v_user_id;

    -- Finally, delete the user from auth.users (this will cascade to public.user)
    DELETE FROM auth.users WHERE id = v_user_id;
    
    -- If we get here, the deletion was successful
    RAISE NOTICE 'User account deleted successfully';
END;
$$;


ALTER FUNCTION "public"."delete_user_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."edit_message"("p_message_id" "uuid", "p_user_id" "uuid", "p_new_content" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_cleaned_content text;
    v_start_time timestamptz;
    v_conversation_id uuid;
BEGIN
    v_start_time := clock_timestamp();
    
    -- Get conversation ID and validate ownership
    SELECT conversation_id INTO v_conversation_id
    FROM public.messages
    WHERE id = p_message_id AND sender_id = p_user_id AND deleted_at IS NULL;
    
    IF v_conversation_id IS NULL THEN
        PERFORM public.raise_messaging_error(
            'MESSAGE_NOT_FOUND_OR_UNAUTHORIZED',
            'Message not found or user not authorized to edit',
            jsonb_build_object('message_id', p_message_id, 'user_id', p_user_id)
        );
    END IF;
    
    -- Authorization check
    IF p_user_id != auth.uid() THEN
        PERFORM public.raise_messaging_error(
            'UNAUTHORIZED_EDIT_MESSAGE',
            'User not authorized to edit message',
            jsonb_build_object('user_id', p_user_id, 'auth_uid', auth.uid())
        );
    END IF;
    
    -- Rate limiting check
    IF NOT public.check_message_rate_limit(p_user_id) THEN
        PERFORM public.raise_messaging_error(
            'RATE_LIMIT_EXCEEDED',
            'Rate limit exceeded. Please wait before editing messages.',
            jsonb_build_object('user_id', p_user_id)
        );
    END IF;
    
    -- Validate and clean content
    v_cleaned_content := public.validate_message_content(p_new_content);
    
    -- Update message
    UPDATE public.messages
    SET 
        content = v_cleaned_content,
        edited_at = now(),
        updated_at = now()
    WHERE id = p_message_id;
    
    -- Log performance
    PERFORM public.log_messaging_performance(
        'edit_message',
        extract(milliseconds from clock_timestamp() - v_start_time)::integer,
        p_user_id,
        v_conversation_id
    );
    
    RETURN TRUE;
    
EXCEPTION WHEN OTHERS THEN
    PERFORM public.raise_messaging_error(
        'EDIT_MESSAGE_ERROR',
        'Failed to edit message',
        jsonb_build_object(
            'message_id', p_message_id,
            'user_id', p_user_id,
            'sql_error', SQLERRM
        )
    );
    RAISE;
END;
$$;


ALTER FUNCTION "public"."edit_message"("p_message_id" "uuid", "p_user_id" "uuid", "p_new_content" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_conversation_messages"("p_conversation_id" "uuid", "p_user_id" "uuid", "p_limit" integer DEFAULT 50, "p_offset" integer DEFAULT 0) RETURNS TABLE("message_id" "uuid", "sender_id" "uuid", "sender_name" "text", "sender_image_url" "text", "content" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "edited_at" timestamp with time zone, "is_read" boolean, "is_deleted" boolean, "message_type" "text", "metadata" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Verify user is part of conversation
    IF NOT EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = p_conversation_id 
        AND (c.user1_id = p_user_id OR c.user2_id = p_user_id)
    ) THEN
        RAISE EXCEPTION 'User not authorized to view this conversation';
    END IF;
    
    RETURN QUERY
    SELECT 
        m.id AS message_id,
        m.sender_id,
        u.name AS sender_name,
        u."imageUrl" AS sender_image_url,
        m.content,
        m.created_at,
        m.created_at AS updated_at,  -- Placeholder
        null::timestamptz AS edited_at,  -- Placeholder
        CASE WHEN mrs.id IS NOT NULL THEN true ELSE false END AS is_read,
        false AS is_deleted,  -- Placeholder
        'text'::text AS message_type,  -- Placeholder
        '{}'::jsonb AS metadata  -- Placeholder
    FROM public.messages m
    INNER JOIN public."user" u ON u.id = m.sender_id
    LEFT JOIN public.message_read_status mrs ON mrs.message_id = m.id AND mrs.user_id = p_user_id
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_conversation_messages"("p_conversation_id" "uuid", "p_user_id" "uuid", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_conversation_messages"("p_conversation_id" "uuid", "p_user_id" "uuid", "p_limit" integer, "p_offset" integer) IS 'Retrieves messages for a conversation in chronological order (oldest first) for proper chat display';



CREATE OR REPLACE FUNCTION "public"."get_or_create_conversation"("p_user1_id" "uuid", "p_user2_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_conversation_id uuid;
    v_ordered_user1_id uuid;
    v_ordered_user2_id uuid;
BEGIN
    -- Log the function call
    RAISE NOTICE 'get_or_create_conversation called: user1=%, user2=%', p_user1_id, p_user2_id;
    
    -- Validate inputs
    IF p_user1_id IS NULL OR p_user2_id IS NULL OR p_user1_id = p_user2_id THEN
        RAISE EXCEPTION 'Invalid user IDs provided';
    END IF;
    
    -- Order user IDs to ensure consistency (smaller UUID first)
    IF p_user1_id < p_user2_id THEN
        v_ordered_user1_id := p_user1_id;
        v_ordered_user2_id := p_user2_id;
    ELSE
        v_ordered_user1_id := p_user2_id;
        v_ordered_user2_id := p_user1_id;
    END IF;
    
    -- Try to find existing conversation
    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE user1_id = v_ordered_user1_id AND user2_id = v_ordered_user2_id;
    
    -- If not found, create new conversation
    IF v_conversation_id IS NULL THEN
        INSERT INTO public.conversations (user1_id, user2_id, created_at, updated_at)
        VALUES (v_ordered_user1_id, v_ordered_user2_id, timezone('utc'::text, now()), timezone('utc'::text, now()))
        RETURNING id INTO v_conversation_id;
        
        RAISE NOTICE 'Created new conversation: %', v_conversation_id;
    ELSE
        RAISE NOTICE 'Found existing conversation: %', v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_conversation"("p_user1_id" "uuid", "p_user2_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unread_message_count"("p_conversation_id" "uuid", "p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_count INTEGER;
  v_other_user_id UUID;
BEGIN
  -- Get the other user in the conversation
  SELECT CASE 
    WHEN user1_id = p_user_id THEN user2_id
    ELSE user1_id
  END INTO v_other_user_id
  FROM conversations
  WHERE id = p_conversation_id;

  -- Count unread messages (messages from other user that haven't been read by current user)
  SELECT COUNT(*)
  INTO v_count
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id = v_other_user_id
    AND NOT EXISTS (
      SELECT 1 
      FROM message_read_status mrs
      WHERE mrs.message_id = m.id 
        AND mrs.user_id = p_user_id
    );

  RETURN COALESCE(v_count, 0);
END;
$$;


ALTER FUNCTION "public"."get_unread_message_count"("p_conversation_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_conversations"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "last_message_at" timestamp with time zone, "participant1_id" "uuid", "participant2_id" "uuid", "last_message_content" "text", "last_message_sender_id" "uuid", "other_user_id" "uuid", "other_user_name" "text", "other_user_email" "text", "other_user_image_url" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.created_at,
    c.updated_at,
    c.last_message_at,
    c.participant1_id,
    c.participant2_id,
    c.last_message_content,
    c.last_message_sender_id,
    CASE 
      WHEN c.participant1_id = p_user_id THEN c.participant2_id
      ELSE c.participant1_id
    END as other_user_id,
    CASE 
      WHEN c.participant1_id = p_user_id THEN u2.name
      ELSE u1.name
    END as other_user_name,
    CASE 
      WHEN c.participant1_id = p_user_id THEN u2.email
      ELSE u1.email
    END as other_user_email,
    CASE 
      WHEN c.participant1_id = p_user_id THEN u2."imageUrl"
      ELSE u1."imageUrl"
    END as other_user_image_url
  FROM conversations c
  LEFT JOIN "user" u1 ON u1.id = c.participant1_id
  LEFT JOIN "user" u2 ON u2.id = c.participant2_id
  WHERE c.participant1_id = p_user_id OR c.participant2_id = p_user_id
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;


ALTER FUNCTION "public"."get_user_conversations"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_conversations"("p_user_id" "uuid", "p_limit" integer DEFAULT 50, "p_offset" integer DEFAULT 0) RETURNS TABLE("conversation_id" "uuid", "other_user_id" "uuid", "other_user_name" "text", "other_user_image_url" "text", "other_user_is_online" boolean, "last_message_id" "uuid", "last_message_content" "text", "last_message_created_at" timestamp with time zone, "last_message_sender_id" "uuid", "unread_count" bigint, "is_archived" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_start_time timestamptz;
BEGIN
    v_start_time := clock_timestamp();
    
    -- Authorization check
    IF p_user_id != auth.uid() THEN
        PERFORM public.raise_messaging_error(
            'UNAUTHORIZED_CONVERSATIONS_ACCESS',
            'User not authorized to view these conversations',
            jsonb_build_object('requested_user_id', p_user_id, 'auth_uid', auth.uid())
        );
    END IF;
    
    -- Validate pagination parameters
    IF p_limit < 1 OR p_limit > 100 THEN
        PERFORM public.raise_messaging_error(
            'INVALID_PAGINATION_LIMIT',
            'Limit must be between 1 and 100',
            jsonb_build_object('limit', p_limit)
        );
    END IF;
    
    IF p_offset < 0 THEN
        PERFORM public.raise_messaging_error(
            'INVALID_PAGINATION_OFFSET',
            'Offset must be non-negative',
            jsonb_build_object('offset', p_offset)
        );
    END IF;
    
    RETURN QUERY
    WITH user_conversations AS (
        SELECT 
            c.id,
            CASE WHEN c.user1_id = p_user_id THEN c.user2_id ELSE c.user1_id END AS other_user_id,
            c.last_message_at,
            CASE 
                WHEN c.user1_id = p_user_id THEN c.is_archived_by_user1 
                ELSE c.is_archived_by_user2 
            END AS is_archived
        FROM public.conversations c
        WHERE c.user1_id = p_user_id OR c.user2_id = p_user_id
        ORDER BY c.last_message_at DESC NULLS LAST
        LIMIT p_limit OFFSET p_offset
    ),
    latest_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
            m.conversation_id,
            m.id,
            m.content, 
            m.created_at,
            m.sender_id
        FROM public.messages m
        INNER JOIN user_conversations uc ON uc.id = m.conversation_id
        WHERE m.deleted_at IS NULL
        ORDER BY m.conversation_id, m.created_at DESC
    ),
    -- Optimized unread count with single query and proper indexing
    unread_counts AS (
        SELECT 
            m.conversation_id,
            COUNT(m.id) as unread_count
        FROM public.messages m
        INNER JOIN user_conversations uc ON uc.id = m.conversation_id
        LEFT JOIN public.message_read_status mrs ON (mrs.message_id = m.id AND mrs.user_id = p_user_id)
        WHERE m.sender_id != p_user_id
        AND m.deleted_at IS NULL
        AND mrs.message_id IS NULL  -- More efficient than NOT EXISTS
        GROUP BY m.conversation_id
    )
    SELECT 
        uc.id::uuid,
        uc.other_user_id::uuid,
        u.name,
        u."imageUrl",
        COALESCE(up.is_online, false),
        lm.id::uuid,
        lm.content,
        lm.created_at,
        lm.sender_id::uuid,
        COALESCE(uncnt.unread_count, 0),
        uc.is_archived
    FROM user_conversations uc
    INNER JOIN public."user" u ON u.id = uc.other_user_id
    LEFT JOIN public.user_presence up ON up.user_id = uc.other_user_id
    LEFT JOIN latest_messages lm ON lm.conversation_id = uc.id
    LEFT JOIN unread_counts uncnt ON uncnt.conversation_id = uc.id
    ORDER BY uc.last_message_at DESC NULLS LAST;
    
    -- Log performance
    PERFORM public.log_messaging_performance(
        'get_user_conversations_optimized',
        extract(milliseconds from clock_timestamp() - v_start_time)::integer,
        p_user_id
    );
    
EXCEPTION WHEN OTHERS THEN
    PERFORM public.raise_messaging_error(
        'GET_USER_CONVERSATIONS_ERROR',
        'Failed to get user conversations',
        jsonb_build_object(
            'user_id', p_user_id,
            'sql_error', SQLERRM
        )
    );
    RAISE;
END;
$$;


ALTER FUNCTION "public"."get_user_conversations"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_conversations_fast"("p_user_id" "uuid", "p_limit" integer DEFAULT 50, "p_offset" integer DEFAULT 0) RETURNS TABLE("conversation_id" "uuid", "other_user_id" "uuid", "other_user_name" "text", "other_user_image_url" "text", "other_user_is_online" boolean, "last_message_id" "uuid", "last_message_content" "text", "last_message_created_at" timestamp with time zone, "last_message_sender_id" "uuid", "unread_count" bigint, "is_archived" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Authorization check
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized access';
    END IF;
    
    -- Validate pagination
    IF p_limit < 1 OR p_limit > 100 THEN
        RAISE EXCEPTION 'Invalid limit';
    END IF;
    
    RETURN QUERY
    SELECT 
        c.id::uuid,
        (CASE WHEN c.user1_id = p_user_id THEN c.user2_id ELSE c.user1_id END)::uuid,
        u.name,
        u."imageUrl",
        COALESCE(up.is_online, false),
        lm.id::uuid,
        lm.content,
        lm.created_at,
        lm.sender_id::uuid,
        0::bigint, -- Skip unread count for fast initial load
        (CASE 
            WHEN c.user1_id = p_user_id THEN c.is_archived_by_user1 
            ELSE c.is_archived_by_user2 
        END)
    FROM public.conversations c
    INNER JOIN public."user" u ON u.id = CASE WHEN c.user1_id = p_user_id THEN c.user2_id ELSE c.user1_id END
    LEFT JOIN public.user_presence up ON up.user_id = u.id
    LEFT JOIN LATERAL (
        SELECT m.id, m.content, m.created_at, m.sender_id
        FROM public.messages m
        WHERE m.conversation_id = c.id
        AND m.deleted_at IS NULL
        ORDER BY m.created_at DESC
        LIMIT 1
    ) lm ON true
    WHERE c.user1_id = p_user_id OR c.user2_id = p_user_id
    ORDER BY c.last_message_at DESC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_user_conversations_fast"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public."user" (id, email, name, "imageUrl")
  values (
    new.id,
    new.email,  -- use auth.users.email, not metadata
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      null
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW."updatedAt" = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_online"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_is_online BOOLEAN;
  v_last_seen TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT is_online, last_seen_at
  INTO v_is_online, v_last_seen
  FROM user_presence
  WHERE user_id = p_user_id;

  -- If no presence record, consider offline
  IF v_is_online IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Consider user online ONLY if marked as online AND seen within last 10 seconds
  IF v_is_online = TRUE AND v_last_seen > NOW() - INTERVAL '10 seconds' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;


ALTER FUNCTION "public"."is_user_online"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_messaging_performance"("p_operation" "text", "p_duration_ms" integer, "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_conversation_id" "uuid" DEFAULT NULL::"uuid", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.messaging_performance_log 
    (operation, duration_ms, user_id, conversation_id, metadata)
    VALUES (p_operation, p_duration_ms, p_user_id, p_conversation_id, p_metadata);
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    NULL;
END;
$$;


ALTER FUNCTION "public"."log_messaging_performance"("p_operation" "text", "p_duration_ms" integer, "p_user_id" "uuid", "p_conversation_id" "uuid", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_messages_as_read"("p_conversation_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID;
  v_other_user_id UUID;
BEGIN
  -- Get current user from auth context
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get the other user in the conversation
  SELECT CASE 
    WHEN user1_id = v_user_id THEN user2_id
    ELSE user1_id
  END INTO v_other_user_id
  FROM conversations
  WHERE id = p_conversation_id;

  -- Insert read status for all unread messages from the other user
  INSERT INTO message_read_status (message_id, user_id, read_at)
  SELECT m.id, v_user_id, NOW()
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id = v_other_user_id
    AND NOT EXISTS (
      SELECT 1 
      FROM message_read_status mrs
      WHERE mrs.message_id = m.id 
        AND mrs.user_id = v_user_id
    );
END;
$$;


ALTER FUNCTION "public"."mark_messages_as_read"("p_conversation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_direct_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    sender_name TEXT;
    sender_email TEXT;
    recipient_user_id UUID;
    recipient_email TEXT;
    chat_type_val chat_type;
BEGIN
    -- Get chat type
    SELECT c.type INTO chat_type_val
    FROM chat c
    WHERE c.id = NEW.chatId;
    
    -- Only send notifications for direct messages
    IF chat_type_val = 'direct' THEN
        -- Get sender information
        SELECT u.name, u.email INTO sender_name, sender_email
        FROM "user" u
        INNER JOIN chat_participant cp ON cp."userId" = u.id
        WHERE cp.id = NEW."participantId";
        
        -- Get recipient information (the other participant in the direct message)
        SELECT cp."userId", u.email INTO recipient_user_id, recipient_email
        FROM chat_participant cp
        INNER JOIN "user" u ON u.id = cp."userId"
        WHERE cp."chatId" = NEW."chatId" 
        AND cp."userId" != (
            SELECT cp2."userId" 
            FROM chat_participant cp2 
            WHERE cp2.id = NEW."participantId"
        )
        LIMIT 1;
        
        -- Send email notification using Supabase Edge Function
        PERFORM
            net.http_post(
                url := 'https://dhqvohruecmttgfkfdeb.supabase.co/functions/v1/send-email-notification',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
                body := json_build_object(
                    'type', 'new_direct_message',
                    'recipientEmail', recipient_email,
                    'data', json_build_object(
                        'senderName', sender_name,
                        'messageContent', NEW.content,
                        'appUrl', 'https://splitstay.com/messages'
                    )
                )::text
            );
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_new_direct_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_direct_message_http"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    chat_type_val TEXT;
    edge_function_url TEXT;
BEGIN
    -- Get chat type (using correct column casing)
    SELECT c.type INTO chat_type_val
    FROM chat c
    WHERE c.id = NEW."chatId";
    
    -- Only send notifications for direct messages
    IF chat_type_val = 'direct' THEN
        -- Get the Edge Function URL
        edge_function_url := current_setting('app.settings.message_notification_url', true);
        
        IF edge_function_url IS NULL THEN
            -- Fallback URL - update this with your actual Supabase project URL
            edge_function_url := 'https://dhqvohruecmttgfkfdeb.supabase.co/functions/v1/send-message-notification';
        END IF;
        
        -- Make HTTP request to Edge Function
        PERFORM net.http_post(
            url := edge_function_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
            ),
            body := jsonb_build_object(
                'type', 'INSERT',
                'table', 'message',
                'record', row_to_json(NEW)
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_new_direct_message_http"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_supabase_url text;
    v_service_role_key text;
    v_response record;
    v_function_url text;
BEGIN
    -- Only notify for non-deleted messages
    IF NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get configuration with fallback values
    v_supabase_url := coalesce(
        current_setting('app.supabase_url', true), 
        'https://dhqvohruecmttgfkfdeb.supabase.co'
    );
    
    v_function_url := v_supabase_url || '/functions/v1/send-message-notification';
    
    -- Log the attempt
    RAISE NOTICE 'Attempting to send message notification for message ID: %', NEW.id;
    
    -- Call the send-message-notification Edge Function
    BEGIN
        SELECT * FROM http((
            'POST',
            v_function_url,
            ARRAY[
                http_header('Content-Type', 'application/json')
            ],
            json_build_object(
                'type', 'INSERT',
                'table', 'messages',
                'record', json_build_object(
                    'id', NEW.id,
                    'conversation_id', NEW.conversation_id,
                    'sender_id', NEW.sender_id,
                    'content', NEW.content,
                    'created_at', NEW.created_at
                )
            )::text
        )) INTO v_response;
        
        -- Log the response
        RAISE NOTICE 'Message notification response: % - %', v_response.status, v_response.content;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the message insert
        RAISE NOTICE 'Message notification failed: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_new_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_offline_message_webhook"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_recipient_id UUID;
  v_recipient_email TEXT;
  v_recipient_name TEXT;
  v_sender_name TEXT;
  v_is_online BOOLEAN;
BEGIN
  -- Get the recipient (other user in conversation)
  SELECT CASE 
    WHEN c.user1_id = NEW.sender_id THEN c.user2_id
    ELSE c.user1_id
  END INTO v_recipient_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Check if recipient is online
  v_is_online := is_user_online(v_recipient_id);

  -- Only send email if recipient is offline
  IF NOT v_is_online THEN
    -- Get recipient details
    SELECT email, name
    INTO v_recipient_email, v_recipient_name
    FROM public.user
    WHERE id = v_recipient_id;

    -- Get sender name
    SELECT name
    INTO v_sender_name
    FROM public.user
    WHERE id = NEW.sender_id;

    -- Insert into email_notifications table (this will trigger webhook)
    INSERT INTO email_notifications (
      recipient_email,
      recipient_name,
      subject,
      body,
      status,
      created_at
    ) VALUES (
      v_recipient_email,
      v_recipient_name,
      'New message from ' || COALESCE(v_sender_name, 'a user') || ' on SplitStay',
      'You have a new message from ' || COALESCE(v_sender_name, 'a user') || ' on SplitStay:' || chr(10) || chr(10) || 
      LEFT(NEW.content, 200) || 
      CASE WHEN LENGTH(NEW.content) > 200 THEN '...' ELSE '' END || chr(10) || chr(10) ||
      'View the conversation at: https://splitstay.travel/messages?chat=' || NEW.conversation_id,
      'pending',
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_offline_message_webhook"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_trip_join_request_webhook"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_host_email TEXT;
  v_host_name TEXT;
  v_requester_name TEXT;
  v_trip_name TEXT;
  v_trip_location TEXT;
BEGIN
  -- Get host details
  SELECT u.email, u.name
  INTO v_host_email, v_host_name
  FROM public.user u
  INNER JOIN trip t ON t.hostId = u.id
  WHERE t.id = NEW.tripId;

  -- Get requester name
  SELECT name
  INTO v_requester_name
  FROM public.user
  WHERE id = NEW.userId;

  -- Get trip details
  SELECT name, location
  INTO v_trip_name, v_trip_location
  FROM trip
  WHERE id = NEW.tripId;

  -- Insert into email_notifications table (this will trigger webhook)
  INSERT INTO email_notifications (
    recipient_email,
    recipient_name,
    subject,
    body,
    status,
    created_at
  ) VALUES (
    v_host_email,
    v_host_name,
    COALESCE(v_requester_name, 'Someone') || ' wants to join your trip to ' || v_trip_location,
    'Hi ' || COALESCE(v_host_name, 'there') || ',' || chr(10) || chr(10) ||
    COALESCE(v_requester_name, 'A user') || ' has requested to join your trip "' || v_trip_name || '" in ' || v_trip_location || '.' || chr(10) || chr(10) ||
    CASE WHEN NEW.message IS NOT NULL THEN 'Their message: ' || NEW.message || chr(10) || chr(10) ELSE '' END ||
    'View and respond to this request at: https://splitstay.travel/messages' || chr(10) || chr(10) ||
    'Happy travels!' || chr(10) ||
    'The SplitStay Team',
    'pending',
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the request insert
    RAISE WARNING 'Failed to queue email notification: %', SQLERRM;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_trip_join_request_webhook"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_pending_emails"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    email_record RECORD;
    postmark_response RECORD;
BEGIN
    -- Process all pending emails
    FOR email_record IN 
        SELECT id, recipient_email, recipient_name, subject, body, created_at
        FROM public.email_notifications 
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 10  -- Process in batches
    LOOP
        BEGIN
            -- Call the send-request-notification Edge Function
            SELECT * FROM http((
                'POST',
                current_setting('app.supabase_url') || '/functions/v1/send-email-direct',
                ARRAY[
                    http_header('Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')),
                    http_header('Content-Type', 'application/json')
                ],
                json_build_object(
                    'to', email_record.recipient_email,
                    'subject', email_record.subject,
                    'html_body', replace(email_record.body, E'\n', '<br>')
                )::text
            )) INTO postmark_response;
            
            -- Update status based on response
            IF postmark_response.status = 200 THEN
                UPDATE public.email_notifications
                SET 
                    status = 'sent',
                    sent_at = now(),
                    updated_at = now()
                WHERE id = email_record.id;
            ELSE
                UPDATE public.email_notifications
                SET 
                    status = 'failed',
                    error_message = 'HTTP ' || postmark_response.status,
                    updated_at = now()
                WHERE id = email_record.id;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- Mark as failed on any error
            UPDATE public.email_notifications
            SET 
                status = 'failed',
                error_message = SQLERRM,
                updated_at = now()
            WHERE id = email_record.id;
        END;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."process_pending_emails"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_message_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    sender_name text;
    recipient_id uuid;
    recipient_email text;
    recipient_name text;
    email_subject text;
    email_html text;
BEGIN
    -- Only notify for non-deleted messages
    IF NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Log the attempt
    RAISE NOTICE 'Queueing email notification for message ID: %', NEW.id;
    
    -- Get sender details
    SELECT name INTO sender_name
    FROM public."user"
    WHERE id = NEW.sender_id;
    
    -- Get recipient (the other user in the conversation)
    SELECT 
        CASE 
            WHEN c.user1_id = NEW.sender_id THEN c.user2_id 
            ELSE c.user1_id 
        END INTO recipient_id
    FROM public.conversations c
    WHERE c.id = NEW.conversation_id;
    
    -- Get recipient details
    SELECT name, email INTO recipient_name, recipient_email
    FROM public."user"
    WHERE id = recipient_id;
    
    -- Log recipient info
    RAISE NOTICE 'Recipient: % (%) for message from: %', recipient_name, recipient_email, sender_name;
    
    -- Only proceed if we have recipient email
    IF recipient_email IS NOT NULL AND recipient_email != '' THEN
        email_subject := 'New Message from ' || coalesce(sender_name, 'Someone') || ' on SplitStay';
        email_html := 
            '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">' ||
            '<div style="background: #1A1E62; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">' ||
            '<h1 style="margin: 0;">SplitStay</h1>' ||
            '<p style="margin: 5px 0 0 0; opacity: 0.9;">New Message 💬</p>' ||
            '</div>' ||
            '<div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">' ||
            '<p>Hi ' || coalesce(recipient_name, 'there') || ',</p>' ||
            '<p>You have received a new message from <strong>' || coalesce(sender_name, 'someone') || '</strong> on SplitStay:</p>' ||
            '<div style="background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #1A1E62;">' ||
            '"' || substring(NEW.content from 1 for 200) || 
            CASE WHEN length(NEW.content) > 200 THEN '..."' ELSE '"' END ||
            '</div>' ||
            '<div style="text-align: center; margin: 25px 0;">' ||
            '<a href="https://splitstay.travel/messages" style="background-color: #1A1E62; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Message</a>' ||
            '</div>' ||
            '<p style="color: #666;">Best regards,<br><em>- The SplitStay Team</em></p>' ||
            '</div>' ||
            '</div>';
        
        -- Queue the email notification (create table if it doesn't exist)
        BEGIN
            INSERT INTO public.email_notifications (
                recipient_email,
                recipient_name,
                subject,
                body,
                status,
                created_at
            ) VALUES (
                recipient_email,
                recipient_name,
                email_subject,
                email_html,
                'pending',
                now()
            );
            
            RAISE NOTICE 'Email notification queued successfully';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to queue email notification: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'No valid recipient email found: %', recipient_email;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."queue_message_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."raise_messaging_error"("p_error_code" "text", "p_error_message" "text", "p_details" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RAISE EXCEPTION '[%] %: %', p_error_code, p_error_message, p_details::text;
END;
$$;


ALTER FUNCTION "public"."raise_messaging_error"("p_error_code" "text", "p_error_message" "text", "p_details" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text" DEFAULT 'text'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_message_id uuid;
    v_conversation_exists boolean := false;
BEGIN
    -- Log the function call for debugging
    RAISE NOTICE 'send_message called: conv=%, sender=%, content_length=%', p_conversation_id, p_sender_id, length(p_content);
    
    -- Validate inputs
    IF p_conversation_id IS NULL OR p_sender_id IS NULL OR p_content IS NULL OR trim(p_content) = '' THEN
        RAISE EXCEPTION 'Invalid input parameters';
    END IF;
    
    -- Verify user is part of conversation
    SELECT EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = p_conversation_id 
        AND (c.user1_id = p_sender_id OR c.user2_id = p_sender_id)
    ) INTO v_conversation_exists;
    
    IF NOT v_conversation_exists THEN
        RAISE EXCEPTION 'User not authorized to send message to this conversation or conversation does not exist';
    END IF;
    
    -- Insert message - this will trigger the notification triggers
    INSERT INTO public.messages (conversation_id, sender_id, content, created_at)
    VALUES (p_conversation_id, p_sender_id, trim(p_content), timezone('utc'::text, now()))
    RETURNING id INTO v_message_id;
    
    -- Update conversation timestamp
    UPDATE public.conversations 
    SET updated_at = timezone('utc'::text, now())
    WHERE id = p_conversation_id;
    
    -- Log success
    RAISE NOTICE 'Message created successfully: %', v_message_id;
    
    RETURN v_message_id;
END;
$$;


ALTER FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text" DEFAULT 'text'::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_message_id UUID;
BEGIN
  -- Insert message
  INSERT INTO messages (conversation_id, sender_id, content, message_type, metadata)
  VALUES (p_conversation_id, p_sender_id, p_content, p_message_type, p_metadata)
  RETURNING id INTO v_message_id;
  
  -- Update conversation last message
  UPDATE conversations 
  SET 
    last_message_content = p_content,
    last_message_sender_id = p_sender_id,
    last_message_at = NOW(),
    updated_at = NOW()
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$;


ALTER FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_request_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  joinee_email text;
  joinee_name text;
  host_name text;
  host_email text;
  trip_name text;
  trip_location text;
  trip_start_date date;
  trip_end_date date;
  email_subject text;
  email_body text;
begin
  -- Only proceed if status changed from pending to active or declined
  if OLD.status = 'pending' and NEW.status in ('active', 'declined') then
    -- Get joinee details
    select email, name into joinee_email, joinee_name
    from public."user"
    where id = NEW."userId";
    
    -- Get trip and host details
    select 
      t.name, 
      t.location, 
      t."startDate", 
      t."endDate",
      h.name,
      h.email
    into 
      trip_name, 
      trip_location, 
      trip_start_date, 
      trip_end_date,
      host_name,
      host_email
    from public.trip t
    join public."user" h on t."hostId" = h.id
    where t.id = NEW."tripId";
    
    -- Prepare email content based on status
    if NEW.status = 'active' then
      email_subject := 'Great news! Your request to join "' || trip_name || '" has been accepted!';
      email_body := E'Hi ' || coalesce(joinee_name, 'there') || ',\n\n' ||
        E'Congratulations! Your request to join the trip "' || trip_name || '" has been accepted by ' || host_name || '!\n\n' ||
        E'Trip Details:\n' ||
        E'• Destination: ' || trip_location || '\n' ||
        E'• Dates: ' || to_char(trip_start_date, 'Mon DD, YYYY') || ' - ' || to_char(trip_end_date, 'Mon DD, YYYY') || '\n' ||
        E'• Host: ' || host_name || '\n\n' ||
        E'The host will contact you soon with more details about the trip arrangements.\n' ||
        E'You can also reach out to them at: ' || host_email || '\n\n' ||
        E'Have a wonderful trip!\n\n' ||
        E'- The SplitStay Team';
    else -- declined
      email_subject := 'Update on your request to join "' || trip_name || '"';
      email_body := E'Hi ' || coalesce(joinee_name, 'there') || ',\n\n' ||
        E'We wanted to let you know that your request to join "' || trip_name || '" was not accepted at this time.\n\n' ||
        E'Don''t worry - there are many other amazing trips available on SplitStay!\n\n' ||
        E'Browse more trips at: https://splitstay.com/find\n\n' ||
        E'Keep exploring and you''ll find the perfect travel match!\n\n' ||
        E'- The SplitStay Team';
    end if;
    
    -- Log the email for debugging (you can see these in Supabase logs)
    raise notice 'Sending email to % with subject: %', joinee_email, email_subject;
    
    -- Since Supabase doesn't have a built-in way to send custom emails from SQL,
    -- we'll insert into a notifications table that can be processed by an Edge Function
    -- or you can use pg_net to call an external email service
    
    -- For now, let's create a notifications table to queue emails
    insert into public.email_notifications (
      recipient_email,
      recipient_name,
      subject,
      body,
      status,
      created_at
    ) values (
      joinee_email,
      joinee_name,
      email_subject,
      email_body,
      'pending',
      now()
    );
  end if;
  
  return NEW;
end;
$$;


ALTER FUNCTION "public"."send_request_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_request_notification_direct"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    joinee_email text;
    joinee_name text;
    host_name text;
    host_email text;
    trip_name text;
    trip_location text;
    trip_start_date date;
    trip_end_date date;
    email_subject text;
    email_html text;
    postmark_response RECORD;
    app_url text;
BEGIN
    -- Only proceed if status changed from pending to active or declined
    IF OLD.status = 'pending' AND NEW.status IN ('active', 'declined') THEN
        -- Get joinee details
        SELECT email, name INTO joinee_email, joinee_name
        FROM public."user"
        WHERE id = NEW."userId";
        
        -- Get trip and host details
        SELECT 
            t.name, 
            t.location, 
            t."startDate", 
            t."endDate",
            h.name,
            h.email
        INTO 
            trip_name, 
            trip_location, 
            trip_start_date, 
            trip_end_date,
            host_name,
            host_email
        FROM public.trip t
        JOIN public."user" h ON t."hostId" = h.id
        WHERE t.id = NEW."tripId";
        
        -- Get app URL from settings or use default
        app_url := coalesce(current_setting('app.frontend_url', true), 'https://splitstay.com');
        
        -- Prepare email content based on status
        IF NEW.status = 'active' THEN
            email_subject := 'Great news! Your request to join "' || trip_name || '" has been accepted!';
            email_html := 
                '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' ||
                '<h2 style="color: #1A1E62;">Congratulations ' || coalesce(joinee_name, 'there') || '! 🎉</h2>' ||
                '<p>Your request to join the trip "<strong>' || trip_name || '</strong>" has been accepted by ' || host_name || '!</p>' ||
                '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">' ||
                '<h3 style="margin-top: 0; color: #1A1E62;">Trip Details:</h3>' ||
                '<ul style="list-style: none; padding: 0;">' ||
                '<li style="margin: 8px 0;"><strong>📍 Destination:</strong> ' || trip_location || '</li>' ||
                '<li style="margin: 8px 0;"><strong>📅 Dates:</strong> ' || to_char(trip_start_date, 'Mon DD, YYYY') || ' - ' || to_char(trip_end_date, 'Mon DD, YYYY') || '</li>' ||
                '<li style="margin: 8px 0;"><strong>👤 Host:</strong> ' || host_name || '</li>' ||
                '</ul>' ||
                '</div>' ||
                '<p>The host will contact you soon with more details about the trip arrangements.</p>' ||
                '<p>You can also reach out to them at: <a href="mailto:' || host_email || '">' || host_email || '</a></p>' ||
                '<p style="margin-top: 30px;">Have a wonderful trip!</p>' ||
                '<p style="color: #666;"><em>- The SplitStay Team</em></p>' ||
                '</div>';
        ELSE -- declined
            email_subject := 'Update on your request to join "' || trip_name || '"';
            email_html := 
                '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' ||
                '<h2 style="color: #1A1E62;">Hi ' || coalesce(joinee_name, 'there') || ',</h2>' ||
                '<p>We wanted to let you know that your request to join "<strong>' || trip_name || '</strong>" was not accepted at this time.</p>' ||
                '<p>Don''t worry - there are many other amazing trips available on SplitStay!</p>' ||
                '<div style="text-align: center; margin: 30px 0;">' ||
                '<a href="' || app_url || '/find" style="background-color: #1A1E62; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Browse More Trips</a>' ||
                '</div>' ||
                '<p>Keep exploring and you''ll find the perfect travel match!</p>' ||
                '<p style="margin-top: 30px; color: #666;"><em>- The SplitStay Team</em></p>' ||
                '</div>';
        END IF;
        
        -- Try to send email directly via Edge Function
        BEGIN
            -- Use pg_net if available, otherwise queue for later processing
            IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'http') THEN
                -- Call send-request-notification Edge Function directly
                SELECT * FROM http((
                    'POST',
                    coalesce(current_setting('app.supabase_url', true), 'https://dhqvohruecmttgfkfdeb.supabase.co') || '/functions/v1/send-request-notification',
                    ARRAY[
                        http_header('Authorization', 'Bearer ' || coalesce(current_setting('app.supabase_service_role_key', true), '')),
                        http_header('Content-Type', 'application/json')
                    ],
                    json_build_object(
                        'type', 'UPDATE',
                        'table', 'request',
                        'record', json_build_object(
                            'id', NEW.id,
                            'userId', NEW."userId",
                            'tripId', NEW."tripId", 
                            'status', NEW.status
                        ),
                        'old_record', json_build_object(
                            'status', OLD.status
                        )
                    )::text
                )) INTO postmark_response;
                
                -- Log the email in notifications table for tracking
                INSERT INTO public.email_notifications (
                    recipient_email,
                    recipient_name,
                    subject,
                    body,
                    status,
                    sent_at,
                    created_at
                ) VALUES (
                    joinee_email,
                    joinee_name,
                    email_subject,
                    email_html,
                    CASE WHEN postmark_response.status = 200 THEN 'sent' ELSE 'failed' END,
                    CASE WHEN postmark_response.status = 200 THEN now() ELSE NULL END,
                    now()
                );
            ELSE
                -- Fallback: Queue for later processing
                INSERT INTO public.email_notifications (
                    recipient_email,
                    recipient_name,
                    subject,
                    body,
                    status,
                    created_at
                ) VALUES (
                    joinee_email,
                    joinee_name,
                    email_subject,
                    email_html,
                    'pending',
                    now()
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- On any error, queue the email for later processing
            INSERT INTO public.email_notifications (
                recipient_email,
                recipient_name,
                subject,
                body,
                status,
                error_message,
                created_at
            ) VALUES (
                joinee_email,
                joinee_name,
                email_subject,
                email_html,
                'failed',
                SQLERRM,
                now()
            );
        END;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."send_request_notification_direct"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_request_status"("request_id" "uuid", "new_status" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    updated_request json;
BEGIN
    -- Validate the new status
    IF new_status NOT IN ('pending', 'active', 'declined') THEN
        RAISE EXCEPTION 'Invalid status: %', new_status;
    END IF;
    
    -- Update the request status
    UPDATE request 
    SET 
        status = new_status::request_status,
        "updatedAt" = NOW()
    WHERE id = request_id;
    
    -- Check if any row was actually updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found: %', request_id;
    END IF;
    
    -- Return the updated request
    SELECT to_json(r.*) INTO updated_request
    FROM request r
    WHERE r.id = request_id;
    
    RETURN updated_request;
END;
$$;


ALTER FUNCTION "public"."update_request_status"("request_id" "uuid", "new_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_presence"("p_user_id" "uuid", "p_is_online" boolean, "p_typing_in_conversation_id" "uuid" DEFAULT NULL::"uuid", "p_device_info" "jsonb" DEFAULT '{}'::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_start_time timestamptz;
BEGIN
    v_start_time := clock_timestamp();
    
    -- Authorization check
    IF p_user_id != auth.uid() THEN
        PERFORM public.raise_messaging_error(
            'UNAUTHORIZED_PRESENCE_UPDATE',
            'User not authorized to update presence',
            jsonb_build_object('user_id', p_user_id, 'auth_uid', auth.uid())
        );
    END IF;
    
    -- Validate typing conversation access if provided
    IF p_typing_in_conversation_id IS NOT NULL AND NOT public.user_can_access_conversation(p_typing_in_conversation_id, p_user_id) THEN
        PERFORM public.raise_messaging_error(
            'UNAUTHORIZED_TYPING_CONVERSATION',
            'User not authorized to set typing status in this conversation',
            jsonb_build_object('conversation_id', p_typing_in_conversation_id, 'user_id', p_user_id)
        );
    END IF;
    
    -- Update or insert presence
    INSERT INTO public.user_presence (user_id, is_online, last_seen_at, typing_in_conversation_id, device_info)
    VALUES (p_user_id, p_is_online, now(), p_typing_in_conversation_id, p_device_info)
    ON CONFLICT (user_id) DO UPDATE SET
        is_online = EXCLUDED.is_online,
        last_seen_at = CASE WHEN EXCLUDED.is_online THEN now() ELSE user_presence.last_seen_at END,
        typing_in_conversation_id = EXCLUDED.typing_in_conversation_id,
        device_info = EXCLUDED.device_info,
        updated_at = now();
    
    -- Log performance
    PERFORM public.log_messaging_performance(
        'update_user_presence',
        extract(milliseconds from clock_timestamp() - v_start_time)::integer,
        p_user_id
    );
    
    RETURN TRUE;
    
EXCEPTION WHEN OTHERS THEN
    PERFORM public.raise_messaging_error(
        'UPDATE_PRESENCE_ERROR',
        'Failed to update user presence',
        jsonb_build_object(
            'user_id', p_user_id,
            'sql_error', SQLERRM
        )
    );
    RAISE;
END;
$$;


ALTER FUNCTION "public"."update_user_presence"("p_user_id" "uuid", "p_is_online" boolean, "p_typing_in_conversation_id" "uuid", "p_device_info" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_can_access_conversation"("p_conversation_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = p_conversation_id
        AND (c.user1_id = p_user_id OR c.user2_id = p_user_id)
    );
END;
$$;


ALTER FUNCTION "public"."user_can_access_conversation"("p_conversation_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_min_role_level"("user_id" "uuid", "min_level" integer) RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public."user" u
    join public.role r on u.role_id = r.id
    where u.id = user_id and r.level >= min_level
  );
$$;


ALTER FUNCTION "public"."user_has_min_role_level"("user_id" "uuid", "min_level" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_role"("user_id" "uuid", "role_name" "text") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public."user" u
    join public.role r on u.role_id = r.id
    where u.id = user_id and r.name = role_name
  );
$$;


ALTER FUNCTION "public"."user_has_role"("user_id" "uuid", "role_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_message_content"("p_content" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    cleaned_content text;
BEGIN
    -- Trim whitespace
    cleaned_content := trim(p_content);
    
    -- Length validation
    IF length(cleaned_content) = 0 THEN
        RAISE EXCEPTION 'Message cannot be empty';
    END IF;
    
    IF length(cleaned_content) > 2000 THEN
        RAISE EXCEPTION 'Message too long (maximum 2000 characters)';
    END IF;
    
    -- Basic sanitization (remove potential HTML/script tags)
    cleaned_content := regexp_replace(cleaned_content, '<[^>]*>', '', 'g');
    
    -- Remove null bytes and control characters (except newlines and tabs)
    cleaned_content := regexp_replace(cleaned_content, '[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g');
    
    RETURN cleaned_content;
END;
$$;


ALTER FUNCTION "public"."validate_message_content"("p_content" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_message_sender"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check if sender is part of the conversation
    IF NOT EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = NEW.conversation_id 
        AND (c.user1_id = NEW.sender_id OR c.user2_id = NEW.sender_id)
    ) THEN
        RAISE EXCEPTION 'Sender is not part of this conversation';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_message_sender"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accommodation_type" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."accommodation_type" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user1_id" "uuid" NOT NULL,
    "user2_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_message_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_archived_by_user1" boolean DEFAULT false NOT NULL,
    "is_archived_by_user2" boolean DEFAULT false NOT NULL,
    CONSTRAINT "conversations_different_users" CHECK (("user1_id" <> "user2_id")),
    CONSTRAINT "conversations_user_order" CHECK (("user1_id" < "user2_id"))
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_email" "text" NOT NULL,
    "recipient_name" "text",
    "subject" "text" NOT NULL,
    "body" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "sent_at" timestamp with time zone,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "email_notifications_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."email_notifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."email_notifications" IS 'Queue for email notifications to be sent';



CREATE TABLE IF NOT EXISTS "public"."location" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "city" "text" NOT NULL,
    "country" "text" NOT NULL,
    "countryCode" "text" NOT NULL,
    "displayName" "text" NOT NULL,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "region" "text",
    "createdAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."location" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_delivery_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid",
    "event_type" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "message_delivery_log_event_type_check" CHECK (("event_type" = ANY (ARRAY['sent'::"text", 'delivered'::"text", 'failed'::"text", 'read'::"text"])))
);


ALTER TABLE "public"."message_delivery_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_read_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "read_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."message_read_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "deleted_at" timestamp with time zone,
    "edited_at" timestamp with time zone,
    "message_type" "text" DEFAULT 'text'::"text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."messages" IS 'Individual messages in conversations';



CREATE TABLE IF NOT EXISTS "public"."messaging_performance_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "operation" "text" NOT NULL,
    "duration_ms" integer NOT NULL,
    "user_id" "uuid",
    "conversation_id" "uuid",
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."messaging_performance_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."request" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "uuid",
    "tripId" "uuid",
    "status" "public"."request_status" DEFAULT 'pending'::"public"."request_status",
    "message" "text",
    "createdAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."request" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reviewerId" "uuid",
    "revieweeId" "uuid",
    "tripId" "uuid",
    "stars" "public"."review_stars" NOT NULL,
    "comment" "text" NOT NULL,
    "imageUrl" "text",
    "createdAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."review" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "level" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."role" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."room" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "villa_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "pictures" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "description" "text",
    "occupant_id" "uuid"
);


ALTER TABLE "public"."room" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."room_request" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "message" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "room_request_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'declined'::"text"])))
);


ALTER TABLE "public"."room_request" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text" NOT NULL,
    "locationId" "uuid",
    "startDate" "date",
    "endDate" "date",
    "hostId" "uuid",
    "joineeId" "uuid",
    "bookingUrl" "text",
    "thumbnailUrl" "text",
    "createdAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "accommodationTypeId" "text",
    "personalNote" "text",
    "vibe" "text",
    "tripLink" character varying(255),
    "flexible" boolean DEFAULT false NOT NULL,
    "estimatedmonth" "text",
    "estimatedyear" "text",
    "numberofrooms" integer,
    "rooms" "jsonb",
    "matchwith" "text",
    "ispublic" boolean DEFAULT true,
    CONSTRAINT "trip_flexible_dates_check" CHECK ((("flexible" = true) OR (("flexible" = false) AND ("startDate" IS NOT NULL) AND ("endDate" IS NOT NULL)))),
    CONSTRAINT "trip_matchwith_check" CHECK (("matchwith" = ANY (ARRAY['male'::"text", 'female'::"text", 'anyone'::"text"])))
);


ALTER TABLE "public"."trip" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trip"."personalNote" IS 'Personal note about accommodation details (e.g., I will be staying at XYZ Hotel, 2 minutes from the beach!)';



COMMENT ON COLUMN "public"."trip"."vibe" IS 'Trip vibe/description about the travelers expectations and style (e.g., I am chill, want to explore and relax — not looking to party.)';



COMMENT ON COLUMN "public"."trip"."tripLink" IS 'URL-friendly slug for the trip, used in public URLs instead of UUID';



COMMENT ON COLUMN "public"."trip"."flexible" IS 'True when user selects "I''m flexible / Dates not confirmed yet"';



COMMENT ON COLUMN "public"."trip"."estimatedmonth" IS 'Month name when flexible=true (e.g., "September")';



COMMENT ON COLUMN "public"."trip"."estimatedyear" IS 'Year when flexible=true (e.g., "2025")';



COMMENT ON COLUMN "public"."trip"."numberofrooms" IS 'Number of rooms in accommodation';



COMMENT ON COLUMN "public"."trip"."rooms" IS 'JSON array of room configurations with beds and ensuite info';



COMMENT ON COLUMN "public"."trip"."matchwith" IS 'Gender preference for trip matching';



COMMENT ON COLUMN "public"."trip"."ispublic" IS 'Whether trip is visible in public search';



CREATE TABLE IF NOT EXISTS "public"."user" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "bio" "text",
    "birthPlace" "text",
    "currentPlace" "text",
    "dayOfBirth" integer,
    "monthOfBirth" integer,
    "yearOfBirth" integer,
    "gender" "text",
    "imageUrl" "text",
    "profilePicture" "text",
    "instagramUrl" "text",
    "personalizedLink" "text",
    "profileCreated" boolean DEFAULT false,
    "shareModalShown" boolean DEFAULT false,
    "languages" "jsonb",
    "learningLanguages" "jsonb",
    "mostInfluencedCountry" "text",
    "mostInfluencedCountryDescription" "text",
    "mostInfluencedExperience" "text",
    "travelPhotos" "jsonb",
    "travelTraits" "jsonb",
    "whatsapp" "text",
    "createdAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "role_id" "uuid"
);


ALTER TABLE "public"."user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_presence" (
    "user_id" "uuid" NOT NULL,
    "is_online" boolean DEFAULT false NOT NULL,
    "last_seen_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "typing_in_conversation_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "device_info" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."user_presence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."villa" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "location" "text" NOT NULL,
    "location_id" "uuid",
    "pictures" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "description" "text",
    "created_by" "uuid"
);


ALTER TABLE "public"."villa" OWNER TO "postgres";


ALTER TABLE ONLY "public"."accommodation_type"
    ADD CONSTRAINT "accommodation_type_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user1_id_user2_id_key" UNIQUE ("user1_id", "user2_id");



ALTER TABLE ONLY "public"."email_notifications"
    ADD CONSTRAINT "email_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."location"
    ADD CONSTRAINT "location_city_country_unique" UNIQUE ("city", "country");



ALTER TABLE ONLY "public"."location"
    ADD CONSTRAINT "location_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message_delivery_log"
    ADD CONSTRAINT "message_delivery_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message_read_status"
    ADD CONSTRAINT "message_read_status_message_id_user_id_key" UNIQUE ("message_id", "user_id");



ALTER TABLE ONLY "public"."message_read_status"
    ADD CONSTRAINT "message_read_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messaging_performance_log"
    ADD CONSTRAINT "messaging_performance_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."request"
    ADD CONSTRAINT "request_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review"
    ADD CONSTRAINT "review_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role"
    ADD CONSTRAINT "role_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."role"
    ADD CONSTRAINT "role_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room"
    ADD CONSTRAINT "room_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room_request"
    ADD CONSTRAINT "room_request_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_tripLink_key" UNIQUE ("tripLink");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."villa"
    ADD CONSTRAINT "villa_pkey" PRIMARY KEY ("id");



CREATE INDEX "conversations_last_message_at_idx" ON "public"."conversations" USING "btree" ("last_message_at" DESC);



CREATE INDEX "idx_conversations_last_message_desc" ON "public"."conversations" USING "btree" ("last_message_at" DESC);



CREATE INDEX "idx_conversations_updated_desc" ON "public"."conversations" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_conversations_users" ON "public"."conversations" USING "btree" ("user1_id", "user2_id");



CREATE INDEX "idx_conversations_users_basic" ON "public"."conversations" USING "btree" ("user1_id", "user2_id");



CREATE INDEX "idx_email_notifications_created_at" ON "public"."email_notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_email_notifications_status" ON "public"."email_notifications" USING "btree" ("status") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_location_country" ON "public"."location" USING "btree" ("country");



CREATE INDEX "idx_location_display_name" ON "public"."location" USING "btree" ("displayName");



CREATE INDEX "idx_location_region" ON "public"."location" USING "btree" ("region");



CREATE INDEX "idx_message_delivery_log_message_type" ON "public"."message_delivery_log" USING "btree" ("message_id", "event_type", "timestamp" DESC);



CREATE INDEX "idx_message_read_status_composite" ON "public"."message_read_status" USING "btree" ("user_id", "message_id", "read_at" DESC);



CREATE INDEX "idx_message_read_status_lookup" ON "public"."message_read_status" USING "btree" ("message_id", "user_id");



CREATE INDEX "idx_message_read_status_message" ON "public"."message_read_status" USING "btree" ("message_id", "user_id");



CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_messages_conversation_active" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_messages_conversation_basic" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "idx_messages_conversation_created" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "idx_messages_conversation_created_desc" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_messages_conversation_sender" ON "public"."messages" USING "btree" ("conversation_id", "sender_id");



CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_messages_sender_created" ON "public"."messages" USING "btree" ("sender_id", "created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_messages_unread_lookup" ON "public"."messages" USING "btree" ("sender_id", "conversation_id", "created_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_messaging_performance_operation_time" ON "public"."messaging_performance_log" USING "btree" ("operation", "timestamp" DESC);



CREATE INDEX "idx_read_status_user_message_basic" ON "public"."message_read_status" USING "btree" ("user_id", "message_id");



CREATE INDEX "idx_request_status" ON "public"."request" USING "btree" ("status");



CREATE INDEX "idx_request_trip" ON "public"."request" USING "btree" ("tripId");



CREATE INDEX "idx_request_trip_id" ON "public"."request" USING "btree" ("tripId");



CREATE INDEX "idx_request_user" ON "public"."request" USING "btree" ("userId");



CREATE INDEX "idx_request_user_id" ON "public"."request" USING "btree" ("userId");



CREATE INDEX "idx_review_reviewee_id" ON "public"."review" USING "btree" ("revieweeId");



CREATE INDEX "idx_review_reviewer_id" ON "public"."review" USING "btree" ("reviewerId");



CREATE INDEX "idx_review_stars" ON "public"."review" USING "btree" ("stars");



CREATE INDEX "idx_review_trip_id" ON "public"."review" USING "btree" ("tripId");



CREATE INDEX "idx_role_name" ON "public"."role" USING "btree" ("name");



CREATE INDEX "idx_room_villa_id" ON "public"."room" USING "btree" ("villa_id");



CREATE INDEX "idx_trip_accommodation_type_id" ON "public"."trip" USING "btree" ("accommodationTypeId");



CREATE INDEX "idx_trip_dates" ON "public"."trip" USING "btree" ("startDate", "endDate") WHERE (("startDate" IS NOT NULL) AND ("endDate" IS NOT NULL));



CREATE INDEX "idx_trip_flexible" ON "public"."trip" USING "btree" ("flexible");



CREATE INDEX "idx_trip_flexible_dates" ON "public"."trip" USING "btree" ("flexible", "estimatedmonth", "estimatedyear");



CREATE INDEX "idx_trip_host_id" ON "public"."trip" USING "btree" ("hostId");



CREATE INDEX "idx_trip_joinee_id" ON "public"."trip" USING "btree" ("joineeId");



CREATE INDEX "idx_trip_link" ON "public"."trip" USING "btree" ("tripLink");



CREATE INDEX "idx_trip_location_id" ON "public"."trip" USING "btree" ("locationId");



CREATE INDEX "idx_trip_public" ON "public"."trip" USING "btree" ("ispublic");



CREATE INDEX "idx_user_created_at" ON "public"."user" USING "btree" ("createdAt" DESC);



CREATE INDEX "idx_user_presence_is_online" ON "public"."user_presence" USING "btree" ("is_online", "last_seen_at");



CREATE INDEX "idx_user_presence_online" ON "public"."user_presence" USING "btree" ("is_online", "last_seen_at" DESC) WHERE ("is_online" = true);



CREATE INDEX "idx_user_presence_typing" ON "public"."user_presence" USING "btree" ("typing_in_conversation_id", "user_id") WHERE ("typing_in_conversation_id" IS NOT NULL);



CREATE INDEX "idx_user_role_id" ON "public"."user" USING "btree" ("role_id");



CREATE INDEX "messages_conversation_id_created_at_idx" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE OR REPLACE TRIGGER "email_notifications" AFTER INSERT ON "public"."email_notifications" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://dhqvohruecmttgfkfdeb.supabase.co/functions/v1/webhook-email', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRocXZvaHJ1ZWNtdHRnZmtmZGViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4NDMxNSwiZXhwIjoyMDY4MDYwMzE1fQ.0YTSmt3qSUilrtopQVM8izu_5xy6fq1nylGWPpOsHbU"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "handle_location_updated_at" BEFORE UPDATE ON "public"."location" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_request_updated_at" BEFORE UPDATE ON "public"."request" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_review_updated_at" BEFORE UPDATE ON "public"."review" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_trip_updated_at" BEFORE UPDATE ON "public"."trip" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_user_updated_at" BEFORE UPDATE ON "public"."user" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_request_status_change" AFTER UPDATE ON "public"."request" FOR EACH ROW EXECUTE FUNCTION "public"."send_request_notification_direct"();



CREATE OR REPLACE TRIGGER "trigger_notify_new_message" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."notify_new_message"();



CREATE OR REPLACE TRIGGER "trigger_notify_offline_message" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."notify_offline_message_webhook"();



CREATE OR REPLACE TRIGGER "trigger_notify_trip_join_request" AFTER INSERT ON "public"."request" FOR EACH ROW EXECUTE FUNCTION "public"."notify_trip_join_request_webhook"();



CREATE OR REPLACE TRIGGER "trigger_queue_message_notification" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."queue_message_notification"();



CREATE OR REPLACE TRIGGER "validate_message_sender_trigger" BEFORE INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."validate_message_sender"();



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_delivery_log"
    ADD CONSTRAINT "message_delivery_log_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_delivery_log"
    ADD CONSTRAINT "message_delivery_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_read_status"
    ADD CONSTRAINT "message_read_status_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_read_status"
    ADD CONSTRAINT "message_read_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messaging_performance_log"
    ADD CONSTRAINT "messaging_performance_log_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messaging_performance_log"
    ADD CONSTRAINT "messaging_performance_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."request"
    ADD CONSTRAINT "request_tripid_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."trip"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."request"
    ADD CONSTRAINT "request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id");



ALTER TABLE ONLY "public"."review"
    ADD CONSTRAINT "review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "public"."user"("id");



ALTER TABLE ONLY "public"."review"
    ADD CONSTRAINT "review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id");



ALTER TABLE ONLY "public"."review"
    ADD CONSTRAINT "review_tripid_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."trip"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room"
    ADD CONSTRAINT "room_occupant_id_fkey" FOREIGN KEY ("occupant_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."room_request"
    ADD CONSTRAINT "room_request_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room_request"
    ADD CONSTRAINT "room_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room"
    ADD CONSTRAINT "room_villa_id_fkey" FOREIGN KEY ("villa_id") REFERENCES "public"."villa"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_accommodation_type_id_fkey" FOREIGN KEY ("accommodationTypeId") REFERENCES "public"."accommodation_type"("id");



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."user"("id");



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_joineeId_fkey" FOREIGN KEY ("joineeId") REFERENCES "public"."user"("id");



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."location"("id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_typing_in_conversation_id_fkey" FOREIGN KEY ("typing_in_conversation_id") REFERENCES "public"."conversations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."villa"
    ADD CONSTRAINT "villa_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."villa"
    ADD CONSTRAINT "villa_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id");



CREATE POLICY "Allow authenticated users to insert locations" ON "public"."location" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read locations" ON "public"."location" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow public read access to trips" ON "public"."trip" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can view rooms" ON "public"."room" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create rooms" ON "public"."room" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can create villas" ON "public"."villa" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can delete rooms" ON "public"."room" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can delete villas" ON "public"."villa" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can update rooms" ON "public"."room" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can update villas" ON "public"."villa" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Host can delete their trips" ON "public"."trip" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "hostId"));



CREATE POLICY "Host can update their trips" ON "public"."trip" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "hostId"));



CREATE POLICY "Only super admins can delete roles" ON "public"."role" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user" "u"
     JOIN "public"."role" "r" ON (("u"."role_id" = "r"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("r"."name" = 'super_admin'::"text")))));



CREATE POLICY "Only super admins can insert roles" ON "public"."role" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user" "u"
     JOIN "public"."role" "r" ON (("u"."role_id" = "r"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("r"."name" = 'super_admin'::"text")))));



CREATE POLICY "Only super admins can update roles" ON "public"."role" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user" "u"
     JOIN "public"."role" "r" ON (("u"."role_id" = "r"."id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("r"."name" = 'super_admin'::"text")))));



CREATE POLICY "Roles are viewable by everyone" ON "public"."role" FOR SELECT USING (true);



CREATE POLICY "Rooms are viewable by everyone" ON "public"."room" FOR SELECT USING (true);



CREATE POLICY "Service role can manage email notifications" ON "public"."email_notifications" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can create requests" ON "public"."request" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "userId"));



CREATE POLICY "Users can create reviews" ON "public"."review" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "reviewerId"));



CREATE POLICY "Users can create trips" ON "public"."trip" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "hostId"));



CREATE POLICY "Users can insert their own room requests" ON "public"."room_request" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can mark messages as read" ON "public"."message_read_status" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversations" "c" ON (("c"."id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_read_status"."message_id") AND (("c"."user1_id" = "auth"."uid"()) OR ("c"."user2_id" = "auth"."uid"())))))));



CREATE POLICY "Users can send messages" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((("sender_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "messages"."conversation_id") AND (("c"."user1_id" = "auth"."uid"()) OR ("c"."user2_id" = "auth"."uid"())))))));



CREATE POLICY "Users can update their conversations" ON "public"."conversations" FOR UPDATE TO "authenticated" USING ((("user1_id" = "auth"."uid"()) OR ("user2_id" = "auth"."uid"()))) WITH CHECK ((("user1_id" = "auth"."uid"()) OR ("user2_id" = "auth"."uid"())));



CREATE POLICY "Users can update their own profile" ON "public"."user" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view all reviews" ON "public"."review" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view all users" ON "public"."user" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view relevant presence" ON "public"."user_presence" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("user_id" IN ( SELECT
        CASE
            WHEN ("conversations"."user1_id" = "auth"."uid"()) THEN "conversations"."user2_id"
            ELSE "conversations"."user1_id"
        END AS "user1_id"
   FROM "public"."conversations"
  WHERE (("conversations"."user1_id" = "auth"."uid"()) OR ("conversations"."user2_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view requests for their trips" ON "public"."request" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."trip"
  WHERE (("trip"."id" = "request"."tripId") AND ("trip"."hostId" = "auth"."uid"())))) OR ("userId" = "auth"."uid"())));



CREATE POLICY "Users can view their conversations" ON "public"."conversations" FOR SELECT TO "authenticated" USING ((("user1_id" = "auth"."uid"()) OR ("user2_id" = "auth"."uid"())));



CREATE POLICY "Users can view their delivery logs" ON "public"."message_delivery_log" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own room requests" ON "public"."room_request" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their performance logs" ON "public"."messaging_performance_log" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their read status" ON "public"."message_read_status" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversations" "c" ON (("c"."id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_read_status"."message_id") AND (("c"."user1_id" = "auth"."uid"()) OR ("c"."user2_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view trips" ON "public"."trip" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view user roles" ON "public"."user" FOR SELECT USING (true);



CREATE POLICY "Villa creators can update room request status" ON "public"."room_request" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."room"
     JOIN "public"."villa" ON (("villa"."id" = "room"."villa_id")))
  WHERE (("room"."id" = "room_request"."room_id") AND ("villa"."created_by" = "auth"."uid"())))));



CREATE POLICY "Villa creators can update their rooms" ON "public"."room" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."villa"
  WHERE (("villa"."id" = "room"."villa_id") AND ("villa"."created_by" = "auth"."uid"())))));



CREATE POLICY "Villa creators can view room requests for their villas" ON "public"."room_request" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."room"
     JOIN "public"."villa" ON (("villa"."id" = "room"."villa_id")))
  WHERE (("room"."id" = "room_request"."room_id") AND ("villa"."created_by" = "auth"."uid"())))));



CREATE POLICY "Villas are viewable by everyone" ON "public"."villa" FOR SELECT USING (true);



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversations_delete_participants" ON "public"."conversations" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



CREATE POLICY "conversations_insert_policy" ON "public"."conversations" FOR INSERT WITH CHECK ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



CREATE POLICY "conversations_insert_self" ON "public"."conversations" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



CREATE POLICY "conversations_select_participants" ON "public"."conversations" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



CREATE POLICY "conversations_select_policy" ON "public"."conversations" FOR SELECT USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



CREATE POLICY "conversations_update_participants" ON "public"."conversations" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id"))) WITH CHECK ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



CREATE POLICY "conversations_update_policy" ON "public"."conversations" FOR UPDATE USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



ALTER TABLE "public"."email_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."location" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."message_delivery_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."message_read_status" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "message_read_status_insert_policy" ON "public"."message_read_status" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversations" "c" ON (("c"."id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_read_status"."message_id") AND (("c"."user1_id" = "auth"."uid"()) OR ("c"."user2_id" = "auth"."uid"())))))));



CREATE POLICY "message_read_status_select_policy" ON "public"."message_read_status" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversations" "c" ON (("c"."id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_read_status"."message_id") AND (("c"."user1_id" = "auth"."uid"()) OR ("c"."user2_id" = "auth"."uid"())))))));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_delete_sender" ON "public"."messages" FOR DELETE TO "authenticated" USING (("sender_id" = "auth"."uid"()));



CREATE POLICY "messages_insert_policy" ON "public"."messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."user1_id" = "auth"."uid"()) OR ("conversations"."user2_id" = "auth"."uid"())))))));



CREATE POLICY "messages_insert_sender_is_participant" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((("sender_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "messages"."conversation_id") AND (("auth"."uid"() = "c"."user1_id") OR ("auth"."uid"() = "c"."user2_id")))))));



CREATE POLICY "messages_select_participants" ON "public"."messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "messages"."conversation_id") AND (("auth"."uid"() = "c"."user1_id") OR ("auth"."uid"() = "c"."user2_id"))))));



CREATE POLICY "messages_select_policy" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."user1_id" = "auth"."uid"()) OR ("conversations"."user2_id" = "auth"."uid"()))))));



CREATE POLICY "messages_update_policy" ON "public"."messages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."user1_id" = "auth"."uid"()) OR ("conversations"."user2_id" = "auth"."uid"()))))));



CREATE POLICY "messages_update_sender" ON "public"."messages" FOR UPDATE TO "authenticated" USING (("sender_id" = "auth"."uid"())) WITH CHECK (("sender_id" = "auth"."uid"()));



ALTER TABLE "public"."messaging_performance_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."request" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."room" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."room_request" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_presence" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_presence_insert_policy" ON "public"."user_presence" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_presence_select_policy" ON "public"."user_presence" FOR SELECT USING (true);



CREATE POLICY "user_presence_update_policy" ON "public"."user_presence" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "user_select_authenticated" ON "public"."user" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."villa" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




























































































































































GRANT ALL ON FUNCTION "public"."accept_room_request"("p_request_id" "uuid", "p_room_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_room_request"("p_request_id" "uuid", "p_room_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_room_request"("p_request_id" "uuid", "p_room_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."accept_trip_request"("p_request_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_trip_request"("p_request_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_trip_request"("p_request_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_message_rate_limit"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_message_rate_limit"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_message_rate_limit"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_message"("p_message_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_message"("p_message_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_message"("p_message_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."edit_message"("p_message_id" "uuid", "p_user_id" "uuid", "p_new_content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."edit_message"("p_message_id" "uuid", "p_user_id" "uuid", "p_new_content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."edit_message"("p_message_id" "uuid", "p_user_id" "uuid", "p_new_content" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_conversation_messages"("p_conversation_id" "uuid", "p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_conversation_messages"("p_conversation_id" "uuid", "p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_conversation_messages"("p_conversation_id" "uuid", "p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_or_create_conversation"("p_user1_id" "uuid", "p_user2_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_conversation"("p_user1_id" "uuid", "p_user2_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_conversation"("p_user1_id" "uuid", "p_user2_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unread_message_count"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_conversations"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_conversations"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_conversations"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_conversations"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_conversations"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_conversations"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_conversations_fast"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_conversations_fast"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_conversations_fast"("p_user_id" "uuid", "p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "postgres";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "anon";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "postgres";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "anon";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "postgres";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "anon";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_online"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_online"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_online"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_messaging_performance"("p_operation" "text", "p_duration_ms" integer, "p_user_id" "uuid", "p_conversation_id" "uuid", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_messaging_performance"("p_operation" "text", "p_duration_ms" integer, "p_user_id" "uuid", "p_conversation_id" "uuid", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_messaging_performance"("p_operation" "text", "p_duration_ms" integer, "p_user_id" "uuid", "p_conversation_id" "uuid", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_messages_as_read"("p_conversation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_messages_as_read"("p_conversation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_messages_as_read"("p_conversation_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_direct_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_direct_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_direct_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_direct_message_http"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_direct_message_http"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_direct_message_http"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_offline_message_webhook"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_offline_message_webhook"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_offline_message_webhook"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_trip_join_request_webhook"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_trip_join_request_webhook"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_trip_join_request_webhook"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_pending_emails"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_pending_emails"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_pending_emails"() TO "service_role";



GRANT ALL ON FUNCTION "public"."queue_message_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."queue_message_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."queue_message_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."raise_messaging_error"("p_error_code" "text", "p_error_message" "text", "p_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."raise_messaging_error"("p_error_code" "text", "p_error_message" "text", "p_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."raise_messaging_error"("p_error_code" "text", "p_error_message" "text", "p_details" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_message"("p_conversation_id" "uuid", "p_sender_id" "uuid", "p_content" "text", "p_message_type" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_request_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_request_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_request_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."send_request_notification_direct"() TO "anon";
GRANT ALL ON FUNCTION "public"."send_request_notification_direct"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_request_notification_direct"() TO "service_role";



GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_request_status"("request_id" "uuid", "new_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_request_status"("request_id" "uuid", "new_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_request_status"("request_id" "uuid", "new_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_presence"("p_user_id" "uuid", "p_is_online" boolean, "p_typing_in_conversation_id" "uuid", "p_device_info" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_presence"("p_user_id" "uuid", "p_is_online" boolean, "p_typing_in_conversation_id" "uuid", "p_device_info" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_presence"("p_user_id" "uuid", "p_is_online" boolean, "p_typing_in_conversation_id" "uuid", "p_device_info" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."user_can_access_conversation"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_can_access_conversation"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_can_access_conversation"("p_conversation_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_min_role_level"("user_id" "uuid", "min_level" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_min_role_level"("user_id" "uuid", "min_level" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_min_role_level"("user_id" "uuid", "min_level" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_role"("user_id" "uuid", "role_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_role"("user_id" "uuid", "role_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_role"("user_id" "uuid", "role_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_message_content"("p_content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_message_content"("p_content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_message_content"("p_content" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_message_sender"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_message_sender"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_message_sender"() TO "service_role";


















GRANT ALL ON TABLE "public"."accommodation_type" TO "anon";
GRANT ALL ON TABLE "public"."accommodation_type" TO "authenticated";
GRANT ALL ON TABLE "public"."accommodation_type" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."email_notifications" TO "anon";
GRANT ALL ON TABLE "public"."email_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."email_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."location" TO "anon";
GRANT ALL ON TABLE "public"."location" TO "authenticated";
GRANT ALL ON TABLE "public"."location" TO "service_role";



GRANT ALL ON TABLE "public"."message_delivery_log" TO "anon";
GRANT ALL ON TABLE "public"."message_delivery_log" TO "authenticated";
GRANT ALL ON TABLE "public"."message_delivery_log" TO "service_role";



GRANT ALL ON TABLE "public"."message_read_status" TO "anon";
GRANT ALL ON TABLE "public"."message_read_status" TO "authenticated";
GRANT ALL ON TABLE "public"."message_read_status" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."messaging_performance_log" TO "anon";
GRANT ALL ON TABLE "public"."messaging_performance_log" TO "authenticated";
GRANT ALL ON TABLE "public"."messaging_performance_log" TO "service_role";



GRANT ALL ON TABLE "public"."request" TO "anon";
GRANT ALL ON TABLE "public"."request" TO "authenticated";
GRANT ALL ON TABLE "public"."request" TO "service_role";



GRANT ALL ON TABLE "public"."review" TO "anon";
GRANT ALL ON TABLE "public"."review" TO "authenticated";
GRANT ALL ON TABLE "public"."review" TO "service_role";



GRANT ALL ON TABLE "public"."role" TO "anon";
GRANT ALL ON TABLE "public"."role" TO "authenticated";
GRANT ALL ON TABLE "public"."role" TO "service_role";



GRANT ALL ON TABLE "public"."room" TO "anon";
GRANT ALL ON TABLE "public"."room" TO "authenticated";
GRANT ALL ON TABLE "public"."room" TO "service_role";



GRANT ALL ON TABLE "public"."room_request" TO "anon";
GRANT ALL ON TABLE "public"."room_request" TO "authenticated";
GRANT ALL ON TABLE "public"."room_request" TO "service_role";



GRANT ALL ON TABLE "public"."trip" TO "anon";
GRANT ALL ON TABLE "public"."trip" TO "authenticated";
GRANT ALL ON TABLE "public"."trip" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



GRANT ALL ON TABLE "public"."user_presence" TO "anon";
GRANT ALL ON TABLE "public"."user_presence" TO "authenticated";
GRANT ALL ON TABLE "public"."user_presence" TO "service_role";



GRANT ALL ON TABLE "public"."villa" TO "anon";
GRANT ALL ON TABLE "public"."villa" TO "authenticated";
GRANT ALL ON TABLE "public"."villa" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























