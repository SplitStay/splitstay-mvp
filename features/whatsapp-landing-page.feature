Feature: WhatsApp Bot Landing Page
  A public-facing page at /whatsapp that explains the SplitStay WhatsApp bot
  for Meta Business verification and user discovery.

  @user
  Scenario: Visitor learns what the WhatsApp bot does
    Given a visitor navigates to the WhatsApp landing page
    When the page loads
    Then they understand the bot matches travelers by destination and dates to share accommodation
    And they see a step-by-step explanation of how the bot works

  @user
  Scenario: Visitor understands they opt in themselves
    Given a visitor is reading the WhatsApp landing page
    When they reach the opt-in section
    Then they see that conversations are user-initiated
    And they see that no automated marketing messages are sent
    And they see they can stop at any time

  @user
  Scenario: Visitor understands how their data is handled
    Given a visitor is reading the WhatsApp landing page
    When they reach the privacy section
    Then they see what data the bot collects
    And they see data is used only for matching
    And they see a link to the full privacy policy

  @user
  Scenario: Visitor can start a WhatsApp conversation
    Given a visitor is on the WhatsApp landing page
    When they click the call-to-action button
    Then they are directed to the WhatsApp chat link

  @user
  Scenario: Visitor can contact SplitStay for questions
    Given a visitor is on the WhatsApp landing page
    When they look for contact information
    Then they see the SplitStay contact email

  @user
  Scenario: Visitor can navigate back to the main site
    Given a visitor is on the WhatsApp landing page
    When they want to return to the homepage
    Then they see a link back to the main site

  @technical
  Scenario: WhatsApp landing page is a public route
    Given the React router configuration
    When a visitor navigates to /whatsapp
    Then the WhatsAppLandingPage component renders
    And no authentication is required

  @technical
  Scenario: WhatsApp tester page moves behind admin auth
    Given the React router configuration
    When a visitor navigates to /admin/whatsapp-tester
    Then the WhatsAppTesterPage component renders
    And authentication is required

  @technical
  Scenario: Landing page follows existing static page patterns
    Given the WhatsAppLandingPage component
    When it renders
    Then it uses framer-motion fade-in animation
    And it uses the white card on gradient background layout
    And it uses Tailwind CSS with existing brand colors
    And it is responsive across mobile and desktop viewports

  @technical
  Scenario: Page is accessible
    Given the WhatsAppLandingPage component
    When it renders
    Then all sections use semantic HTML headings
    And the CTA button has accessible link text
    And color contrast meets WCAG AA standards
