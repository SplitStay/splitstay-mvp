# Feature: Supplier Intake Flow via WhatsApp

**Created**: 2026-02-12
**Goal**: Enable professional STR managers to list multi-bedroom properties for event-scoped room-by-room booking through the existing WhatsApp bot.

## User Requirements

<!-- DONE -->
Scenario: Supplier arriving from outreach email is recognized for the correct event
  Given I am an admin user
  And an event "Glastonbury 2026" exists with dates June 24 to June 28
  And I send a WhatsApp message saying "Hi, I'd like to list my property for Glastonbury 2026"
  When the bot receives my message
  Then the bot confirms I am listing for Glastonbury 2026, June 24 to June 28
  And begins collecting my property details

<!-- DONE -->
Scenario: Supplier with a misspelled event name is matched to the correct event
  Given I am an admin user
  And an event "Glastonbury 2026" exists
  And I send a WhatsApp message mentioning "Glastonbery 2026"
  When the bot receives my message
  Then the bot matches me to the Glastonbury 2026 event
  And begins collecting my property details

<!-- DONE -->
Scenario: Supplier referencing an unrecognized event is told it was not found
  Given I am an admin user
  And no event matching "Coachella 2026" exists
  And I send a WhatsApp message saying "I'd like to list my property for Coachella 2026"
  When the bot receives my message
  Then the bot tells me it could not find that event
  And asks me to re-state the event name or contact the SplitStay team

<!-- DONE -->
Scenario: Supplier referencing an ambiguous event name is asked to clarify
  Given I am an admin user
  And events "Leeds Festival 2026" and "Leeds Jazz Festival 2026" both exist
  And I send a WhatsApp message mentioning "Leeds Festival"
  When the bot receives my message
  Then the bot asks me to clarify which event I mean

<!-- DONE -->
Scenario: Supplier provides property details one question at a time
  Given I am in the supplier intake flow for an event
  When the bot collects my property information
  Then it asks for location, accommodation type, number of bedrooms, price per night, room availability, and house rules one at a time
  And does not ask the next question until I have answered the current one

<!-- DONE -->
Scenario: Supplier whose rooms are all available for the full event dates skips per-room collection
  Given I am in the supplier intake flow
  And I have provided the number of bedrooms
  When the bot asks if all rooms are available for the full event dates
  And I confirm they are
  Then the bot skips per-room date collection
  And moves on to house rules

<!-- DONE -->
Scenario: Supplier with rooms on different dates provides per-room availability
  Given I am in the supplier intake flow for an event running June 24 to June 28
  And I have said my rooms have different availability
  When the bot asks for each room's dates
  Then I can specify different check-in and check-out dates for each room within the event window

<!-- DONE -->
Scenario: Supplier sees a complete summary before confirming
  Given I have provided all property details in the supplier intake flow
  When the bot has enough information
  Then it shows a summary including event name, event dates, property location, accommodation type, number of bedrooms, price per night, per-room availability, and house rules
  And asks me to reply YES to confirm

<!-- DONE -->
Scenario: Supplier declines confirmation and edits details
  Given the bot has shown me a listing summary and asked for confirmation
  When I reply with something other than YES
  Then the bot asks what I would like to change
  And lets me update the detail before showing a revised summary

<!-- DONE -->
Scenario: Supplier corrects a previous answer during intake
  Given I am partway through the supplier intake flow
  When I tell the bot I need to change a previously provided detail
  Then the bot acknowledges the correction
  And continues collecting the remaining details from where I was

<!-- DONE -->
Scenario: Supplier receives acknowledgment after confirming their listing
  Given the bot has shown me a listing summary
  When I reply YES
  Then the bot confirms my listing has been saved
  And tells me the SplitStay team will review it shortly

<!-- DONE -->
Scenario: Supplier who already listed for an event is told their listing exists
  Given I have already confirmed a listing for Glastonbury 2026
  And I send a new WhatsApp message referencing Glastonbury 2026
  When the bot receives my message
  Then the bot tells me I already have a listing for this event
  And tells me to contact the SplitStay team to make changes

<!-- DONE -->
Scenario: Supplier is told the event has passed if they confirm after event dates
  Given I have been completing the supplier intake flow
  And the event's end date has passed since I started
  When I reply YES to confirm
  Then the bot tells me the event dates have passed
  And my listing is not saved

<!-- DONE -->
Scenario: Organic user without an event reference sees the standard greeting
  Given I am an admin user
  And I send a WhatsApp message that does not reference any event
  When the bot receives my message
  Then I receive the standard greeting explaining seeker and host roles

## Technical Specifications

<!-- DONE -->
Scenario: Database migration creates event table
  Given a new Supabase migration is created
  When the migration runs
  Then it enables the pg_trgm extension
  And creates the event table with columns: id (uuid), name (text, unique, not null), start_date (date, not null), end_date (date, not null), location (text, not null), created_at (timestamptz), updated_at (timestamptz)
  And adds CHECK constraint: end_date >= start_date
  And adds CHECK constraint: length(name) <= 200
  And adds CHECK constraint: length(location) <= 500
  And creates a GIN trigram index on event.name

<!-- DONE -->
Scenario: Database migration creates supplier table
  Given the event table exists
  When the migration creates the supplier table
  Then it has columns: id (uuid), phone_number (text, unique, not null), name (text, not null), created_at (timestamptz), updated_at (timestamptz)
  And adds CHECK constraint: length(name) <= 200
  And adds CHECK constraint: length(phone_number) <= 50

<!-- DONE -->
Scenario: Database migration creates property_listing table
  Given the supplier and event tables exist
  When the migration creates the property_listing table
  Then it has columns: id (uuid), supplier_id (uuid FK to supplier), event_id (uuid FK to event), location (text, not null), accommodation_type_id (text FK to accommodation_type), num_bedrooms (integer, not null), price_per_night (numeric, not null), house_rules (text), status (text, not null, default 'confirmed'), created_at (timestamptz), updated_at (timestamptz)
  And adds CHECK constraint: num_bedrooms >= 1
  And adds CHECK constraint: price_per_night > 0
  And adds CHECK constraint: status IN ('confirmed', 'approved', 'rejected')
  And adds CHECK constraint: length(location) <= 500
  And adds CHECK constraint: length(house_rules) <= 2000
  And adds UNIQUE constraint on (supplier_id, event_id)
  And creates an index on (event_id, status)

<!-- DONE -->
Scenario: Database migration creates property_room table
  Given the property_listing table exists
  When the migration creates the property_room table
  Then it has columns: id (uuid), property_listing_id (uuid FK to property_listing), room_number (integer, not null), available_from (date, not null), available_to (date, not null), created_at (timestamptz), updated_at (timestamptz)
  And adds CHECK constraint: available_to >= available_from
  And adds UNIQUE constraint on (property_listing_id, room_number)

<!-- DONE -->
Scenario: RLS policies restrict event table to admin writes and authenticated reads
  Given the event table exists with RLS enabled
  When an authenticated non-admin user queries the event table
  Then SELECT succeeds
  And INSERT, UPDATE, DELETE are denied
  When an admin user queries the event table
  Then SELECT, INSERT, UPDATE, DELETE all succeed

<!-- DONE -->
Scenario: RLS policies restrict supplier tables to service role only
  Given the supplier, property_listing, and property_room tables exist with RLS enabled
  When any authenticated user queries these tables directly
  Then all operations are denied
  When the service role client queries these tables
  Then all operations succeed

<!-- DONE -->
Scenario: save_property_listing function creates records atomically
  Given the save_property_listing PL/pgSQL function exists
  When called with a phone number, supplier name, event ID, property data, and rooms JSON
  Then it upserts the supplier record by phone number
  And inserts a property_listing with status confirmed
  And inserts property_room records for each room
  And returns the property_listing ID
  And all records are created in a single transaction

<!-- DONE -->
Scenario: save_property_listing validates room dates against event window
  Given an event with dates June 24 to June 28
  When save_property_listing is called with a room available from June 23 to June 28
  Then the function raises an error
  And no records are created

<!-- DONE -->
Scenario: save_property_listing reuses existing supplier for a different event
  Given a supplier already exists for phone number +1234567890
  When save_property_listing is called with the same phone number for a new event
  Then the existing supplier record is reused
  And a new property_listing is created for the new event

<!-- DONE -->
Scenario: Event detection uses word_similarity before the LLM call
  Given active events exist in the database
  And a new conversation starts with a message body
  When the handler runs event detection
  Then it queries events using word_similarity against the message body
  And uses a similarity threshold to determine matches
  And this check runs before the LLM is called

<!-- DONE -->
Scenario: Supplier context is injected into the system prompt when an event matches
  Given event detection matched "Glastonbury 2026"
  When the handler builds the LLM request
  Then the system prompt includes the event name, dates, and location
  And instructs the LLM to follow the supplier intake flow
  And does not ask the user for their role

<!-- DONE -->
Scenario: Event detection only runs on first message in a conversation
  Given a supplier has an existing conversation history
  When the supplier sends a follow-up message
  Then the handler does not re-run event detection
  And the LLM continues the intake flow from conversation history

<!-- DONE -->
Scenario: Handler checks for existing listing before starting supplier intake
  Given event detection matched an event for a phone number
  When the handler queries property_listing for this supplier and event
  And an existing listing is found
  Then the handler injects this context into the system prompt
  And does not start a new intake flow

<!-- DONE -->
Scenario: Handler validates event has not expired before saving listing
  Given a supplier confirms with YES
  When the handler prepares to call save_property_listing
  Then it checks that the event's end_date is >= the current date
  And rejects the save if the event has expired

<!-- DONE -->
Scenario: LLM produces structured JSON on supplier confirmation
  Given the system prompt instructs the LLM to include a JSON block on confirmation
  And the supplier has replied YES
  When the LLM generates its response
  Then the response contains a fenced JSON block with supplier_name, location, accommodation_type_id, num_bedrooms, price_per_night, house_rules, and rooms array
  And the handler extracts and strips the JSON block before sending the text response to the user

<!-- DONE -->
Scenario: Structured output is validated with a Zod schema
  Given the handler has extracted a JSON block from the LLM response
  When it parses the JSON with the SupplierListingSchema
  Then valid data is passed to save_property_listing
  And rooms.length must equal num_bedrooms
  And each room's dates must fall within the event window
  And text fields are validated against max length constraints (supplier_name: 200, location: 500, house_rules: 2000)

<!-- DONE -->
Scenario: LLM system prompt includes a concrete JSON example for reliable extraction
  Given the system prompt is being built for a supplier intake flow
  When the prompt includes the JSON extraction instruction
  Then it provides a complete example JSON object with realistic values
  And does not include a schema definition (the example is sufficient for the model)

<!-- DONE -->
Scenario: Handler retries LLM call when structured output fails validation
  Given the LLM response contains a JSON block that fails Zod validation
  When the handler catches the validation error
  Then it retries the LLM call with the same conversation history
  And retries up to 2 additional times
  And a successful retry proceeds normally

<!-- DONE -->
Scenario: All retries exhausted flags the conversation for manual review
  Given the LLM has failed to produce valid structured output 3 times
  When the handler exhausts all retries
  Then it saves a record to whatsapp_flagged_content with flag_reason extraction_failed
  And sends the supplier a message that their listing was received and the team will follow up
  And the conversation history is preserved for manual data extraction

## Affected Documentation

- [x] Update CLAUDE.md — add `npm run db:gen` reminder after migration, document new supplier tables
- [x] Update DEPLOYING.md — note that `pg_trgm` extension is enabled by migration (no manual step needed)

## Notes

### Testing Approach
Tests use `@amiceli/vitest-cucumber` to couple `features/supplier-intake.feature` to `src/lib/bot/__tests__/supplierIntake.spec.ts`, following the established project pattern (see `src/lib/__tests__/admin.spec.ts`). The feature file IS the living specification — no separate step is needed to maintain feature files and tests independently. Database migration scenarios (tables, RLS, PL/pgSQL function) are verified by migration review, not vitest.

### Scope
This plan covers bot prompt updates for supplier intake and event-scoped data storage only. Admin approval tooling and demand-side matching are deferred to future plans.

### Data Model
New tables (`event`, `supplier`, `property_listing`, `property_room`) are separate from the existing `trip`/`villa`/`room` model. The two models coexist — the existing host/seeker flow is unchanged. The `accommodation_type` lookup table is shared between both models via FK.

### Supplier vs Host
A supplier is a property owner/manager/agent who provides inventory but won't occupy it. This is fundamentally different from the existing "host" role (a traveler sharing their booked accommodation). The bot distinguishes them by event reference detection, not by explicit role selection.

### Event Detection
Uses PostgreSQL `pg_trgm` extension's `word_similarity()` function for fuzzy matching of event names in WhatsApp messages. Runs before the LLM call — deterministic, not delegated to the model.

### Pricing
Uniform per-night price across all rooms in a property. Per-room pricing deferred.

### Availability
Room-level date ranges within the event window. No calendar sync, no channel manager integration. Suppliers update availability manually via WhatsApp if rooms are booked elsewhere.

### LLM Structured Output
On supplier confirmation, the LLM produces a fenced JSON block validated by a Zod schema. A concrete example (not a schema definition) is included in the system prompt for extraction reliability. Up to 2 retries on validation failure, then fallback to `extraction_failed` flag for manual review.

### Access Control
For pre-MVP validation, existing admins test the supplier flow using the current `WHATSAPP_ADMIN_NUMBERS` env var whitelist. No new access control mechanism is introduced. When real suppliers are onboarded, this will need revisiting.

### Date Storage
Event dates and room availability dates use PostgreSQL `date` type (YYYY-MM-DD, no timezone). These are calendar dates at the venue, not UTC instants. Operational timestamps (`created_at`, `updated_at`) use `timestamptz`.

### Deferred Items
- WhatsApp interactive buttons (future enhancement)
- Database-backed phone authorization with role distinction (when real suppliers are onboarded)
- Specific contact channel in error messages (when real suppliers are onboarded)
- Supplier funnel observability/metrics (when real suppliers are onboarded)
- Admin approval workflow (separate future plan)
- Demand-side matching (separate future plan)
- Per-room pricing (if needed)
- Multiple properties per supplier per event (if needed)

### Expert Review Summary
- Kleppmann: Validated data model separation, date type choices, unique constraints, trigram indexing
- Cagan: Confirmed minimum viable scope for hypothesis validation
- OWASP: Length constraints on text fields (Zod + DB CHECK), LLM output treated as untrusted
- Nielsen: Added room availability shortcut, mid-intake correction scenario
- Evans: Resolved accommodation_type modeling (FK to existing lookup table), flagged access control terminology
- Farley: Split migration scenario into per-table scenarios for debuggability
- 12-Factor: Confirmed phone whitelist is data not config (deferred to future plan)
