Feature: Event Landing Pages
  Reusable landing pages for marketing campaigns linked from Instagram posts.
  Each event gets a page at /events/<slug> with a CTA linking to WhatsApp.

  @user
  Scenario: Visitor sees event-specific landing page from Instagram link
    Given I click an Instagram link for an event
    When the landing page loads
    Then I see the event name, headline, and a call to action to connect with other attendees

  @user
  Scenario: Visitor clicks the call to action to start a WhatsApp conversation
    Given I am on an event landing page
    When I click the primary call to action button
    Then I am taken to a WhatsApp conversation with a pre-filled message about the event

  @user
  Scenario: Visitor arrives before WhatsApp number is configured
    Given the WhatsApp number has not been set up yet
    When I click the call to action or scan the QR code
    Then I see a friendly message that this feature is coming soon

  @user
  Scenario: Visitor reads how the connection process works
    Given I am on an event landing page
    When I scroll past the hero section
    Then I see step-by-step instructions for how to connect with other attendees

  @user
  Scenario: Visitor visits a link for an event that does not exist
    Given I navigate to an event landing page URL that is not recognized
    When the page loads
    Then I am redirected to the SplitStay homepage

  @user
  Scenario: Visitor sees event-specific SEO metadata when sharing the link
    Given an event landing page URL is shared on social media
    When the platform fetches the page metadata
    Then the preview shows the event name, a description, and SplitStay branding

  @user
  Scenario: Event landing page is navigable with keyboard and screen reader
    Given I am on an event landing page
    When I navigate using only a keyboard
    Then I can reach all call to action buttons via tab navigation
    And the page uses a logical heading hierarchy
    And sections are identified with landmark regions

  @technical
  Scenario: Event landing page config is validated by Zod schema at module load
    Given the event config registry module is imported
    When it initializes
    Then every event config is validated against EventLandingPageConfigSchema
    And an invalid config throws a descriptive error during development

  @technical
  Scenario: Dynamic route resolves event config by slug
    Given the React Router route /events/:slug is matched
    When the EventLandingPage component mounts
    Then it looks up the slug in the config registry
    And renders the matching event content

  @technical
  Scenario: Unknown slug redirects to homepage
    Given the React Router route /events/:slug is matched
    When the slug is not found in the config registry
    Then the component renders a redirect to /

  @technical
  Scenario: WhatsApp redirect builds correct wa.me URL
    Given the /go/:slug route is matched with a valid event slug
    And the VITE_WHATSAPP_NUMBER environment variable is set
    When the WhatsAppRedirectPage mounts
    Then it constructs a URL of the form https://wa.me/{number}?text={encoded_message}
    And replaces the current location with that URL

  @technical
  Scenario: WhatsApp redirect shows fallback when number is not configured
    Given the /go/:slug route is matched with a valid event slug
    And the VITE_WHATSAPP_NUMBER environment variable is not set
    When the WhatsAppRedirectPage mounts
    Then it displays a "Coming soon" message with SplitStay branding

  @technical
  Scenario: WhatsApp redirect handles unknown slug
    Given the /go/:slug route is matched
    When the slug is not found in the config registry
    Then the component renders a redirect to /

  @technical
  Scenario: Event landing page sets SEO meta tags
    Given a valid event slug is matched
    When the EventLandingPage component mounts
    Then it sets document.title to the event's SEO title
    And sets meta description and Open Graph tags from the event config

  @technical
  Scenario: Image placeholders render when event images are not provided
    Given an event config has an empty imagePath for the hero or a section
    When the component renders that section
    Then it displays a styled placeholder instead of a broken image

  @technical
  Scenario: Two PublicRoute entries are added to App.tsx
    Given the app router configuration
    When routes are defined
    Then /events/:slug renders EventLandingPage inside a PublicRoute
    And /go/:slug renders WhatsAppRedirectPage inside a PublicRoute
