-- GENERATED FILE - DO NOT EDIT MANUALLY
-- Generated from src/lib/testing/generators/accommodationType.ts
-- Run 'npm run db:seed:gen' to regenerate

INSERT INTO public.accommodation_type (id, name, "displayOrder", "createdAt", "updatedAt")
VALUES
  ('hostel-room', 'Hostel Room', 1, NOW(), NOW()),
  ('hotel-room', 'Hotel Room', 2, NOW(), NOW()),
  ('apartment', 'Apartment', 3, NOW(), NOW()),
  ('house', 'House', 4, NOW(), NOW()),
  ('cottage', 'Cottage', 5, NOW(), NOW()),
  ('villa', 'Villa', 6, NOW(), NOW()),
  ('bungalow', 'Bungalow', 7, NOW(), NOW()),
  ('farmhouse', 'Farmhouse', 8, NOW(), NOW()),
  ('cabin', 'Cabin', 9, NOW(), NOW()),
  ('townhouse', 'Townhouse', 10, NOW(), NOW()),
  ('chalet', 'Chalet', 11, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "displayOrder" = EXCLUDED."displayOrder",
  "updatedAt" = NOW();
