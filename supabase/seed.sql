-- GENERATED FILE - DO NOT EDIT MANUALLY
-- Generated from src/lib/testing/generators/accommodationType.ts
-- Run 'npm run db:seed:gen' to regenerate

INSERT INTO public.accommodation_type (id, name, "displayOrder", "createdAt", "updatedAt")
VALUES
  ('hostel-room', 'Hostel Room', 1, NOW(), NOW()),
  ('hotel-room', 'Hotel Room', 2, NOW(), NOW()),
  ('apartment', 'Apartment', 3, NOW(), NOW()),
  ('house', 'House', 4, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "displayOrder" = EXCLUDED."displayOrder",
  "updatedAt" = NOW();
