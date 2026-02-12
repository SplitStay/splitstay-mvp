# SplitStay Team Briefing - Cheat Sheet

## Context: Where We Are

We're in the first 30 days of a 60-90 day execution plan. The immediate goal is to launch at least one event-based pilot with 100-300 users. The WhatsApp bot is the primary user entry point -- it reduces friction compared to asking users to download an app or fill out web forms.

---

## WhatsApp Bot: What It Does

Users message SplitStay on WhatsApp and have a guided conversation. The bot figures out their role and collects structured data:

- **Seekers** (looking for a place): destination, dates, budget, vibe preferences
- **Hosts** (sharing a place): location, accommodation type, rooms, cost, availability, vibe

The bot asks one question at a time, keeps responses short, and always shows a full summary before finishing. Users say "YES" to confirm or ask to change details. After confirmation, the team follows up with matches.

### Current Status

- **Feature complete** -- all 43 planned scenarios implemented and tested
- **Admin-only access** -- restricted to whitelisted phone numbers (us) for now
- **Deployed** -- live on Supabase edge functions at `api.splitstay.travel`
- **Tested** -- comprehensive test suite covering conversation flows, security, and error handling

### What's Next for the Bot

The next iteration will add event-aware onboarding: asking which event a user is attending, whether they're solo or looking to share, and their comfort level/preferences. This data gets pushed into the existing web MVP for matching.

---

## How It Works (Plain Language)

1. User sends a WhatsApp message to our number
2. Twilio (messaging provider) forwards it to our server
3. We verify the message is legitimate and the sender is authorized
4. We pull up any previous conversation so the bot remembers context
5. An AI generates a response based on the conversation so far
6. The response goes back through Twilio to the user's WhatsApp

The whole round-trip takes a few seconds.

### If Someone Wants More Detail

```
User's WhatsApp
     |
     v
  Twilio (messaging gateway)
     |
     v
  Supabase Edge Function (our server, runs globally)
     |
     |-- Validates message authenticity (cryptographic signature)
     |-- Checks phone number against whitelist
     |-- Deduplicates retried messages
     |-- Enforces rate limits (30 msgs/hour)
     |-- Loads conversation history from database
     |-- Sends context + new message to AI (Groq / Llama 3.1)
     |-- Saves conversation to database
     |
     v
  Response sent back as WhatsApp message
```

**Services involved:**
| Service | Role |
|---------|------|
| **Twilio** | WhatsApp Business API -- sends and receives messages |
| **Supabase** | Database + server code, runs on their global edge network |
| **Groq** | AI inference -- runs the Llama 3.1 language model, very fast |
| **Vercel** | Hosts the web app (separate from the bot) |
| **GitHub** | Code repository, CI/CD workflows |

---

## Conversation Example

> **User:** Hi
>
> **Bot:** Welcome to SplitStay. I help travelers find shared accommodation. Are you looking for a place to stay (seeker), or do you have a room or space to share (host)?
>
> **User:** I'm looking for a place
>
> **Bot:** Great. Where are you looking to stay?
>
> **User:** Barcelona
>
> **Bot:** When are you planning to be in Barcelona? If you have specific dates, share them. Otherwise, a rough month and year works.
>
> **User:** March 15-22
>
> **Bot:** What's your budget for the stay?
>
> **User:** Around 50 euros a night
>
> **Bot:** Any preferences for the vibe or type of place? For example: quiet workspace, social atmosphere, near the beach, pet-friendly.
>
> **User:** Social, near the beach
>
> **Bot:** Here's your summary:
> - Role: Seeker
> - Destination: Barcelona
> - Dates: March 15-22
> - Budget: ~50 EUR/night
> - Preferences: Social atmosphere, near the beach
>
> Does this look right? Reply YES to confirm, or tell me what to change.
>
> **User:** YES
>
> **Bot:** Got it. Your request is saved. The SplitStay team will follow up when we find a match.

---

## Security

### Short answer: "Is it secure?"

Yes. Eight layers of protection, built from day one:

1. **Message authenticity** -- cryptographic signature verification on every inbound message
2. **Access control** -- phone number whitelist (only approved numbers can use the bot)
3. **Replay protection** -- each message has a unique ID; duplicates are rejected
4. **Rate limiting** -- 30 messages/hour per number, enforced at the database level
5. **Data isolation** -- bot data is walled off from the web app at the database level
6. **Privacy in logs** -- phone numbers are automatically truncated (only last 4 digits)
7. **Input validation** -- all incoming data is validated against strict schemas
8. **Output validation** -- every AI response is checked against content rules before delivery; responses that leak internal instructions, attempt identity changes, harvest personal data, or offer professional advice are blocked and replaced with a safe redirect

### "Can the AI be tricked?"

The bot uses a carefully scoped system prompt that limits it to the accommodation workflow, with explicit identity anchoring, topic boundaries, and instruction immunity. It can only ask about destinations, dates, budgets, and preferences. It has no access to our database beyond conversation history and can't take any actions beyond responding to messages.

Even if a prompt injection gets past the system prompt, the output validator catches prohibited content patterns before they reach the user. Flagged responses are logged to a separate audit table for team review.

### "What about user data/privacy?"

- Conversations stored in our Supabase database (not a third party)
- Only phone number and message content are stored
- Phone numbers truncated in all logs
- AI provider (Groq) processes message content but receives no other personal data
- Row-level security isolates bot data from the rest of the app

---

## Budget & Costs

### Current Monthly Costs (Admin-Only Testing)

Effectively **$0/month**. We're within free tiers for everything.

### Pilot-Scale Estimates (100-300 Users)

Assuming each user has ~1 onboarding conversation (10-15 messages each way) plus a few follow-ups:

| Service | What We Pay For | Pilot Estimate |
|---------|----------------|----------------|
| **Twilio** | $0.005 per message sent + $0.005 per message received | **$2-6/mo** |
| **Groq (AI)** | $0.05/M input tokens, $0.08/M output tokens | **<$1/mo** |
| **Supabase** | Free tier covers this scale | **$0/mo** |
| **Vercel** | Hosts the web app; free hobby tier | **$0/mo** |
| **Twilio phone number** | Monthly rental for a US number | **$1.15/mo** |
| | | **~$3-8/mo total** |

### Growth Estimates

| Scale | Monthly Users | Est. Messages | Twilio | Groq | Supabase | Total |
|-------|--------------|---------------|--------|------|----------|-------|
| **Pilot** | 100-300 | ~5,000 | ~$5 | <$1 | Free | **~$6/mo** |
| **Early traction** | 1,000 | ~20,000 | ~$20 | <$1 | Free | **~$21/mo** |
| **Growing** | 5,000 | ~100,000 | ~$100 | ~$2 | $25 (Pro) | **~$127/mo** |
| **Scaling** | 20,000 | ~400,000 | ~$400 | ~$5 | $25+ | **~$430/mo** |

Key takeaway: **Twilio messaging is the dominant cost driver.** AI inference is negligible. Database costs don't kick in until thousands of users.

### Infrastructure We'll Need Soon

| Item | Cost | When | Why |
|------|------|------|-----|
| **GitHub Team plan** | $4/user/month | Before pilot | CI/CD workflows, branch protection, code review |
| **Supabase Pro** | $25/month | ~5,000+ users | More database capacity, no pausing |
| **Vercel Pro** | $20/user/month | If web app sees real traffic | Hobby plan is non-commercial; Pro needed for business use |
| **Domain/DNS** | Already covered | -- | `splitstay.travel` is set up |

### One-Time / Setup Costs

| Item | Cost | Notes |
|------|------|-------|
| **Twilio account** | Free to create | Pay-as-you-go, no minimums |
| **WhatsApp Business registration** | Free through Twilio | Meta doesn't charge a registration fee |
| **Groq API key** | Free to create | Pay-as-you-go |

### Cost Scaling Summary

At pilot scale (100-300 users), total infrastructure costs are **under $10/month**. Even at 5,000 monthly users, we're looking at roughly **$130/month**. The architecture is designed to be cheap to start and scale linearly with usage -- no big cost cliffs.

---

## Likely Questions & Answers

**Q: When can real users try the bot?**
The bot is feature-complete for basic onboarding. Opening it up means removing the phone number whitelist. We need to decide rollout strategy: invite-only, event-specific, geography-based, or open. For the pilot, invite-only through the event makes the most sense.

**Q: How does the WhatsApp approach tie into the pilot?**
WhatsApp is how pilot users will first interact with SplitStay. They message our number, the bot collects their info (which event, seeker vs host, dates, preferences), and that structured data feeds into the web MVP for matching. No app download, no signup form -- just a WhatsApp message.

**Q: Can users send photos or voice messages?**
Not currently. The bot only processes text. Media messages get a polite response asking to send text instead. Voice/image support could be added later.

**Q: What happens if the AI goes down?**
The bot is designed to "fail open." If the AI service is unavailable, users get a friendly message asking them to try again later. No messages are lost.

**Q: What if someone spams it?**
Rate limiting: 30 messages per hour per phone number. After that, they get a message saying how many minutes to wait.

**Q: Can the bot actually book accommodation?**
Not yet. It collects what seekers and hosts need, then hands off for matching. Automated matching is a future feature.

**Q: What if we need to change what the bot asks?**
The conversation flow is driven by a system prompt -- essentially a set of instructions to the AI. Changing what the bot asks (e.g., adding "which event are you attending?") is a code change, not a rebuild. Straightforward to iterate on.

**Q: Do we own the phone number? What if Twilio goes away?**
We rent the number from Twilio. The bot logic is ours and runs on our infrastructure (Supabase). If we ever needed to switch messaging providers, the core bot code is provider-agnostic -- only the Twilio-specific webhook handling would need to change.

**Q: Is there a risk of high unexpected bills?**
Rate limiting caps per-user costs. The whitelist controls who can use it at all. Even if every safeguard failed and someone sent 10,000 messages, the Twilio cost would be ~$100. There are no cliff-edge pricing surprises in this architecture.

---

## Glossary (If Needed)

| Term | Plain English |
|------|--------------|
| **Edge function** | Server code that runs close to users worldwide, not in one data center |
| **Webhook** | A URL that Twilio calls when a message arrives -- like a callback |
| **LLM** | Large Language Model -- the AI that generates responses |
| **Rate limiting** | Capping how many messages someone can send in a time window |
| **Row-level security** | Database-level rules that wall off data between different parts of the app |
| **Twilio** | A cloud service that handles sending/receiving WhatsApp messages |
| **Supabase** | Our database and server hosting provider (open-source Firebase alternative) |
| **Groq** | AI inference provider -- runs the language model that powers the bot's responses |
| **CI/CD** | Continuous Integration / Continuous Deployment -- automated testing and deployment pipelines |
