-- Migration: Add flexible dates and accommodation fields to trip table
-- Date: 2024-01-20
-- Description: Adds support for flexible dates, room configurations, and trip preferences

-- Add flexible date fields (flexible boolean already exists)
ALTER TABLE trip ADD COLUMN IF NOT EXISTS estimatedMonth text;
ALTER TABLE trip ADD COLUMN IF NOT EXISTS estimatedYear text;

-- Add accommodation room details
ALTER TABLE trip ADD COLUMN IF NOT EXISTS numberOfRooms integer;
ALTER TABLE trip ADD COLUMN IF NOT EXISTS rooms jsonb;

-- Add trip preferences
ALTER TABLE trip ADD COLUMN IF NOT EXISTS matchWith text CHECK (matchWith IN ('male', 'female', 'anyone'));
ALTER TABLE trip ADD COLUMN IF NOT EXISTS isPublic boolean DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN trip.flexible IS 'True when user selects "I''m flexible / Dates not confirmed yet"';
COMMENT ON COLUMN trip.estimatedMonth IS 'Month name when flexible=true (e.g., "September")';
COMMENT ON COLUMN trip.estimatedYear IS 'Year when flexible=true (e.g., "2025")';
COMMENT ON COLUMN trip.numberOfRooms IS 'Number of rooms in accommodation';
COMMENT ON COLUMN trip.rooms IS 'JSON array of room configurations with beds and ensuite info';
COMMENT ON COLUMN trip.matchWith IS 'Gender preference for trip matching';
COMMENT ON COLUMN trip.isPublic IS 'Whether trip is visible in public search';

-- Insert default accommodation types if they don't exist
INSERT INTO accommodation_type (id, name, displayOrder) VALUES 
  ('villa', 'Villa', 1),
  ('hotel', 'Hotel', 2),
  ('apartment', 'Apartment', 3),
  ('house', 'House', 4),
  ('hostel', 'Hostel', 5),
  ('resort', 'Resort', 6),
  ('bnb', 'B&B', 7),
  ('guesthouse', 'Guesthouse', 8)
ON CONFLICT (id) DO NOTHING;

-- Create index for flexible trip searches
CREATE INDEX IF NOT EXISTS idx_trip_flexible_dates ON trip(flexible, estimatedMonth, estimatedYear);
CREATE INDEX IF NOT EXISTS idx_trip_public ON trip(isPublic);
