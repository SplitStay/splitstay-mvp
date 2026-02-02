@trip-details
Feature: Trip Details and Join Requests
  As a SplitStay user
  I want to view trip details and request to join trips
  So that I can connect with hosts and plan shared stays

  Background:
    Given a trip to "Barcelona" exists hosted by "Alice"

  # Viewing Trip Details
  Scenario: View complete trip details
    When I view the trip detail page
    Then I should see the trip name as the hero title
    And I should see the trip location
    And I should see the trip dates or "Flexible dates" if flexible
    And I should see the trip duration in days

  Scenario: View trip image from booking link
    Given the trip has a valid booking URL
    When I view the trip detail page
    Then I should see an image preview of the accommodation
    And if no image is found, I should see a placeholder with the location name

  Scenario: View accommodation summary
    When I view the trip detail page
    Then I should see quick info cards showing:
      | Accommodation type    |
      | Number of rooms       |
      | Date flexibility      |
      | Trip status (Open/Matched) |
    And I should see total beds and ensuite bathrooms count
    And I should see a link to view the booking site

  Scenario: View trip description
    When I view the trip detail page
    Then I should see the "About this trip" section
    And I should see the host's description or "No description provided"

  Scenario: View estimated cost
    Given the trip has an estimated cost
    When I view the trip detail page
    Then I should see the cost per person

  # Host Information
  Scenario: View host card
    When I view the trip detail page
    Then I should see the host's profile picture
    And I should see the host's name
    And I should see "Verified host" badge
    And I should see hardcoded host stats (response rate, time, trips hosted)

  Scenario: Navigate to host profile
    When I view the trip detail page
    And I click on the host's name or image
    Then I should be taken to the host's profile page

  # Messaging Host
  Scenario: Message host as signed in user
    Given I am signed in
    When I view the trip detail page
    And I click "Message Host"
    Then a conversation should be created with the host
    And I should be taken to the messages page

  Scenario: Message host as guest
    Given I am not signed in
    When I view the trip detail page
    And I click "Message Host"
    Then I should be redirected to the signup page
    And the redirect state should preserve the trip context

  # Requesting to Join
  @join-request
  Scenario: Request to join a trip
    Given I am signed in
    When I view the trip detail page
    And I click "Request to Join"
    Then a join request should be created in the database
    And a pre-written message should be sent to the host
    And I should be taken to the messages page

  @join-request
  Scenario: Request to join requires authentication
    Given I am not signed in
    When I view the trip detail page
    And I click "Request to Join"
    Then I should be redirected to the signup page
    And the redirect state should preserve the trip and action context

  @join-request
  Scenario: Cannot request to join own trip
    Given I am signed in as the host
    When I view my own trip
    Then I should see a "Manage Trip" button instead of "Message Host"
    And I should not see the "Request to Join" button
    And I should see "This is your trip" message

  @join-request
  Scenario: Cannot request to join matched trip
    Given the trip already has a confirmed joinee
    When I view the trip detail page
    Then I should not see the "Request to Join" button
    And I should see "Matched" in the trip status

  # Trip Sharing
  Scenario: Share trip via modal
    When I view the trip detail page
    And I click the share button
    Then I should see a share modal
    And the modal should contain a shareable link
    And the modal should contain a pre-written share message

  # Save Trip (UI only, not persisted)
  Scenario: Toggle save trip button
    When I view the trip detail page
    And I click the heart/save button
    Then the button should visually toggle to filled state
    And clicking again should toggle it back

  # Loading and Error States
  Scenario: Trip loading state
    When I navigate to a trip detail page
    And the trip is loading
    Then I should see a skeleton loading animation

  Scenario: Trip not found
    When I navigate to a trip that doesn't exist
    Then I should see "Trip not found"
    And I should see "This trip may have been removed or is no longer available"
    And I should see a "Browse Trips" button

  # Admin Hidden Trip
  Scenario: Owner views their own admin-hidden trip
    Given I am the host of a trip
    And my trip has been hidden by an administrator
    When I view my trip detail page
    Then I should see my trip details
    And I should see a banner indicating the trip is hidden
    And the banner should show "This trip has been hidden by an administrator"

  Scenario: Non-owner cannot view admin-hidden trip
    Given a trip has been hidden by an administrator
    And I am not the host of that trip
    When I try to view the trip detail page
    Then I should see "Trip not found"
    And I should see "This trip may have been removed or is no longer available"

  @technical
  Scenario: Hidden trip returns isHiddenByAdmin flag for owner
    Given I am the host of a hidden trip
    When the system fetches the trip by ID
    Then the trip should include isHiddenByAdmin: true
    And the trip details should be returned

  @technical
  Scenario: Hidden trip returns null for non-owner
    Given a trip is hidden by an administrator
    And the current user is not the host
    When the system fetches the trip by ID
    Then the system should return null

  # Safety Information
  Scenario: View safety tips
    When I view the trip detail page
    Then I should see a "Safety Tips" section
    And I should see tips about meeting in public places
    And I should see tips about verifying bookings
