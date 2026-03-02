@user
Feature: Event Registration
  Users can browse and register for upcoming events to participate in
  host/seeker matching within that event's community.

  Scenario: Unauthenticated user browses upcoming events
    When I navigate to the events page without signing in
    Then I see a list of upcoming events with name, dates, and location
    And past events are not shown
    But I must sign in to register for an event

  Scenario: User registers for an event
    Given I am signed in
    And I am viewing an upcoming event
    When I click "Register"
    Then I am registered for the event
    And I see the event's profile discovery page

  Scenario: User views their registered events
    Given I am signed in
    And I have registered for one or more events
    When I view my registered events
    Then I see each event I am registered for with its name, dates, and location
