@dashboard
Feature: User Dashboard
  As a signed-in SplitStay user
  I want to view and manage my trips from a central dashboard
  So that I can stay organized and track my travel plans

  Background:
    Given I am signed in
    And I have a complete profile

  # Dashboard Overview
  Scenario: View dashboard with future trips
    Given I have trips with start dates in the future
    When I navigate to my dashboard
    Then I should see the "Future Trips" tab selected by default
    And I should see my future trips displayed as cards
    And each trip card should show the host name, location, dates, and accommodation type

  Scenario: View dashboard with past trips
    Given I have trips with end dates in the past
    When I navigate to my dashboard
    And I click the "Past Trips" tab
    Then I should see my past trips displayed as cards

  Scenario: View empty dashboard - no future trips
    Given I have no trips with future dates
    When I navigate to my dashboard
    Then I should see "No upcoming trips yet"
    And I should see a "Post Your First Trip" button

  Scenario: View empty dashboard - no past trips
    Given I have no trips with past end dates
    When I navigate to my dashboard
    And I click the "Past Trips" tab
    Then I should see "No past trips yet"
    And I should see "Your completed trips will appear here"

  # Trip Card Information
  Scenario: Trip card displays key information
    Given I have a trip on my dashboard
    When I view the trip card
    Then I should see the host name and image
    And I should see the trip location
    And I should see the trip dates or "Dates TBD" if flexible
    And I should see the accommodation type
    And I should see the room and bed count

  Scenario: Trip card shows "Open" status when no joinee
    Given I have a trip without a matched joinee
    When I view the trip card
    Then I should see an "Open" badge

  Scenario: Trip card shows "Matched" status when joinee exists
    Given I have a trip with a matched joinee
    When I view the trip card
    Then I should see a "Matched" badge

  Scenario: Trip card shows "Flexible" badge for flexible dates
    Given I have a trip with flexible dates
    When I view the trip card
    Then I should see a "Flexible" badge

  Scenario: Trip card shows "Private" badge for private trips
    Given I have a private trip
    When I view the trip card
    Then I should see a "Private" badge

  Scenario: Owner sees their admin-hidden trip on dashboard
    Given I have a trip that was hidden by an administrator
    When I navigate to my dashboard
    Then I should still see my hidden trip in the list
    And the trip should indicate it has been hidden by admin

  @technical
  Scenario: getUserTrips includes hidden status for user's trips
    Given I have trips where some are admin-hidden
    When the system fetches my trips
    Then each trip should include an isHiddenByAdmin flag
    And hidden trips should have isHiddenByAdmin: true
    And visible trips should have isHiddenByAdmin: false

  # Trip Card Navigation
  Scenario: Navigate to trip detail from dashboard
    Given I have a trip on my dashboard
    When I click on the trip card
    Then I should be taken to the trip detail page

  # Trip Requests Section
  Scenario: View trip requests section
    Given I am on my dashboard
    Then I should see a "Trip Requests Received" section
    And the section should show "People wanting to join your trips"

  Scenario: No pending trip requests
    Given no one has requested to join my trips
    When I view the trip requests section
    Then I should see "No Trip Requests Yet"
    And I should see "When people want to join your trips, you'll see their requests here"

  # Guest Dashboard Experience
  @guest-mode
  Scenario: Guest views dashboard
    Given I am not signed in
    When I navigate to the dashboard
    Then I should see "Welcome to SplitStay"
    And I should see "You're browsing as a guest"
    And I should see "Browse Trips" and "Post Your Trip" buttons

  # Loading and Error States
  Scenario: Dashboard shows loading state
    Given I am signed in
    When I navigate to my dashboard
    And my trips are loading
    Then I should see a loading indicator

  Scenario: Dashboard shows error state
    Given I am signed in
    When I navigate to my dashboard
    And trip data fails to load
    Then I should see "Error"
    And I should see "Failed to load user data"
