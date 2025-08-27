-- Supplementary cleanup for villa table
-- Run this to clean up any remaining villas created by the deleted users

-- Delete villas created by users named "Elijah Limaj" or "Elijah"
-- Since the users are already deleted, we need to check auth.users
DELETE FROM public.villa 
WHERE created_by IN (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'full_name' IN ('Elijah Limaj', 'Elijah')
);

-- Verification: Check if any villas remain for these users
SELECT COUNT(*) as remaining_villas
FROM public.villa v
JOIN auth.users u ON v.created_by = u.id
WHERE u.raw_user_meta_data->>'full_name' IN ('Elijah Limaj', 'Elijah');
