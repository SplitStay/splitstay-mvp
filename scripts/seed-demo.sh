#!/usr/bin/env bash
set -euo pipefail

# Seeds local Supabase with demo data for the host/seeker matching demo.
# Creates two users (Tommy = seeker, Ruben = host) registered for
# SXSW London, with overlapping profiles so the matching RPC produces a match.
#
# Prerequisites: local Supabase running (npm run db:start)
# Usage: bash scripts/seed-demo.sh

SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-54322}"

# Try to read anon key from .env.local if not set
if [ -z "$SUPABASE_ANON_KEY" ] && [ -f .env.local ]; then
  SUPABASE_ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY .env.local | cut -d= -f2-)
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "Error: SUPABASE_ANON_KEY not set and not found in .env.local"
  exit 1
fi

DEMO_PASSWORD="DemoPass1"

signup_user() {
  local email="$1"
  local full_name="$2"

  local response
  response=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${email}\",\"password\":\"${DEMO_PASSWORD}\",\"data\":{\"full_name\":\"${full_name}\"}}")

  local user_id
  user_id=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

  if [ -z "$user_id" ]; then
    # User may already exist — try to log in to get the ID
    response=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
      -H "apikey: ${SUPABASE_ANON_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${email}\",\"password\":\"${DEMO_PASSWORD}\"}")

    user_id=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])" 2>/dev/null)
  fi

  if [ -z "$user_id" ]; then
    echo "Error: Could not create or find user ${email}"
    echo "Response: ${response}"
    exit 1
  fi

  echo "$user_id"
}

echo "Creating auth users via Supabase signup API..."
TOMMY_ID=$(signup_user "tommy@demo.splitstay.com" "Tommy Morgan")
echo "  Tommy: ${TOMMY_ID}"
RUBEN_ID=$(signup_user "ruben@demo.splitstay.com" "Ruben Vanhees")
echo "  Ruben: ${RUBEN_ID}"

echo "Seeding public data..."
PGPASSWORD=postgres psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 <<SQL
BEGIN;

-- 1. Event: SXSW London 2026
INSERT INTO public.event (id, name, start_date, end_date, location)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'SXSW London 2026',
  '2026-06-02',
  '2026-06-14',
  'London, UK'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  location = EXCLUDED.location;

-- 2. Public user profiles with complementary traits
INSERT INTO public."user" (
  id, email, name, bio, gender,
  "yearOfBirth", "profileCreated",
  languages, "travelTraits", whatsapp,
  match_pref_language, match_pref_travel_traits,
  match_pref_age, match_pref_gender
) VALUES (
  '${TOMMY_ID}',
  'tommy@demo.splitstay.com',
  'Tommy Morgan',
  'Software engineer who loves live music and exploring new cities.',
  'man',
  1990, true,
  '["English", "Spanish"]'::jsonb,
  '["adventurous", "early riser", "social"]'::jsonb,
  '+15551234567',
  'prefer', 'prefer', 'dont_care', 'dont_care'
), (
  '${RUBEN_ID}',
  'ruben@demo.splitstay.com',
  'Ruben Vanhees',
  'Founder & traveler. Looking to share a hotel or apartment at SXSW London.',
  'man',
  1988, true,
  '["English", "Dutch", "French"]'::jsonb,
  '["adventurous", "social", "foodie"]'::jsonb,
  '+15559876543',
  'prefer', 'prefer', 'dont_care', 'dont_care'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  gender = EXCLUDED.gender,
  "yearOfBirth" = EXCLUDED."yearOfBirth",
  "profileCreated" = EXCLUDED."profileCreated",
  languages = EXCLUDED.languages,
  "travelTraits" = EXCLUDED."travelTraits",
  whatsapp = EXCLUDED.whatsapp,
  match_pref_language = EXCLUDED.match_pref_language,
  match_pref_travel_traits = EXCLUDED.match_pref_travel_traits,
  match_pref_age = EXCLUDED.match_pref_age,
  match_pref_gender = EXCLUDED.match_pref_gender;

-- 3. Event registrations
INSERT INTO public.event_registration (user_id, event_id)
VALUES
  ('${TOMMY_ID}', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('${RUBEN_ID}', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (user_id, event_id) DO NOTHING;

-- 4. Ruben's trip (host) linked to the event
INSERT INTO public.trip (
  id, name, description, location, "startDate", "endDate",
  "hostId", "accommodationTypeId", numberofrooms,
  event_id, flexible
) VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'SXSW London Apartment',
  'Sharing a 2-bedroom apartment in Shoreditch for SXSW London. Walking distance to the venue.',
  'Shoreditch, London',
  '2026-06-02',
  '2026-06-14',
  '${RUBEN_ID}',
  'apartment',
  2,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  false
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  event_id = EXCLUDED.event_id;

COMMIT;

-- Verify
SELECT 'Users:' AS label, count(*) FROM public."user"
WHERE id IN ('${TOMMY_ID}', '${RUBEN_ID}');

SELECT 'Registrations:' AS label, count(*) FROM public.event_registration
WHERE event_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT 'Trip:' AS label, count(*) FROM public.trip
WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
SQL

echo ""
echo "Demo seeded successfully."
echo "  Tommy login: tommy@demo.splitstay.com / ${DEMO_PASSWORD}"
echo "  Ruben login: ruben@demo.splitstay.com / ${DEMO_PASSWORD}"
