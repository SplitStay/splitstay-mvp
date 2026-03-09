# Feature: Reusable Event Landing Pages

**Created**: 2026-03-09
**Goal**: Give marketing a reusable landing page template so new event campaigns (linked from Instagram posts) can be launched by adding a config object — no backend work needed.

## User Requirements

<!-- DONE -->
Scenario: Visitor sees event-specific landing page from Instagram link
  Given I click an Instagram link for an event
  When the landing page loads
  Then I see the event name, headline, and a call to action to connect with other attendees

<!-- DONE -->
Scenario: Visitor clicks the call to action to start a WhatsApp conversation
  Given I am on an event landing page
  When I click the primary call to action button
  Then I am taken to a WhatsApp conversation with a pre-filled message about the event

<!-- DONE -->
Scenario: Visitor arrives before WhatsApp number is configured
  Given the WhatsApp number has not been set up yet
  When I click the call to action or scan the QR code
  Then I see a friendly message that this feature is coming soon

<!-- DONE -->
Scenario: Visitor reads how the connection process works
  Given I am on an event landing page
  When I scroll past the hero section
  Then I see step-by-step instructions for how to connect with other attendees

<!-- DONE -->
Scenario: Visitor visits a link for an event that does not exist
  Given I navigate to an event landing page URL that is not recognized
  When the page loads
  Then I am redirected to the SplitStay homepage

<!-- DONE -->
Scenario: Visitor sees event-specific SEO metadata when sharing the link
  Given an event landing page URL is shared on social media
  When the platform fetches the page metadata
  Then the preview shows the event name, a description, and SplitStay branding

<!-- DONE -->
Scenario: Event landing page is navigable with keyboard and screen reader
  Given I am on an event landing page
  When I navigate using only a keyboard
  Then I can reach all call to action buttons via tab navigation
  And the page uses a logical heading hierarchy
  And sections are identified with landmark regions

## Technical Specifications

<!-- DONE -->
Scenario: Event landing page config is validated by Zod schema at module load
  Given the event config registry module is imported
  When it initializes
  Then every event config is validated against EventLandingPageConfigSchema
  And an invalid config throws a descriptive error during development

<!-- DONE -->
Scenario: Dynamic route resolves event config by slug
  Given the React Router route /events/:slug is matched
  When the EventLandingPage component mounts
  Then it looks up the slug in the config registry
  And renders the matching event content

<!-- DONE -->
Scenario: Unknown slug redirects to homepage
  Given the React Router route /events/:slug is matched
  When the slug is not found in the config registry
  Then the component renders a redirect to /

<!-- DONE -->
Scenario: WhatsApp redirect builds correct wa.me URL
  Given the /go/:slug route is matched with a valid event slug
  And the VITE_WHATSAPP_NUMBER environment variable is set
  When the WhatsAppRedirectPage mounts
  Then it constructs a URL of the form https://wa.me/{number}?text={encoded_message}
  And replaces the current location with that URL

<!-- DONE -->
Scenario: WhatsApp redirect shows fallback when number is not configured
  Given the /go/:slug route is matched with a valid event slug
  And the VITE_WHATSAPP_NUMBER environment variable is not set
  When the WhatsAppRedirectPage mounts
  Then it displays a "Coming soon" message with SplitStay branding

<!-- DONE -->
Scenario: WhatsApp redirect handles unknown slug
  Given the /go/:slug route is matched
  When the slug is not found in the config registry
  Then the component renders a redirect to /

<!-- DONE -->
Scenario: Event landing page sets SEO meta tags
  Given a valid event slug is matched
  When the EventLandingPage component mounts
  Then it sets document.title to the event's SEO title
  And sets meta description and Open Graph tags from the event config

<!-- DONE -->
Scenario: Image placeholders render when event images are not provided
  Given an event config has an empty imagePath for the hero or a section
  When the component renders that section
  Then it displays a styled placeholder instead of a broken image

<!-- DONE -->
Scenario: Two PublicRoute entries are added to App.tsx
  Given the app router configuration
  When routes are defined
  Then /events/:slug renders EventLandingPage inside a PublicRoute
  And /go/:slug renders WhatsAppRedirectPage inside a PublicRoute

## Affected Documentation

No existing documentation is affected by these changes.

## Notes

### Design Decisions

- **Static config over database**: Event landing page content lives in a TypeScript config file (`src/lib/eventLandingPages.ts`), validated by Zod at module load. At this scale (2 events), a deploy to change copy is acceptable. Moving to database-driven content is straightforward later if event count grows.
- **Reusable template**: Both confirmed events (All Things Go Festival, Podcast Movement 2026) follow the same section pattern — hero, social proof, how-it-works steps, optional activity list. A single `EventLandingPage` component renders any event from config.
- **Short redirect paths**: CTAs link to `/go/:slug` which redirects to the full `wa.me` URL. This keeps user-facing links clean, makes them suitable for QR codes, and allows changing the WhatsApp number without updating printed materials or IG posts.
- **WhatsApp pre-filled message for context**: Each event config includes a plain-text message (e.g., "Hi! I'm going to All Things Go"). The redirect page URI-encodes it into the `wa.me` URL. The bot infers event context from this opening message.
- **Single WhatsApp number**: One number (`VITE_WHATSAPP_NUMBER` env var) shared across all events. Per-event context comes from the pre-filled message, not separate numbers.
- **Coming soon fallback**: The `/go/:slug` redirect shows a branded "Coming soon" page when the WhatsApp number isn't configured yet, since IG campaigns may launch before the number is ready.
- **Landing page configs relate to database events**: These are marketing pages for the same events stored in the `event` table — the same domain concept, not a separate entity.
- **Image placeholders**: Hero and section image slots render styled placeholder divs until Cassie provides real images. No broken `<img>` tags on marketing pages.

### Content Structure

The Zod-validated config schema:

```typescript
const EventSectionSchema = z.object({
  title: z.string(),
  body: z.array(z.string()),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })).optional(),
  bullets: z.array(z.string()).optional(),
  imagePath: z.string().optional(),
  cta: z.object({
    text: z.string(),
    subtleNote: z.string().optional(),
  }).optional(),
})

const EventLandingPageConfigSchema = z.object({
  name: z.string(),
  slug: z.string(),
  whatsappMessage: z.string(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
  }),
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    description: z.string(),
    ctaText: z.string(),
    subtleNote: z.string(),
    imagePath: z.string(),
  }),
  sections: z.array(EventSectionSchema),
})
```

### New Files

1. `src/lib/eventLandingPages.ts` — Config registry with Zod validation
2. `src/pages/EventLandingPage.tsx` — Reusable template component
3. `src/pages/WhatsAppRedirectPage.tsx` — `/go/:slug` redirect handler

### Modified Files

- `src/App.tsx` — Two new PublicRoute entries

### Confirmed Events

**All Things Go Festival**
- Hero: "POV: You're going to All Things Go… alone."
- Sections: social proof ("Thousands of people go..."), How It Works (4 steps)
- CTA: "Find your festival friend"

**Podcast Movement 2026**
- Hero: "Start Podcast Movement already knowing someone."
- Sections: "Why People Use SplitStay", How It Works (3 steps), "What You Can Do Together" (bullet list)
- CTA: "Create your profile"
