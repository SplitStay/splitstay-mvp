-- Comprehensive cleanup script for test data and orphaned trips

BEGIN;

-- First, let's identify the problematic trips
SELECT 'Trips with hosts that have no profile pictures:' as info;
SELECT 
    t.id as trip_id,
    t.name as trip_name,
    t."hostId",
    u.email as host_email,
    u.name as host_name,
    u."imageUrl" as host_image,
    t."createdAt"
FROM public.trip t
LEFT JOIN public.user u ON t."hostId" = u.id
LEFT JOIN auth.users au ON u.id = au.id
WHERE u."imageUrl" IS NULL OR u."imageUrl" = ''
ORDER BY t."createdAt" DESC;

-- Find trips with no valid host (orphaned trips)
SELECT 'Orphaned trips (no valid host):' as info;
SELECT 
    t.id as trip_id,
    t.name as trip_name,
    t."hostId",
    t."createdAt"
FROM public.trip t
LEFT JOIN public.user u ON t."hostId" = u.id
WHERE t."hostId" IS NOT NULL AND u.id IS NULL;

-- Find trips with test-like names or descriptions
SELECT 'Trips with test-like content:' as info;
SELECT 
    t.id as trip_id,
    t.name as trip_name,
    t.description,
    t."hostId",
    u.email as host_email,
    t."createdAt"
FROM public.trip t
LEFT JOIN public.user u ON t."hostId" = u.id
LEFT JOIN auth.users au ON u.id = au.id
WHERE LOWER(t.name) LIKE '%test%' 
   OR LOWER(t.description) LIKE '%test%'
   OR LOWER(t.name) LIKE '%sample%'
   OR LOWER(t.description) LIKE '%sample%'
ORDER BY t."createdAt" DESC;

-- Now let's clean up the data

-- Delete trips with no valid host (orphaned trips)
DELETE FROM public.trip 
WHERE "hostId" NOT IN (SELECT id FROM public.user WHERE id IS NOT NULL);

-- Delete trips with test-like content
DELETE FROM public.trip 
WHERE LOWER(name) LIKE '%test%' 
   OR LOWER(description) LIKE '%test%'
   OR LOWER(name) LIKE '%sample%'
   OR LOWER(description) LIKE '%sample%';

-- Delete trips where the host has no profile picture and suspicious email patterns
DELETE FROM public.trip 
WHERE "hostId" IN (
    SELECT u.id 
    FROM public.user u 
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE (u."imageUrl" IS NULL OR u."imageUrl" = '')
    AND (
        au.email LIKE '%test%' 
        OR au.email LIKE '%limaj.sulejman%'
        OR au.email LIKE '%elijah%'
        OR au.email LIKE '%sample%'
        OR au.email LIKE '%demo%'
    )
);

-- Delete users with suspicious email patterns (this will cascade to their trips)
DELETE FROM auth.users 
WHERE email LIKE '%limaj.sulejman%'
   OR email LIKE '%elijah%@%'
   OR email LIKE '%test%'
   OR email LIKE '%sample%'
   OR email LIKE '%demo%';

-- Final verification
SELECT 'Remaining trips count:' as info, COUNT(*) as count FROM public.trip;
SELECT 'Remaining users count:' as info, COUNT(*) as count FROM auth.users;

-- Show sample of remaining trips
SELECT 'Sample of remaining trips:' as info;
SELECT 
    t.id,
    t.name,
    u.email as host_email,
    u."imageUrl" as has_image,
    t."createdAt"
FROM public.trip t
LEFT JOIN public.user u ON t."hostId" = u.id
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY t."createdAt" DESC
LIMIT 10;

COMMIT;
