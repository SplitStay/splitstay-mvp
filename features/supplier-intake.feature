@supplier-intake
Feature: Supplier Intake Flow via WhatsApp
  Enable professional STR managers to list multi-bedroom properties
  for event-scoped room-by-room booking through the existing WhatsApp bot.

  # =========================================================================
  # User Requirements
  # =========================================================================

  @user
  Scenario: Supplier arriving from outreach email is recognized for the correct event
    Given I am an admin user
    And an event "Glastonbury 2026" exists with dates June 24 to June 28
    And I send a WhatsApp message saying "Hi, I'd like to list my property for Glastonbury 2026"
    When the bot receives my message
    Then the bot confirms I am listing for Glastonbury 2026, June 24 to June 28
    And begins collecting my property details

  @user
  Scenario: Supplier with a misspelled event name is matched to the correct event
    Given I am an admin user
    And an event "Glastonbury 2026" exists
    And I send a WhatsApp message mentioning "Glastonbery 2026"
    When the bot receives my message
    Then the bot matches me to the Glastonbury 2026 event
    And begins collecting my property details

  @user
  Scenario: Supplier referencing an unrecognized event is told it was not found
    Given I am an admin user
    And no event matching "Coachella 2026" exists
    And I send a WhatsApp message saying "I'd like to list my property for Coachella 2026"
    When the bot receives my message
    Then the bot tells me it could not find that event
    And asks me to re-state the event name or contact the SplitStay team

  @user
  Scenario: Supplier referencing an ambiguous event name is asked to clarify
    Given I am an admin user
    And events "Leeds Festival 2026" and "Leeds Jazz Festival 2026" both exist
    And I send a WhatsApp message mentioning "Leeds Festival"
    When the bot receives my message
    Then the bot asks me to clarify which event I mean

  @user
  Scenario: Supplier provides property details one question at a time
    Given I am in the supplier intake flow for an event
    When the bot collects my property information
    Then it asks for supplier name, location, accommodation type, number of bedrooms, price per night, room availability, and house rules one at a time
    And does not ask the next question until I have answered the current one

  @user
  Scenario: Supplier whose rooms are all available for the full event dates skips per-room collection
    Given I am in the supplier intake flow
    And I have provided the number of bedrooms
    When the bot asks if all rooms are available for the full event dates
    And I confirm they are
    Then the bot skips per-room date collection
    And moves on to house rules

  @user
  Scenario: Supplier with rooms on different dates provides per-room availability
    Given I am in the supplier intake flow for an event running June 24 to June 28
    And I have said my rooms have different availability
    When the bot asks for each room's dates
    Then I can specify different check-in and check-out dates for each room within the event window

  @user
  Scenario: Supplier sees a complete summary before confirming
    Given I have provided all property details in the supplier intake flow
    When the bot has enough information
    Then it shows a summary including event name, event dates, supplier name, property location, accommodation type, number of bedrooms, price per night, per-room availability, and house rules
    And asks me to reply YES to confirm

  @user
  Scenario: Supplier declines confirmation and edits details
    Given the bot has shown me a listing summary and asked for confirmation
    When I reply with something other than YES
    Then the bot asks what I would like to change
    And lets me update the detail before showing a revised summary

  @user
  Scenario: Supplier corrects a previous answer during intake
    Given I am partway through the supplier intake flow
    When I tell the bot I need to change a previously provided detail
    Then the bot acknowledges the correction
    And continues collecting the remaining details from where I was

  @user
  Scenario: Supplier receives acknowledgment after confirming their listing
    Given the bot has shown me a listing summary
    When I reply YES
    Then the bot confirms my listing has been saved
    And tells me the SplitStay team will review it shortly

  @user
  Scenario: Supplier who already listed for an event is told their listing exists
    Given I have already confirmed a listing for Glastonbury 2026
    And I send a new WhatsApp message referencing Glastonbury 2026
    When the bot receives my message
    Then the bot tells me I already have a listing for this event
    And tells me the SplitStay team will reach out if I need changes

  @user
  Scenario: Supplier is told the event has passed if they confirm after event dates
    Given I have been completing the supplier intake flow
    And the event's end date has passed since I started
    When I reply YES to confirm
    Then the bot tells me the event dates have passed
    And my listing is not saved

  @user
  Scenario: Organic user without an event reference sees the standard greeting
    Given I am an admin user
    And I send a WhatsApp message that does not reference any event
    When the bot receives my message
    Then I receive the standard greeting explaining seeker and host roles

  # =========================================================================
  # Technical Specifications
  # =========================================================================

  @technical @migration
  Scenario: Database migration creates event table
    Given a new Supabase migration is created
    When the migration runs
    Then it enables the pg_trgm extension
    And creates the event table with columns: id, name, start_date, end_date, location, created_at, updated_at
    And adds CHECK constraints for end_date, name length, and location length
    And creates a GIN trigram index on event.name

  @technical @migration
  Scenario: Database migration creates supplier table
    Given the event table exists
    When the migration creates the supplier table
    Then it has columns: id, phone_number, name, created_at, updated_at
    And adds CHECK constraints for name length and phone_number length

  @technical @migration
  Scenario: Database migration creates property_listing table
    Given the supplier and event tables exist
    When the migration creates the property_listing table
    Then it has columns: id, supplier_id, event_id, location, accommodation_type_id, num_bedrooms, price_per_night, house_rules, status, created_at, updated_at
    And adds CHECK constraints and a UNIQUE constraint on supplier_id and event_id

  @technical @migration
  Scenario: Database migration creates property_room table
    Given the property_listing table exists
    When the migration creates the property_room table
    Then it has columns: id, property_listing_id, room_number, available_from, available_to, created_at, updated_at
    And adds CHECK constraint for available_to >= available_from

  @technical @migration
  Scenario: RLS policies restrict event table to admin writes and authenticated reads
    Given the event table exists with RLS enabled
    When an authenticated non-admin user queries the event table
    Then SELECT succeeds and INSERT, UPDATE, DELETE are denied

  @technical @migration
  Scenario: RLS policies restrict supplier tables to service role only
    Given the supplier, property_listing, and property_room tables exist with RLS enabled
    When any authenticated user queries these tables directly
    Then all operations are denied

  @technical @migration
  Scenario: save_property_listing function creates records atomically
    Given the save_property_listing PL/pgSQL function exists
    When called with a phone number, supplier name, event ID, property data, and rooms JSON
    Then it upserts the supplier record by phone number
    And inserts a property_listing with status confirmed
    And inserts property_room records for each room

  @technical @migration
  Scenario: save_property_listing validates room dates against event window
    Given an event with dates June 24 to June 28
    When save_property_listing is called with a room available from June 23 to June 28
    Then the function raises an error

  @technical @migration
  Scenario: save_property_listing reuses existing supplier for a different event
    Given a supplier already exists for phone number +1234567890
    When save_property_listing is called with the same phone number for a new event
    Then the existing supplier record is reused

  @technical
  Scenario: Event detection uses word_similarity before the LLM call
    Given active events exist in the database
    And a new conversation starts with a message body
    When the handler runs event detection
    Then it queries events using word_similarity against the message body
    And this check runs before the LLM is called

  @technical
  Scenario: Supplier context is injected into the system prompt when an event matches
    Given event detection matched "Glastonbury 2026"
    When the handler builds the LLM request
    Then the system prompt includes the event name, dates, and location
    And instructs the LLM to follow the supplier intake flow
    And does not ask the user for their role

  @technical
  Scenario: Event detection only runs on first message in a conversation
    Given a supplier has an existing conversation history
    When the supplier sends a follow-up message
    Then the handler recovers event context from the first user message
    And the LLM continues the intake flow from conversation history

  @technical
  Scenario: After disambiguation the handler applies the supplier prompt for the clarified event
    Given a supplier sent a message that matched multiple events
    And the supplier has conversation history from disambiguation
    When the supplier sends a follow-up message matching a single event
    Then the handler applies the supplier system prompt for that event
    And begins collecting property details

  @technical
  Scenario: Handler checks for existing listing before starting supplier intake
    Given event detection matched an event for a phone number
    When the handler queries property_listing for this supplier and event
    And an existing listing is found
    Then the handler injects this context into the system prompt

  @technical
  Scenario: Handler validates event has not expired before saving listing
    Given a supplier confirms with YES
    When the handler prepares to call save_property_listing
    Then it checks that the event end_date is at or after the current date
    And rejects the save if the event has expired

  @technical
  Scenario: LLM produces structured JSON on supplier confirmation
    Given the system prompt instructs the LLM to include a JSON block on confirmation
    And the supplier has replied YES
    When the LLM generates its response
    Then the response contains a fenced JSON block
    And the handler extracts and strips the JSON block before sending the text response

  @technical
  Scenario: Structured output is validated with a Zod schema
    Given the handler has extracted a JSON block from the LLM response
    When it parses the JSON with the SupplierListingSchema
    Then valid data is passed to save_property_listing
    And rooms.length must equal num_bedrooms
    And num_bedrooms must not exceed 20

  @technical
  Scenario: LLM system prompt includes a concrete JSON example for reliable extraction
    Given the system prompt is being built for a supplier intake flow
    When the prompt includes the JSON extraction instruction
    Then it provides a complete example JSON object with realistic values

  @technical
  Scenario: Handler retries LLM call when structured output fails validation
    Given the LLM response contains a JSON block that fails Zod validation
    When the handler catches the validation error
    Then it retries the LLM call up to 2 additional times
    And a successful retry proceeds normally

  @technical
  Scenario: Handler detects confirmation response without JSON block and retries
    Given the LLM responds with a confirmation message but no JSON block
    And the handler is in a supplier context with a matched event
    When the handler checks for structured data
    Then it detects the missing JSON block
    And retries the LLM call to obtain structured data

  @technical
  Scenario: Handler detects truncated JSON block and retries
    Given the LLM responds with a truncated JSON block missing its closing marker
    And the handler is in a supplier context with a matched event
    When the handler checks for structured data
    Then it detects the incomplete JSON block
    And retries the LLM call to obtain structured data

  @technical
  Scenario: Empty or whitespace-only messages are rejected before reaching the LLM
    Given a user sends a message containing only whitespace
    When the input validator checks the message
    Then it flags the message as empty
    And the LLM is not called

  @technical
  Scenario: Output containing system prompt markers is blocked
    Given the LLM response contains system prompt section headers
    When the output validator checks the response
    Then it flags the response as system_prompt_disclosure
    And the user receives the canned redirect message

  @technical
  Scenario: All retries exhausted flags the conversation for manual review
    Given the LLM has failed to produce valid structured output 3 times
    When the handler exhausts all retries
    Then it saves a record to whatsapp_flagged_content with flag_reason extraction_failed
    And sends the supplier a message that their listing was received
