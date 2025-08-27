-- Script to remove all data for specific users: "Elijah Limaj" and "Elijah"
-- This script handles foreign key constraints by deleting in the correct order

-- First, let's find the user IDs we need to clean up
-- Run this query first to see which users will be affected:
/*
SELECT id, name, email, "profileCreated", "createdAt" 
FROM public."user" 
WHERE name IN ('Elijah Limaj', 'Elijah')
ORDER BY name;
*/

-- STEP 1: Delete data from tables that reference users (in dependency order)

-- Delete user presence data
DELETE FROM public.user_presence 
WHERE user_id IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete message read status
DELETE FROM public.message_read_status 
WHERE user_id IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete message delivery logs
DELETE FROM public.message_delivery_log 
WHERE user_id IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete messaging performance logs
DELETE FROM public.messaging_performance_log 
WHERE user_id IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete messages sent by these users
DELETE FROM public.messages 
WHERE sender_id IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete conversations where these users are participants
DELETE FROM public.conversations 
WHERE user1_id IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
) OR user2_id IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete reviews written by these users
DELETE FROM public.review 
WHERE "reviewerId" IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete reviews received by these users
DELETE FROM public.review 
WHERE "revieweeId" IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete trip requests by these users
DELETE FROM public.request 
WHERE "userId" IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete trips where these users are joinee (set to NULL first to avoid constraint issues)
UPDATE public.trip 
SET "joineeId" = NULL 
WHERE "joineeId" IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete trips hosted by these users
DELETE FROM public.trip 
WHERE "hostId" IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete room requests (if any reference auth.users)
DELETE FROM public.room_request 
WHERE user_id IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- Delete villas created by these users
DELETE FROM public.villa 
WHERE created_by IN (
  SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah')
);

-- STEP 2: Delete from public.user table
DELETE FROM public."user" 
WHERE name IN ('Elijah Limaj', 'Elijah');

-- STEP 3: Delete from auth.users (this should cascade to related auth tables)
-- NOTE: Be very careful with this step - it will permanently remove authentication records
DELETE FROM auth.users 
WHERE id IN (
  -- Get user IDs from raw_user_meta_data since we deleted from public.user
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'full_name' IN ('Elijah Limaj', 'Elijah')
);

-- STEP 4: Clean up any orphaned email notifications
DELETE FROM public.email_notifications 
WHERE recipient_email IN (
  SELECT email FROM auth.users 
  WHERE raw_user_meta_data->>'full_name' IN ('Elijah Limaj', 'Elijah')
);

-- Verification queries to run after cleanup:
/*
-- Check if users are completely removed
SELECT COUNT(*) as remaining_public_users 
FROM public."user" 
WHERE name IN ('Elijah Limaj', 'Elijah');

SELECT COUNT(*) as remaining_auth_users 
FROM auth.users 
WHERE raw_user_meta_data->>'full_name' IN ('Elijah Limaj', 'Elijah');

-- Check for any remaining references
SELECT 'conversations' as table_name, COUNT(*) as count FROM public.conversations 
WHERE user1_id IN (SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah'))
   OR user2_id IN (SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah'))
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages 
WHERE sender_id IN (SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah'))
UNION ALL
SELECT 'trips', COUNT(*) FROM public.trip 
WHERE "hostId" IN (SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah'))
   OR "joineeId" IN (SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah'))
UNION ALL
SELECT 'villas', COUNT(*) FROM public.villa 
WHERE created_by IN (SELECT id FROM public."user" WHERE name IN ('Elijah Limaj', 'Elijah'));
*/
