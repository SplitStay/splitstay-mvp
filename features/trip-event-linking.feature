@user
Feature: Trip-Event Linking
  Trips can be linked to events so that hosts appear in the event's
  matching pool. Linking requires date overlap between trip and event.

  Scenario: System suggests linking existing trip when registering for an event
    Given I have a trip whose dates overlap with an event's dates
    When I register for that event
    Then I see a dismissible suggestion to link my trip to the event
    And I can accept or dismiss the suggestion

  Scenario: System suggests linking to event when creating a trip with overlapping dates
    Given I am registered for an event
    When I create a trip whose dates overlap with that event
    Then I see a dismissible suggestion to link the trip to the event
    And accepting the suggestion sets the trip's event link

  Scenario: User creates trip from event page with pre-filled context
    Given I am viewing an event I am registered for
    When I choose to post accommodation from the event page
    Then the trip creation form is pre-filled with the event's location and date range
    And the trip is automatically linked to the event on creation

  Scenario: User manually links a trip to an event
    Given I have a trip whose dates overlap with an event I am registered for
    When I use the "Link to event" action on my trip
    Then the trip is linked to that event
    And I appear as a host to other attendees

  Scenario: User is warned when editing trip dates breaks event overlap
    Given my trip is linked to an event
    When I edit the trip's dates so they no longer overlap with the event
    Then I see a warning that the trip will be unlinked from the event
    And I can confirm the unlink or cancel the edit

  Scenario: Host cannot unlink trip from event when trip has members
    Given my trip is linked to an event
    And one or more seekers have joined my trip
    When I attempt to unlink the trip from the event
    Then the unlink is blocked
    And I see a message explaining why
