@user
Feature: WhatsApp Bot — Event-Aware Matching
  The WhatsApp bot extends existing intake flows with event-scoped
  matching between hosts and seekers.

  Scenario: Host path asks about event linking during trip creation
    Given I am creating a trip through the WhatsApp bot as a host
    When the bot has collected my accommodation details
    Then the bot asks if this trip is for a specific event
    And shows events whose dates overlap with my trip dates
    And I can choose to link my trip to an event or skip

  Scenario: Seeker path offers event-scoped matching
    Given I am chatting with the WhatsApp bot as a seeker
    When the bot asks about my plans
    Then the bot asks if I am attending a specific event
    And I can select an event to see compatible hosts

  Scenario: Bot presents top matches in batches of five
    Given I am a seeker registered for an event via the bot
    When the bot shows me matching hosts
    Then it presents up to 5 profiles one at a time with name, bio, shared traits, and accommodation summary
    And after 5 profiles it asks if I want to see more

  Scenario: User re-engages with bot to check new matches
    Given I have previously registered for an event via the bot
    When I message the bot asking to check my matches
    Then the bot shows which events I am registered for
    And I can pick an event to see new profiles I have not yet acted on

  Scenario: Bot notifies user when new compatible profile registers
    Given I am registered for an event
    When a new host or seeker registers for the same event
    And they pass my "must match" filters
    Then I receive a WhatsApp notification prompting me to check my matches

  Scenario: Bot walks through matching preferences if not set
    Given I am in the matching flow via the bot
    And I have not configured my matching preferences
    When the bot detects missing preferences
    Then it asks about each dimension one at a time before showing matches

@technical
Feature: WhatsApp Bot Technical — Matching Infrastructure
  Technical scenarios for the bot's matching integration.

  Scenario: Event context is detected in user intake flow
    Given active events exist in the database
    And a user mentions an event name during host or seeker intake
    When the handler processes the message
    Then it detects the event reference and offers event linking or registration

  Scenario: Scoring RPC is called for bot match presentation
    Given a seeker has registered for an event via the bot
    When the bot needs to present matches
    Then it calls the same scoring RPC as the web UI
    And formats the top results as WhatsApp messages

  Scenario: New registration triggers proactive notification check
    Given a new event_registration row is inserted
    When the trigger fires
    Then it computes compatibility against existing registrations of the other role
    And sends WhatsApp notifications to users whose hard filters the new user passes

  Scenario: Re-engagement command verifies phone identity before showing events
    Given a user messages the bot asking to check matches
    When the handler parses the intent
    Then it verifies the phone number maps to a registered user
    And presents their registered events for selection
    And unregistered phone numbers receive a registration prompt
