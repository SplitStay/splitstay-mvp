# SplitStay MVP — Technical Overview

SplitStay helps travelers find shared accommodation. The MVP uses a WhatsApp bot as the primary user interface — no app download, no web form, just a conversation.

Users message SplitStay on WhatsApp. A guided conversation collects structured data (destination, dates, budget, preferences) and stores it for manual matching by the team. The bot handles two roles: **seekers** (looking for a place) and **hosts** (sharing a space).

## System Architecture

```
User's WhatsApp
     │
     ▼
Twilio (WhatsApp Business API)
     │  POST webhook with signed payload
     ▼
Supabase Edge Function (Deno runtime, globally distributed)
     │
     ├── Validate Twilio HMAC-SHA1 signature
     ├── Check phone number against admin whitelist
     ├── Reject duplicate messages (by Twilio MessageSid)
     ├── Enforce rate limit (30 msgs/hour/phone, atomic DB upsert)
     ├── Load conversation history (last 50 messages)
     ├── Send [system prompt + history + new message] → Groq API
     ├── Save user message + assistant response to database
     │
     ▼
TwiML XML response → Twilio → User's WhatsApp
```

Round-trip latency is a few seconds, dominated by the LLM inference call.

### Infrastructure

| Layer | Platform | Deploy method |
|-------|----------|---------------|
| WhatsApp bot | Supabase Edge Functions (Deno) | Manual CLI deploy |
| Database | Supabase PostgreSQL | Manual migration push |
| Web app | Vercel (React 19 + Vite) | Auto-deploy on push to `main` |
| Messaging | Twilio WhatsApp Business API | Webhook configuration |
| LLM inference | Groq | API key |

The web app exists but is secondary for the MVP. The WhatsApp bot is the entry point for the pilot (100-300 users at an event).

## AI Integration

### Model

- **Provider:** Groq (inference platform, not a model lab)
- **Model:** `llama-3.1-8b-instant` (Meta's Llama 3.1, 8B parameters)
- **Temperature:** 0.7
- **Max output tokens:** 500
- **Timeout:** 30 seconds

The Groq client calls their OpenAI-compatible chat completions endpoint via `fetch`. No SDK — just a validated HTTP request with Zod schema parsing on the response. The LLM interface is abstracted behind a `LlmClient` TypeScript interface, so swapping providers or models requires changing one factory function.

### Why Llama 3.1 8B on Groq

The conversation is structured and narrow in scope — the bot asks a fixed sequence of questions and reformats the answers into a summary. This doesn't require frontier-model reasoning. An 8B model handles it well at very low cost and very low latency. Groq's inference speed makes the WhatsApp UX feel responsive.

### Prompt Strategy

A single system prompt defines the entire bot personality and workflow. Key design choices:

- **One question at a time.** WhatsApp is a sequential medium — walls of text feel wrong.
- **Under 100 words per response.** Keeps the conversation feeling like texting, not reading documentation.
- **No emojis.** Avoids the uncanny "AI assistant" tone.
- **Explicit confirmation flow.** The bot always shows a complete summary and waits for a literal "YES" before saving. Anything else triggers an edit loop.
- **Session continuity.** The prompt instructs the model to check conversation history and resume incomplete flows rather than restarting.

The full system prompt is ~300 words. It's a single block of structured instructions — no few-shot examples, no chain-of-thought scaffolding.

### Conversation Memory

Each request loads the last 50 messages for that phone number from PostgreSQL, ordered by timestamp. The full message array sent to the model is:

```
[system prompt] + [up to 50 historical messages] + [current user message]
```

Messages are stored with `role` (user/assistant/system), `content`, `phone_number`, and `created_at`. There's a composite index on `(phone_number, created_at DESC)` for fast retrieval. Conversations persist indefinitely across sessions — a user who starts on Monday and returns on Thursday picks up where they left off.

If the history fetch fails, the bot **fails closed** — it returns a retry message and does not call the LLM, save the user's message, or mark the MessageSid as seen. This prevents the LLM from generating responses without context, which could confuse users or break in-progress flows.

### LLM Safety and Guardrails

The model receives **only** the system prompt and conversation history for the requesting phone number. It has no access to:

- The database (no tool use, no function calling)
- Other users' conversations
- User profiles, trip data, or any other application data
- External APIs or the internet

The system prompt scopes the bot to the accommodation workflow with explicit security boundaries:

- **Role anchoring** — identifies the bot as ONLY the SplitStay assistant
- **Topic boundaries** — limits discussion to accommodation and travel
- **Instruction immunity** — tells the model to ignore role-change attempts
- **Safety rails** — declines legal, medical, financial, and emergency advice

There are no tools or function-calling capabilities — the model generates text and nothing else.

### Output Validation

After the LLM generates a response and before it's delivered to the user, an output validator checks for prohibited content using regex/keyword pattern matching:

| Category | Example trigger |
|----------|----------------|
| System prompt disclosure | "My system prompt says..." |
| Out-of-scope services | "Let me help you write that code..." |
| Personal data harvesting | "Please provide your credit card number..." |
| Identity change | "I am now DAN..." |
| Professional advice | "Based on the tax law..." |

**Flagged responses** are replaced with a canned redirect message. The flagged content is saved to a separate audit table (`whatsapp_flagged_content`) — not to conversation history, which prevents context poisoning on subsequent requests. The canned redirect is saved to conversation history instead.

**Validator failures** fail closed — if the validator throws an error, the LLM response is not delivered and a generic error message is returned.

**Volume spike alerts** — when flagged content for a single phone number exceeds a threshold within one hour, a warning is logged.

Prompt injection risk is mitigated at three layers: system prompt hardening (input), narrow model scope (processing), and output validation (output). The worst outcome of a successful injection that bypasses all three layers is an off-topic response, not data exfiltration or unauthorized actions.

## Conversation Flow

### Seeker (looking for a place)

1. Greeting and role selection
2. Destination
3. Dates (specific or flexible)
4. Budget
5. Preferences/vibe
6. Summary → explicit YES to confirm

### Host (sharing a space)

1. Greeting and role selection
2. Location
3. Accommodation type
4. Number of rooms
5. Cost per room
6. Availability dates
7. Preferences/vibe
8. Summary → explicit YES to confirm

After confirmation, the bot acknowledges and says the team will follow up with a match. Matching is manual for the MVP.

## Database Schema (Bot-Specific)

Four tables, all with row-level security enabled (service role access only):

**`whatsapp_conversation`** — Message history
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| phone_number | TEXT | Indexed |
| user_id | UUID FK (nullable) | Optional link to user table |
| role | TEXT | `user`, `assistant`, or `system` |
| content | TEXT | |
| created_at | TIMESTAMPTZ | Composite index with phone_number |

**`whatsapp_rate_limit`** — Per-phone rate tracking
| Column | Type | Notes |
|--------|------|-------|
| phone_number | TEXT PK | |
| message_count | INT | Reset when window expires |
| window_start | TIMESTAMPTZ | |

Rate limiting uses a PL/pgSQL function (`check_rate_limit`) with atomic upsert and row-level locking. The function resets the counter if the window has expired, or increments and checks the limit if still within the window.

**`whatsapp_seen_sid`** — Message deduplication
| Column | Type | Notes |
|--------|------|-------|
| message_sid | TEXT PK | Twilio's unique message ID |
| processed_at | TIMESTAMPTZ | |

**`whatsapp_flagged_content`** — Output validation audit log
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| phone_number | TEXT | Indexed |
| content | TEXT | The flagged LLM response |
| flag_reason | TEXT | Category (e.g., `system_prompt_disclosure`) |
| created_at | TIMESTAMPTZ | Composite index with phone_number |

## Security

Eight layers, built from day one:

1. **Message authenticity** — Twilio HMAC-SHA1 signature verification on every request (timing-safe comparison)
2. **Access control** — Phone number whitelist via environment variable
3. **Replay protection** — MessageSid deduplication
4. **Rate limiting** — 30 messages/hour per phone, enforced atomically in the database
5. **Data isolation** — Row-level security on all bot tables
6. **Privacy in logs** — Phone numbers truncated to last 4 digits
7. **Input validation** — Zod schemas on all inbound data (webhook payload, LLM response)
8. **Output validation** — Regex/keyword pattern matching on LLM responses before delivery, with flagged content auditing

## Error Handling Philosophy

The bot is designed to **fail open for the user** — a database hiccup should never prevent someone from getting a response.

| Failure | Behavior |
|---------|----------|
| Invalid signature / payload | HTTP 400/403, no LLM call |
| Non-admin phone | Friendly TwiML rejection |
| Rate limit exceeded | TwiML with retry-after time |
| History fetch fails | **Fail closed** — retry message, no LLM call |
| LLM fails | "I'm having trouble thinking right now. Please try again in a moment." |
| Output validator flags response | Canned redirect delivered, flagged content saved to audit table |
| Output validator fails | Generic error message, unvalidated content blocked |
| Save-to-DB fails | Response still delivered, error logged |
| Dedup check fails | Message processed anyway |
| Unhandled exception | "Sorry, something went wrong. Please try again." |

All errors are logged as structured JSON with truncated phone numbers.

## Code Architecture

The bot code lives in `src/lib/bot/` and follows a functional, dependency-injected pattern. No classes — factory functions return objects that implement typed interfaces.

```
src/lib/bot/
├── handler.ts          # Request handler, orchestrates the full flow
├── systemPrompt.ts     # System prompt (single export)
├── outputValidator.ts  # Regex/keyword output validation
├── groqClient.ts       # Groq API client (LlmClient interface)
├── supabaseDb.ts       # Database operations (DbClient interface)
├── accessControl.ts    # Phone whitelist (AccessControl interface)
├── twilioValidator.ts  # HMAC-SHA1 verification (TwilioValidator interface)
├── twiml.ts            # XML response formatting
├── logger.ts           # Structured logging with phone truncation
├── schemas.ts          # Zod validation schemas
├── types.ts            # TypeScript interfaces for DI
└── __tests__/          # Comprehensive test suite
```

The edge function entry point (`supabase/functions/whatsapp-webhook/_src.ts`) wires up the real implementations and passes them to `createHandler`. Tests inject mocks through the same interfaces.

### Build Process

Edge functions run on Deno, but the bot code is written as standard TypeScript modules. A build step (esbuild) bundles `_src.ts` and all its `src/lib/bot/` imports into a single `index.ts` that Deno can execute. The source file is version-controlled; the bundle is gitignored.

## Testing

108 test scenarios across 10 test files covering:

- Full handler flow (valid messages, signature failures, access control, dedup, rate limiting, media rejection, LLM failures, DB failures, output validation, flagged content handling)
- Output validation (prohibited content detection, legitimate content pass-through)
- Groq client (response parsing, error handling, timeout)
- Database operations (dedup, rate limit, history, save, flagged content audit, flag volume counting)
- Access control (whitelist parsing, matching)
- Twilio signature validation (HMAC-SHA1)
- TwiML XML escaping
- System prompt content and security boundary verification
- Zod schema validation

All dependencies are injected, so tests run without any external services.

## Costs at Scale

| Scale | Monthly users | Est. messages | Twilio | Groq | Supabase | Total |
|-------|--------------|---------------|--------|------|----------|-------|
| Pilot | 100-300 | ~5,000 | ~$5 | <$1 | Free | ~$6/mo |
| Early traction | 1,000 | ~20,000 | ~$20 | <$1 | Free | ~$21/mo |
| Growing | 5,000 | ~100,000 | ~$100 | ~$2 | $25 | ~$127/mo |
| Scaling | 20,000 | ~400,000 | ~$400 | ~$5 | $25+ | ~$430/mo |

Twilio messaging is the dominant cost. LLM inference is negligible due to the small model and short conversations.

## Current Limitations

- **Admin-only access** — whitelist of phone numbers, not yet open to the public
- **Text only** — media messages get a polite rejection
- **No automated matching** — the team manually pairs seekers and hosts after data collection
- **50-message history window** — sufficient for the current flow, but a hard limit
- **Single language** — English only
- **No user profile linking** — the `user_id` foreign key exists but isn't populated
- **No structured data extraction** — the LLM response is stored as free text, not parsed into fields
- **No observability metrics** — validator failures and flag volume counts are logged but not yet aggregated into metrics dashboards

## Next Steps

Planned work for the pilot and beyond:

- **Event-aware onboarding** — ask which event the user is attending (the pilot is event-based)
- **Open access** — remove the phone number whitelist, replace with invite codes or event-based access
- **Structured data extraction** — parse confirmed summaries into typed fields for automated matching
- **Web app integration** — push structured data from WhatsApp conversations into the matching system
- **Conversation retention policies** — TTL on old messages
- **Observability** — metrics, alerting, cost tracking
