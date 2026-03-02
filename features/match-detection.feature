@technical
Feature: Match Detection & Trip Joining
  Atomic interest expression with mutual match detection and
  room-based trip capacity enforcement.

  Scenario: Interest insert and mutual check are atomic
    Given user A expresses interest in user B
    When the match_interest row is inserted
    Then the reciprocal check runs in the same transaction
    And if mutual interest exists, both users are notified

  Scenario: Trip join enforces room-based capacity
    Given a host's trip has N rooms and N-1 members
    When two seekers attempt to join simultaneously
    Then only one succeeds
    And the other receives an error indicating the trip is full

  Scenario: Trip-event link validates date overlap
    Given a trip with dates June 5-10
    And an event with dates June 4-11
    When the trip is linked to the event
    Then the link succeeds because the dates overlap

  Scenario: Trip-event link rejects non-overlapping dates
    Given a trip with dates July 1-5
    And an event with dates June 4-11
    When the trip is linked to the event
    Then the link is rejected because the dates do not overlap

  Scenario: Unlinking trip from event is blocked when trip has members
    Given a trip is linked to an event
    And the trip has one or more trip_member records
    When an attempt is made to set event_id to null
    Then the update is rejected
