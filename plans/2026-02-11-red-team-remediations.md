# Feature: Red Team Remediation — Bot Resilience & Safety

**Created**: 2026-02-11
**Goal**: Improve WhatsApp bot reliability and safety by failing closed on history loss and hardening against prompt injection.

## User Requirements

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Bot asks user to retry when it cannot access their conversation
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Bot asks user to retry when it cannot access their conversation
  Given I send a message to the bot
  And the bot is unable to access my conversation history
  When the bot processes my message
  Then I receive a message explaining there's a temporary issue
  And the message tells me to send my request again

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Bot stays on topic when asked about unrelated subjects
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Bot stays on topic when asked about unrelated subjects
  Given I am chatting with the bot
  When I ask about something unrelated to accommodation or travel
  Then the bot declines and redirects me back to finding shared accommodation

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Bot does not adopt a different identity when prompted
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Bot does not adopt a different identity when prompted
  Given I am chatting with the bot
  When I ask the bot to pretend to be someone else or change its role
  Then the bot continues as the SplitStay assistant
  And does not comply with the identity change request

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Bot does not provide legal, medical, or financial advice
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Bot does not provide legal, medical, or financial advice
  Given I am chatting with the bot
  When I ask for legal, medical, financial, or emergency advice
  Then the bot declines and explains it can only help with shared accommodation

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Bot declines off-topic requests politely
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Bot declines off-topic requests politely
  Given I send a message to the bot
  When the bot determines my request is outside its scope
  Then the response is polite
  And explains what the bot can help with
  And provides an example of a valid request

## Technical Specifications

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Conversation history fetch failure returns a retry message
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Conversation history fetch failure returns a retry message
  Given the whatsapp_conversation table is unreachable
  When the handler attempts to fetch conversation history
  Then it returns a TwiML response asking the user to try again
  And does not call the LLM
  And does not save the user's message to the database
  And does not mark the MessageSid as seen
  And logs the history fetch error

<!-- DONE -->
# Living: features/whatsapp-bot.feature::System prompt includes security boundary instructions
# Action: extends
# Status: DONE
# Living updated: YES
Scenario: System prompt includes security boundary instructions
  Given the system prompt is built for an LLM request
  When the prompt is assembled
  Then it includes role anchoring that identifies the bot as ONLY the SplitStay assistant
  And it includes topic boundaries limiting discussion to accommodation and travel
  And it includes instruction immunity telling the model to ignore role-change attempts
  And it includes safety rails declining legal, medical, financial, and emergency advice

<!-- DONE -->
# Living: features/whatsapp-bot.feature::LLM responses are validated before delivery to the user
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: LLM responses are validated before delivery to the user
  Given the LLM has generated a response
  When the handler receives the response text
  Then it runs the response through an output validator
  And the validator checks for off-topic content patterns
  And clean responses are delivered to the user unchanged

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Flagged LLM responses are replaced with a safe redirect
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Flagged LLM responses are replaced with a safe redirect
  Given the LLM has generated a response that triggers the output validator
  When the validator flags the response
  Then a canned on-topic redirect message is delivered to the user instead
  And the canned message is saved to conversation history (not the flagged content)
  And the flagged content is saved to a separate audit table
  And the audit record includes the phone identifier, timestamp, flag reason, and flagged content
  And the audit table has service-role-only access (matching existing RLS pattern)

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Output validator flags prohibited content categories
# Action: creates
# Status: DONE
# Living updated: YES
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

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Output validator passes legitimate accommodation responses
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Output validator passes legitimate accommodation responses
  Given the LLM response discusses shared accommodation, destinations, dates, or budgets
  When the output validator evaluates the response
  Then the response is not flagged
  And it is delivered to the user unchanged

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Output validator failure does not deliver unvalidated content
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Output validator failure does not deliver unvalidated content
  Given the output validator throws an error while checking an LLM response
  When the handler catches the validator error
  Then the LLM response is not delivered to the user
  And a generic error message is returned instead
  And the validator error is logged at WARN severity or higher
  And the error is counted as a validator_failure metric

<!-- DONE -->
# Living: features/whatsapp-bot.feature::Flagged content volume spike triggers an alert
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Flagged content volume spike triggers an alert
  Given multiple LLM responses have been flagged for the same phone number within one hour
  When the flag count exceeds a configured threshold
  Then an alert is logged at WARN severity
  And the alert includes the affected phone identifier and flag reasons

## Affected Documentation

- [x] Update TECHNICAL_OVERVIEW.md — document the fail-closed behavior for history fetch and the new output validation layer
- [x] Update WHATSAPP_BOT_BRIEFING.md — update the "seven layers of security" section to include output validation as an additional layer

## Notes

### Design Decisions
- **Fail-closed scope:** Only conversation history fetch fails closed. Dedup, rate limit, and save-to-DB remain fail-open per expert consensus (Dave Farley). Principle: fail open when errors are recoverable; fail closed when errors break a guaranteed contract.
- **Output validation approach:** Regex/keyword matching, not a second LLM call. Keeps latency minimal and avoids adding another external dependency.
- **Flagged content handling:** Flagged LLM responses are NOT saved to conversation history (prevents context poisoning on subsequent requests). They are logged separately for team review. The canned redirect message is saved to history instead.
- **System prompt hardening:** Additive changes to existing prompt — role anchoring, topic boundaries, instruction immunity, safety rails. No structural changes to the seeker/host flow.
- **Retry dedup tradeoff:** When history fetch fails, the MessageSid is not marked as seen. If the database recovers and Twilio retries the webhook, the user may receive duplicate retry messages. Accepted tradeoff for pre-MVP with <10 admins and rare DB failures.

### Red Team Assessment Context
This plan addresses Concerns 4 and 11 from the CPO/CTO Red Team assessment. Full decision log with expert rationale for all 14 concerns is at `plans/red-team-decisions.md`.
