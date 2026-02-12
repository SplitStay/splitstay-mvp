Feature: WhatsApp Bot Integration
  Enable admin users to interact with SplitStay via WhatsApp for creating trips,
  hosted on Supabase Edge Functions with Groq LLM.

  @user
  Scenario: Admin user starts a conversation with the bot
    Given I am an admin user
    And I send a WhatsApp message to the SplitStay bot number
    When the bot receives my message
    Then I receive a greeting that briefly explains what the bot does
    And defines seeker (looking for a place to stay) and host (have a room to share)
    And asks which role applies to me

  @user
  Scenario: Non-admin user receives a friendly rejection
    Given I am not an admin user
    And I send a WhatsApp message to the SplitStay bot number
    When the bot receives my message
    Then I receive a message saying "Thanks for reaching out! We're not quite ready yet - check back in a few days."

  @user
  Scenario: Seeker provides trip details through conversation
    Given I am chatting with the bot
    And I have identified myself as a seeker
    When the bot asks me questions one at a time
    Then I can provide my destination, dates, budget, and preferences
    And the bot confirms my details before creating my trip

  @user
  Scenario: Host provides trip details through conversation
    Given I am chatting with the bot
    And I have identified myself as a host
    When the bot asks me questions one at a time
    Then I can provide my accommodation details, rooms, cost, and preferences
    And the bot confirms my details before creating my trip

  @user
  Scenario: Bot shows summary and requires explicit confirmation before creating a trip
    Given I have provided all required details to the bot
    When the bot has enough information to create a trip
    Then the bot shows a summary of the trip details
    And asks me to reply YES to confirm
    And does not create any data until I explicitly confirm

  @user
  Scenario: User declines trip creation at confirmation
    Given the bot has shown me a trip summary and asked for confirmation
    When I reply with something other than YES
    Then the bot does not create the trip
    And asks what I would like to change

  @user
  Scenario: User edits details before confirming trip creation
    Given the bot has shown me a trip summary and asked for confirmation
    When I ask to change a specific detail
    Then the bot lets me provide the updated information
    And shows a revised summary for confirmation

  @user
  Scenario: Bot creates a trip from confirmed seeker information
    Given I have confirmed my seeker details by replying YES
    When the bot creates my trip
    Then I receive a confirmation message with a summary of my trip
    And the trip appears in search results on the SplitStay web app

  @user
  Scenario: Bot creates a trip from confirmed host information
    Given I have confirmed my host details by replying YES
    When the bot creates my trip
    Then I receive a confirmation message with a summary of my trip
    And the trip appears in the SplitStay web app

  @user
  Scenario: Bot handles non-text messages gracefully
    Given I am chatting with the bot
    When I send an image, voice note, or location
    Then I receive a message asking me to type my response instead

  @user
  Scenario: User who sends too many messages is rate limited
    Given I have sent many messages in a short period
    When I exceed the message limit
    Then I receive a message telling me how many minutes until I can send again
    And my previous conversation is not lost

  @technical
  Scenario: Supabase Edge Function receives Twilio webhook
    Given the whatsapp-webhook edge function is deployed
    And Twilio is configured to POST to the edge function URL
    When Twilio sends a webhook with a WhatsApp message
    Then the function parses the webhook payload using Zod validation
    And returns a TwiML XML response with HTTP 200 and Content-Type text/xml

  @technical
  Scenario: Twilio signature is validated before processing
    Given a request arrives at the webhook endpoint
    When the function checks the X-Twilio-Signature header
    Then it validates using HMAC-SHA1 with the Twilio auth token
    And rejects invalid signatures with HTTP 403

  @technical
  Scenario: Duplicate MessageSid is rejected
    Given a valid Twilio webhook arrives
    When the function extracts the MessageSid
    Then it checks the whatsapp_seen_sid table for this MessageSid
    And rejects duplicates with a TwiML response indicating the message was already received
    And stores new MessageSid values after successful processing

  @technical
  Scenario: Admin whitelist is checked after signature validation
    Given a valid Twilio webhook arrives
    When the function extracts the From phone number
    Then it checks against the WHATSAPP_ADMIN_NUMBERS environment variable
    And non-admin numbers receive the rejection message via TwiML with HTTP 200

  @technical
  Scenario: Rate limiter uses atomic upsert per phone number per hour
    Given the whatsapp_rate_limit table exists
    When a message arrives from a phone number
    Then the function performs an atomic upsert
    And resets the window if older than 1 hour
    And increments the count within an active window
    And rejects with a throttle message including remaining wait minutes if the count exceeds the threshold

  @technical
  Scenario: Conversation history is stored in Supabase
    Given the whatsapp_conversation table exists
    When a message exchange occurs
    Then both the user message and assistant response are saved
    And messages are indexed by phone_number and created_at descending

  @technical
  Scenario: Conversation history includes messages across sessions
    Given a user sent messages yesterday and sends a new message today
    When the function fetches conversation history
    Then it includes messages from previous sessions
    And returns the most recent 50 messages ordered by created_at

  @technical
  Scenario: System prompt includes instruction to continue incomplete flows
    Given a user has an existing conversation history
    When the function builds the LLM request
    Then the system prompt instructs the LLM to check for incomplete flows
    And to resume collecting information where the previous session left off

  @technical
  Scenario: LLM context window is built from recent history
    Given a user sends a message
    When the function builds the LLM request
    Then it fetches the last 50 messages for this phone number
    And prepends the system prompt
    And appends the new user message
    And sends the array to the Groq API

  @technical
  Scenario: Groq API is called with correct configuration
    Given the function needs an LLM response
    When it calls the Groq chat completions endpoint
    Then it uses the GROQ_API_KEY secret
    And targets the llama-3.1-8b-instant model
    And sets max_tokens to 500 and temperature to 0.7

  @technical
  Scenario: Edge function handler accepts dependencies via injection
    Given the handler function signature accepts dependencies
    When the production entry point creates the handler
    Then it wires real Groq client, Supabase client, and validation implementations
    And tests can substitute test doubles without mocking global state

  @technical
  Scenario: Business logic is runtime-agnostic
    Given all bot logic lives in src/lib/bot/
    When the code is imported
    Then it contains no Deno-specific APIs
    And it uses only standard TypeScript with fetch
    And it can be tested with Vitest

  @technical
  Scenario: Database migration adds bot tables
    Given a new Supabase migration is created
    When the migration runs
    Then it creates whatsapp_conversation, whatsapp_rate_limit, and whatsapp_seen_sid tables
    And it creates an index on whatsapp_conversation (phone_number, created_at desc)

  @technical
  Scenario: Groq API failure returns graceful error via TwiML with HTTP 200
    Given the Groq API is unavailable or times out
    When the function catches the error
    Then it responds with TwiML containing a retry message
    And it does not store the failed exchange in conversation history

  @technical
  Scenario: Unhandled errors return a TwiML apology with HTTP 200
    Given an unexpected error occurs during message processing
    When the error is caught by the top-level handler
    Then it responds with TwiML containing an apology message
    And logs the error with full stack trace

  @technical
  Scenario: Database failure during rate limit check fails open
    Given the rate limit query fails
    When the function handles the error
    Then it allows the message through
    And logs the error for debugging

  @technical
  Scenario: Database failure during conversation save does not block response
    Given saving to whatsapp_conversation fails
    When the function has already received the LLM response
    Then it still returns the response to the user via TwiML
    And logs the save failure

  @technical
  Scenario: XML special characters are escaped in TwiML responses
    Given the LLM response contains characters like &, <, >, ", or '
    When the function builds the TwiML XML
    Then those characters are escaped to their XML entities

  @technical
  Scenario: All log entries use structured format
    Given any request is processed by the edge function
    When the function logs an event
    Then the log entry includes the request timestamp
    And a truncated phone identifier (last 4 digits)
    And the processing stage

  @user
  Scenario: Bot asks user to retry when it cannot access their conversation
    Given I send a message to the bot
    And the bot is unable to access my conversation history
    When the bot processes my message
    Then I receive a message explaining there's a temporary issue
    And the message tells me to send my request again

  @user
  Scenario: Bot stays on topic when asked about unrelated subjects
    Given I am chatting with the bot
    When I ask about something unrelated to accommodation or travel
    Then the bot declines and redirects me back to finding shared accommodation

  @user
  Scenario: Bot does not adopt a different identity when prompted
    Given I am chatting with the bot
    When I ask the bot to pretend to be someone else or change its role
    Then the bot continues as the SplitStay assistant
    And does not comply with the identity change request

  @user
  Scenario: Bot does not provide legal, medical, or financial advice
    Given I am chatting with the bot
    When I ask for legal, medical, financial, or emergency advice
    Then the bot declines and explains it can only help with shared accommodation

  @user
  Scenario: Bot declines off-topic requests politely
    Given I send a message to the bot
    When the bot determines my request is outside its scope
    Then the response is polite
    And explains what the bot can help with
    And provides an example of a valid request

  @technical
  Scenario: Conversation history fetch failure returns a retry message
    Given the whatsapp_conversation table is unreachable
    When the handler attempts to fetch conversation history
    Then it returns a TwiML response asking the user to try again
    And does not call the LLM
    And does not save the user's message to the database
    And does not mark the MessageSid as seen
    And logs the history fetch error

  @technical
  Scenario: System prompt includes security boundary instructions
    Given the system prompt is built for an LLM request
    When the prompt is assembled
    Then it includes role anchoring that identifies the bot as ONLY the SplitStay assistant
    And it includes topic boundaries limiting discussion to accommodation and travel
    And it includes instruction immunity telling the model to ignore role-change attempts
    And it includes safety rails declining legal, medical, financial, and emergency advice

  @technical
  Scenario: LLM responses are validated before delivery to the user
    Given the LLM has generated a response
    When the handler receives the response text
    Then it runs the response through an output validator
    And the validator checks for off-topic content patterns
    And clean responses are delivered to the user unchanged

  @technical
  Scenario: Flagged LLM responses are replaced with a safe redirect
    Given the LLM has generated a response that triggers the output validator
    When the validator flags the response
    Then a canned on-topic redirect message is delivered to the user instead
    And the canned message is saved to conversation history (not the flagged content)
    And the flagged content is saved to a separate audit table
    And the audit record includes the phone identifier, timestamp, flag reason, and flagged content
    And the audit table has service-role-only access (matching existing RLS pattern)

  @technical
  Scenario Outline: Output validator flags prohibited content categories
    Given the LLM response contains <content_type> indicators
    When the output validator evaluates the response
    Then the response is flagged with reason "<flag_reason>"

    Examples:
      | content_type             | flag_reason              |
      | system prompt disclosure | system_prompt_disclosure |
      | out-of-scope services    | out_of_scope_service     |
      | personal data harvesting | personal_data_harvesting |
      | identity change          | identity_change          |
      | professional advice      | professional_advice      |

  @technical
  Scenario: Output validator passes legitimate accommodation responses
    Given the LLM response discusses shared accommodation, destinations, dates, or budgets
    When the output validator evaluates the response
    Then the response is not flagged
    And it is delivered to the user unchanged

  @technical
  Scenario: Output validator failure does not deliver unvalidated content
    Given the output validator throws an error while checking an LLM response
    When the handler catches the validator error
    Then the LLM response is not delivered to the user
    And a generic error message is returned instead
    And the validator error is logged at WARN severity or higher
    # And the error is counted as a validator_failure metric — deferred until observability/metrics infrastructure exists

  @technical
  Scenario: Flagged content volume spike triggers an alert
    Given multiple LLM responses have been flagged for the same phone number within one hour
    When the flag count exceeds a configured threshold
    Then an alert is logged at WARN severity
    And the alert includes the affected phone identifier and flag reasons
