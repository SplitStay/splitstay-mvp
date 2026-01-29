# Known Bugs

## Storage API returns 400 instead of 403 for authorization errors

**Description**: When a storage upload fails due to RLS policy violations, the API returns HTTP 400 (Bad Request) instead of HTTP 403 (Forbidden). The response body correctly contains `statusCode: "403"` and `error: "Unauthorized"`, but the HTTP status code is misleading.

**Impact**: Makes debugging authorization issues harder since 400 typically indicates a malformed request.

**Location**: Supabase Storage API

**Workaround**: Check the response body for the actual status code.
