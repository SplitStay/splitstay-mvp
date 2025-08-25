-- Targeted cleanup for fake/test trips visible in the Find Partner page

BEGIN;

-- First, let's identify the problematic trips more specifically
SELECT 'Trips with generic or test content:' as info;
SELECT 
    t.id as trip_id,
    t.name as trip_name,
    t.description,
    t.location,
    t."hostId",
    u.name as host_name,
    u.email as host_email,
    u."imageUrl" as host_image,
    t."createdAt"
FROM public.trip t
LEFT JOIN public.user u ON t."hostId" = u.id
LEFT JOIN auth.users au ON u.id = au.id
WHERE 
    -- Generic or empty descriptions
    (LOWER(t.description) LIKE '%lorem ipsum%' 
     OR LOWER(t.description) LIKE '%dfrvfs%'
     OR LOWER(t.description) LIKE '%mars%'
     OR LOWER(t.description) LIKE '%martians%'
     OR LOWER(t.description) LIKE '%asgard%'
     OR LOWER(t.description) LIKE '%thor%'
     OR LOWER(t.description) LIKE '%power rangers%'
     OR LOWER(t.description) LIKE '%goblins%'
     OR t.description = ''
     OR t.description IS NULL)
    -- OR hosts with no real profile info
    OR (u.name IS NULL OR u.name = '' OR u.name = 'Host')
    -- OR specific test accounts
    OR (u.name = 'Sarah Chen' OR u.name = 'Marco Rodriguez')
    -- OR hosts with no profile image
    OR (u."imageUrl" IS NULL OR u."imageUrl" = '')
    -- OR suspicious locations
    OR (LOWER(t.location) LIKE '%mars%' 
        OR LOWER(t.location) LIKE '%asgard%')
ORDER BY t."createdAt" DESC;

-- Delete trips with fake/test content in descriptions
DELETE FROM public.trip 
WHERE LOWER(description) LIKE '%lorem ipsum%' 
   OR LOWER(description) LIKE '%dfrvfs%'
   OR LOWER(description) LIKE '%mars%'
   OR LOWER(description) LIKE '%martians%'
   OR LOWER(description) LIKE '%asgard%'
   OR LOWER(description) LIKE '%thor%'
   OR LOWER(description) LIKE '%power rangers%'
   OR LOWER(description) LIKE '%goblins%'
   OR description = ''
   OR description IS NULL;

-- Delete trips with fake locations
DELETE FROM public.trip 
WHERE LOWER(location) LIKE '%mars%' 
   OR LOWER(location) LIKE '%asgard%'
   OR LOWER(location) LIKE '%middle earth%'
   OR LOWER(location) LIKE '%narnia%';

-- Delete trips where host has generic name "Host" or no name, or specific test accounts
DELETE FROM public.trip 
WHERE "hostId" IN (
    SELECT u.id 
    FROM public.user u 
    WHERE u.name IS NULL 
       OR u.name = '' 
       OR u.name = 'Host'
       OR u.name = 'Sarah Chen'
       OR u.name = 'Marco Rodriguez'
       OR LOWER(u.name) LIKE '%test%'
);

-- Delete trips where host has no profile image (likely incomplete profiles)
DELETE FROM public.trip 
WHERE "hostId" IN (
    SELECT u.id 
    FROM public.user u 
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE (u."imageUrl" IS NULL OR u."imageUrl" = '')
    AND u."profileCreated" = false  -- Only delete if profile not properly created
);

-- Clean up users with incomplete profiles that created these trips
DELETE FROM auth.users 
WHERE id IN (
    SELECT au.id 
    FROM auth.users au
    LEFT JOIN public.user u ON au.id = u.id
    WHERE (u.name IS NULL OR u.name = '' OR u.name = 'Host' OR u.name = 'Sarah Chen' OR u.name = 'Marco Rodriguez')
    AND (u."imageUrl" IS NULL OR u."imageUrl" = '' OR u."profileCreated" = false)
);

-- Final verification - show remaining trips
SELECT 'Remaining trips after cleanup:' as info;
SELECT 
    t.id,
    t.name,
    LEFT(t.description, 50) as description_preview,
    t.location,
    u.name as host_name,
    u.email as host_email,
    CASE WHEN u."imageUrl" IS NOT NULL AND u."imageUrl" != '' THEN 'Yes' ELSE 'No' END as has_image,
    t."createdAt"
FROM public.trip t
LEFT JOIN public.user u ON t."hostId" = u.id
LEFT JOIN auth.users au ON u.id = au.id
WHERE t."joineeId" IS NULL  -- Only show available trips (like Find Partner page)
ORDER BY t."createdAt" DESC
LIMIT 20;

SELECT 'Total remaining available trips:' as summary, COUNT(*) as count 
FROM public.trip 
WHERE "joineeId" IS NULL;

COMMIT;
