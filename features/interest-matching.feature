@user
Feature: Interest Expression & Matching
  Users express blind interest in profiles. A match forms only when
  both parties have expressed interest in each other.

  Scenario: User expresses interest in another profile
    Given I am viewing profiles at an event
    When I express interest in a profile
    Then I see a visual confirmation that my interest was recorded
    And the profile's interest action changes state to indicate I have already acted
    And the other user is not notified of my interest

  Scenario: Mutual interest creates a match
    Given I have expressed interest in another user at an event
    And that user has also expressed interest in me
    Then we are matched
    And we are both notified of the match
    And a conversation is created between us

  Scenario: Seeker joins host's trip directly after match
    Given I am a seeker matched with a host at an event
    When I choose to join their trip
    Then I am added to the trip as a member
    And I can see the trip details

  Scenario: User undoes interest before mutual match
    Given I have expressed interest in a profile
    And the other user has not yet expressed interest in me
    When I undo my interest
    Then my interest is removed
    And no match can form from that pairing

  Scenario: User undoes interest after match but before joining trip
    Given I have matched with another user
    And I have not yet joined their trip
    When I undo my interest
    Then the match is dissolved
    And the conversation between us remains

  Scenario: Joined seeker does not see a leave trip option
    Given I have joined a host's trip through the matching flow
    When I view the trip
    Then I do not see a "Leave trip" option
