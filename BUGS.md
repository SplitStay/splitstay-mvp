# Known Bugs

## Accommodation Type dropdown has no options in trip creation (missing seed data)

**Description**: On the Post Trip page (`/post-trip`), step 2 asks for accommodation details. The "Accommodation Type" dropdown renders with 0 options because the `accommodation_type` table in the local Supabase database is empty.

**Impact**: Users cannot create new trips - the form cannot be submitted without selecting an accommodation type.

**Location**: The `accommodation_type` table needs seed data. The code in `src/lib/accommodationService.ts:getAccommodationTypes()` correctly queries the table, but falls back to hardcoded types on error - however the empty result doesn't trigger the error path.

**Fix**: Add seed data to `supabase/seed.sql` for the `accommodation_type` table. The code has a fallback with types like "Hostel Room", "Hotel Room", "Entire Apartment", etc. that could be used as reference.

## Storage API returns 400 instead of 403 for authorization errors

**Description**: When a storage upload fails due to RLS policy violations, the API returns HTTP 400 (Bad Request) instead of HTTP 403 (Forbidden). The response body correctly contains `statusCode: "403"` and `error: "Unauthorized"`, but the HTTP status code is misleading.

**Impact**: Makes debugging authorization issues harder since 400 typically indicates a malformed request.

**Location**: Supabase Storage API

**Workaround**: Check the response body for the actual status code.
