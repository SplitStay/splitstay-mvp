@user
Feature: Profile Discovery Within an Event
  Registered users browse profiles of the opposite role at an event,
  ranked by compatibility score.

  Scenario: Seeker browses host profiles at an event ranked by compatibility
    Given I am registered for an event
    And I do not have a trip linked to this event
    When I view the event's profile discovery page
    Then I see host profiles ranked by compatibility score
    And each profile shows name, photo, compatibility score, shared languages, shared traits, and accommodation summary

  Scenario: Host browses seeker profiles at an event ranked by compatibility
    Given I am registered for an event
    And I have a trip linked to this event
    When I view the event's profile discovery page
    Then I see seeker profiles ranked by compatibility score
    And each profile shows name, photo, compatibility score, shared languages, and shared traits

  Scenario: Profile card expands to show full details
    Given I am browsing profiles at an event
    When I tap on a profile card
    Then I see the full profile including bio, age, languages, travel traits, and travel photos
    And if the profile is a host, I also see accommodation details

  Scenario: Switching between events on the discovery page
    Given I am registered for multiple events
    When I am on the profile discovery page
    Then I see a selector showing which event I am viewing
    And I can switch between events

  Scenario: Seekers only see hosts and hosts only see seekers
    Given I am registered for an event
    When I view the event's profile discovery page
    Then I only see profiles of hosts if I am a seeker
    Or I only see profiles of seekers if I am a host

  Scenario: "Must match" filters exclude non-qualifying profiles
    Given I have set language overlap to "Must match"
    And a host at my event shares no languages with me
    When I view the event's profile discovery page
    Then that host does not appear in my results

  Scenario: Empty event shows notification promise
    Given I am registered for an event
    And no hosts or seekers (depending on my role) have registered
    When I view the event's profile discovery page
    Then I see a message indicating no matches are available yet
    And the message explains I will be notified when someone joins

  Scenario: All "must match" filters eliminate everyone
    Given my preferences filter out every registered user at an event
    When I view the event's profile discovery page
    Then I see a message suggesting I adjust my matching preferences
    And I see a link to my preference settings

  Scenario: Host disappears from browse results when trip is full
    Given a host's trip has as many members as it has rooms
    When a seeker views the event's profile discovery page
    Then that host does not appear in the results
