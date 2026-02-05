# Feature: WhatsApp Bot Integration

**Created**: 2026-02-03
**Goal**: Enable admin users to interact with SplitStay via WhatsApp for creating trips, hosted reliably on Supabase Edge Functions with Groq LLM.

## User Requirements

<!-- DONE -->
Scenario: Admin user starts a conversation with the bot
  Given I am an admin user
  And I send a WhatsApp message to the SplitStay bot number
  When the bot receives my message
  Then I receive a greeting that briefly explains what the bot does
  And defines seeker (looking for a place to stay) and host (have a room to share)
  And asks which role applies to me

<!-- DONE -->
Scenario: Non-admin user receives a friendly rejection
  Given I am not an admin user
  And I send a WhatsApp message to the SplitStay bot number
  When the bot receives my message
  Then I receive a message saying "Thanks for reaching out! We're not quite ready yet - check back in a few days."

<!-- DONE -->
Scenario: Seeker provides trip details through conversation
  Given I am chatting with the bot
  And I have identified myself as a seeker
  When the bot asks me questions one at a time
  Then I can provide my destination, dates, budget, and preferences
  And the bot confirms my details before saving my preferences

<!-- DONE -->
Scenario: Host provides trip details through conversation
  Given I am chatting with the bot
  And I have identified myself as a host
  When the bot asks me questions one at a time
  Then I can provide my accommodation details, rooms, cost, and preferences
  And the bot confirms my details before saving my preferences

<!-- DONE -->
Scenario: Bot shows summary and requires explicit confirmation before creating a trip
  Given I have provided all required details to the bot
  When the bot has enough information to create a trip
  Then the bot shows a summary of the trip details
  And asks me to reply YES to confirm
  And does not create any data until I explicitly confirm

<!-- DONE -->
Scenario: User declines trip creation at confirmation
  Given the bot has shown me a trip summary and asked for confirmation
  When I reply with something other than YES
  Then the bot does not create the trip
  And asks what I would like to change

<!-- DONE -->
Scenario: User edits details before confirming trip creation
  Given the bot has shown me a trip summary and asked for confirmation
  When I ask to change a specific detail
  Then the bot lets me provide the updated information
  And shows a revised summary for confirmation

<!-- DONE -->
Scenario: Bot confirms seeker preferences are saved for team review
  Given I have confirmed my seeker details by replying YES
  When the bot acknowledges my confirmation
  Then I receive a message that my preferences have been saved
  And I am told the SplitStay team will be in touch when there is a match

<!-- DONE -->
Scenario: Bot confirms host preferences are saved for team review
  Given I have confirmed my host details by replying YES
  When the bot acknowledges my confirmation
  Then I receive a message that my preferences have been saved
  And I am told the SplitStay team will be in touch when there is a match

<!-- DONE -->
Scenario: Bot handles non-text messages gracefully
  Given I am chatting with the bot
  When I send an image, voice note, or location
  Then I receive a message asking me to type my response instead

<!-- DONE -->
Scenario: User who sends too many messages is rate limited
  Given I have sent many messages in a short period
  When I exceed the message limit
  Then I receive a message telling me how many minutes until I can send again
  And my previous conversation is not lost

## Technical Specifications

<!-- DONE -->
Scenario: Supabase Edge Function receives Twilio webhook
  Given the whatsapp-webhook edge function is deployed
  And Twilio is configured to POST to the edge function URL
  When Twilio sends a webhook with a WhatsApp message
  Then the function parses the webhook payload using Zod validation
  And returns a TwiML XML response with HTTP 200 and Content-Type text/xml

<!-- DONE -->
Scenario: Twilio signature is validated before processing
  Given a request arrives at the webhook endpoint
  When the function checks the X-Twilio-Signature header
  Then it validates using HMAC-SHA1 with the Twilio auth token
  And rejects invalid signatures with HTTP 403

<!-- DONE -->
Scenario: Duplicate MessageSid is rejected
  Given a valid Twilio webhook arrives
  When the function extracts the MessageSid
  Then it checks the whatsapp_seen_sid table for this MessageSid
  And rejects duplicates with a TwiML response indicating the message was already received
  And stores new MessageSid values after successful processing
  And this prevents replay attacks and double-processing during Twilio retries

<!-- DONE -->
Scenario: Admin whitelist is checked after signature validation
  Given a valid Twilio webhook arrives
  When the function extracts the From phone number
  Then it checks against the WHATSAPP_ADMIN_NUMBERS environment variable
  And non-admin numbers receive the rejection message via TwiML with HTTP 200

<!-- DONE -->
Scenario: Rate limiter uses atomic upsert per phone number per hour
  Given the whatsapp_rate_limit table exists
  When a message arrives from a phone number
  Then the function performs an atomic INSERT ON CONFLICT DO UPDATE
  And resets the window if older than 1 hour
  And increments the count within an active window
  And the PL/pgSQL function locks the row, increments the count, and returns whether the request is allowed
  And rejects with a throttle message including remaining wait minutes if the count exceeds the threshold

<!-- DONE -->
Scenario: Conversation history is stored in Supabase
  Given the whatsapp_conversation table exists with columns id, phone_number, user_id, role, content, created_at
  When a message exchange occurs
  Then both the user message and assistant response are saved
  And messages are indexed by phone_number and created_at descending

<!-- DONE -->
Scenario: Conversation history includes messages across sessions
  Given a user sent messages yesterday and sends a new message today
  When the function fetches conversation history
  Then it includes messages from previous sessions
  And returns the most recent 50 messages ordered by created_at

<!-- DONE -->
Scenario: System prompt includes instruction to continue incomplete flows
  Given a user has an existing conversation history
  When the function builds the LLM request
  Then the system prompt instructs the LLM to check for incomplete flows in the conversation history
  And to resume collecting information where the previous session left off

<!-- DONE -->
Scenario: LLM context window is built from recent history
  Given a user sends a message
  When the function builds the LLM request
  Then it fetches the last 50 messages for this phone number
  And prepends the system prompt
  And appends the new user message
  And sends the array to the Groq API

<!-- DONE -->
Scenario: Groq API is called with correct configuration
  Given the function needs an LLM response
  When it calls the Groq chat completions endpoint
  Then it uses the GROQ_API_KEY secret
  And targets the llama-3.1-8b-instant model
  And sets max_tokens to 500 and temperature to 0.7

<!-- DONE -->
Scenario: Edge function handler accepts dependencies via injection
  Given the handler function signature accepts an object with llm, db, accessControl, and twilioValidator dependencies
  When the production entry point creates the handler
  Then it wires real Groq client, Supabase client, and validation implementations
  And tests can substitute test doubles without mocking global state

<!-- DONE -->
Scenario: Business logic is runtime-agnostic
  Given all bot logic lives in src/lib/bot/
  When the code is imported
  Then it contains no Deno-specific APIs
  And it uses only standard TypeScript with fetch
  And it can be tested with Vitest

<!-- DONE -->
Scenario: Database migration adds bot tables
  Given a new Supabase migration is created via "npx supabase migration new whatsapp_bot"
  When the migration runs
  Then it creates public.whatsapp_conversation with id (uuid PK), phone_number (text), user_id (uuid FK to public.user nullable), role (text with check constraint for user/assistant/system), content (text), created_at (timestamptz default now())
  And it creates public.whatsapp_rate_limit with phone_number (text PK), message_count (int default 1), window_start (timestamptz default now())
  And it creates public.whatsapp_seen_sid with message_sid (text PK), processed_at (timestamptz default now())
  And it creates an index on whatsapp_conversation (phone_number, created_at desc)

<!-- DONE -->
Scenario: Groq API failure returns graceful error via TwiML with HTTP 200
  Given the Groq API is unavailable or times out
  When the function catches the error
  Then it responds with HTTP 200 and TwiML containing "I'm having trouble thinking right now. Please try again in a moment."
  And it does not store the failed exchange in conversation history

<!-- DONE -->
Scenario: Unhandled errors return a TwiML apology with HTTP 200
  Given an unexpected error occurs during message processing
  When the error is caught by the top-level handler
  Then it responds with HTTP 200 and TwiML containing "Sorry, something went wrong. Please try again."
  And logs the error with full stack trace

<!-- DONE -->
Scenario: Database failure during rate limit check fails open
  Given the rate limit query fails
  When the function handles the error
  Then it allows the message through
  And logs the error for debugging

<!-- DONE -->
Scenario: Database failure during conversation save does not block response
  Given saving to whatsapp_conversation fails
  When the function has already received the LLM response
  Then it still returns the response to the user via TwiML with HTTP 200
  And logs the save failure

<!-- DONE -->
Scenario: XML special characters are escaped in TwiML responses
  Given the LLM response contains characters like &, <, >, ", or '
  When the function builds the TwiML XML
  Then those characters are escaped to their XML entities

<!-- DONE -->
Scenario: All log entries use structured format
  Given any request is processed by the edge function
  When the function logs an event
  Then the log entry includes the request timestamp
  And a truncated phone identifier (last 4 digits)
  And the processing stage (validation, access-control, rate-limit, llm, response)

## Notes

### Architecture Decisions
- **Supabase Edge Functions over Vercel Functions**: Same database, same deployment tooling, 60-second timeout, generous free tier. Avoids the 10-second hobby tier limit on Vercel.
- **Groq over self-hosted LLM**: Free tier covers expected volume (14K req/day). No cold starts. Eliminates need for always-on compute.
- **Llama 3.1 8B over Qwen 2.5 7B**: Groq doesn't offer Qwen, but Llama 3.1 8B performs comparably for conversational tasks. PoC showed Qwen 7B was sufficient, so a similar-class model should work.
- **Deno entry point, Node-compatible business logic**: Edge function is a thin Deno wrapper. All testable logic lives in `src/lib/bot/` using standard TypeScript, tested with Vitest.
- **Dependency injection over global state**: Handler accepts dependencies as parameters (Dave Farley's recommendation). Enables clean testing without mocking fetch or Supabase client internals.
- **Phone number whitelist over database roles**: Simplest access control for admin-only phase. Stored in environment variable. Can evolve to database-backed `whatsapp_user` table later.
- **Phone numbers stored as plaintext**: Phone numbers are functional data needed for communication (sending messages), not just identification. Hashing would prevent the ability to contact users.
- **Rate limiting in database over in-memory**: Edge functions are ephemeral, so in-memory counters don't persist. Database-backed rate limiting with atomic upsert survives across invocations and avoids race conditions.
- **Metrics deferred**: Prometheus metrics from PoC don't translate to serverless. Will add analytics (Amplitude or database events) in a future iteration.
- **Domain language**: Both seekers and hosts create "trips." The seeker/host distinction is a role, not a different entity. Consistent with existing SplitStay codebase.

### Migration Checklist
After the migration is applied locally (`npm run db:reset`), regenerate types and schemas:
1. `npm run db:gen` - regenerates `src/types/database.types.ts` and `src/lib/schemas/database.schemas.ts`
2. Verify the new table types are available in the typed Supabase client

### PoC Lessons Carried Forward
- System prompt should enforce short responses (<100 words), one question at a time, no emojis
- Emoji stripping regex is a useful fallback for smaller models that ignore instructions
- Conversation history save failures should not prevent the user from receiving a response
- Twilio signature validation must account for proxy/load balancer URL reconstruction
- TwiML responses must always return HTTP 200 (even on error) for Twilio to deliver the message

### Expert Review Decisions
- Phone number hashing rejected: numbers are functional data needed for communication
- TwiML HTTP 200 rule added to all error scenarios plus new unhandled error scenario
- Trip creation requires explicit YES confirmation with decline and edit flows
- Rate limit message includes remaining wait time
- Rate limit uses atomic upsert to prevent TOCTOU race condition
- "Listing" replaced with "trip" throughout for consistent domain language
- MessageSid deduplication added to prevent replay attacks
- "Bot remembers context" split into testable data-fetch and prompt-construction scenarios
- Structured logging scenario added
- Greeting includes onboarding context and term definitions
- Context window increased from 20 to 50 messages
- "Matching pool" replaced with "team will be in touch when there is a match"

### Future Considerations (Not In Scope)
- `whatsapp_seen_sid` cleanup: rows older than 24 hours can be safely deleted (Twilio retry window is ~15 minutes). Implement as a Supabase cron job or in-function check when volume warrants it.
- `whatsapp_user` entity for per-phone-number attributes
- Metrics and analytics integration
- Opening access beyond admin whitelist
- Conversation pruning/retention policy
- Multi-language support
