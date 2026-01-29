-- Migration: Admin Moderation Feature
-- Creates tables and policies for admin trip moderation

-- =============================================================================
-- ADMIN USERS TABLE
-- =============================================================================
-- Stores which users have admin privileges
-- Admin status is checked via auth.uid() against this table
CREATE TABLE IF NOT EXISTS admin_users (
  "userId" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for admin_users: users can only read their own admin status
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Users can check if they are an admin (but not see other admins)
CREATE POLICY "Users can read their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING ("userId" = auth.uid());

-- No INSERT/UPDATE/DELETE policies for regular users
-- Admin rows are managed via service role (dashboard/CLI)

-- =============================================================================
-- HIDDEN TRIPS TABLE
-- =============================================================================
-- Links trips to their hidden status via a relationship table
-- ON DELETE CASCADE ensures cleanup when a trip is deleted
CREATE TABLE IF NOT EXISTS hidden_trips (
  "tripId" UUID PRIMARY KEY REFERENCES trip(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for hidden_trips
ALTER TABLE hidden_trips ENABLE ROW LEVEL SECURITY;

-- Anyone can read hidden status (needed for filtering)
CREATE POLICY "Anyone can read hidden status"
  ON hidden_trips
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert (hide trips)
CREATE POLICY "Admins can hide trips"
  ON hidden_trips
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE "userId" = auth.uid()
    )
  );

-- Only admins can delete (unhide trips)
CREATE POLICY "Admins can unhide trips"
  ON hidden_trips
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE "userId" = auth.uid()
    )
  );

-- =============================================================================
-- SEARCHABLE TRIPS VIEW
-- =============================================================================
-- View that excludes hidden trips for find-partners listing
-- Client queries this view instead of the trip table directly
CREATE OR REPLACE VIEW searchable_trips AS
SELECT t.*
FROM trip t
WHERE t."isPublic" = true
  AND NOT EXISTS (
    SELECT 1 FROM hidden_trips ht WHERE ht."tripId" = t.id
  );

-- Grant access to the view
GRANT SELECT ON searchable_trips TO authenticated;
GRANT SELECT ON searchable_trips TO anon;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_hidden_trips_tripId ON hidden_trips("tripId");
CREATE INDEX IF NOT EXISTS idx_admin_users_userId ON admin_users("userId");

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================
COMMENT ON TABLE admin_users IS 'Users with admin privileges for moderation';
COMMENT ON TABLE hidden_trips IS 'Trips hidden by admins from public listing';
COMMENT ON VIEW searchable_trips IS 'Public trips excluding admin-hidden trips';
