@admin
Feature: Admin Moderation
  As a SplitStay administrator
  I want to moderate trips
  So that the platform remains safe and appropriate for all users

  Background:
    Given I am signed in as an admin user

  # Admin Access
  Scenario: Admin can access admin panel
    When I navigate to /admin
    Then I should see "Admin - Trip Moderation" header
    And I should see a list of all trips

  Scenario: Non-admin sees 404 on admin page
    Given I am signed in as a regular user
    When I navigate to /admin
    Then I should see "404"
    And I should see "Page not found"
    And I should see a "Go Home" button

  Scenario: Unauthenticated user is redirected to login
    Given I am not signed in
    When I try to navigate to /admin
    Then I should be redirected to /login?redirect=/admin

  Scenario: Admin status is determined by admin_users table
    Given my user ID is in the admin_users table
    Then I should be recognized as an admin
    And I can access the admin panel

  # Trip List View
  Scenario: View all trips for moderation
    When I view the admin trip list
    Then I should see a table with columns:
      | Trip      |
      | Host      |
      | Location  |
      | Date      |
      | Status    |
    And each row should show the trip name
    And each row should show the host's name and image
    And each row should show the location
    And each row should show the dates or "Flexible dates"
    And each row should show a "Visible" or "Hidden" badge

  Scenario: Empty state when no trips exist
    Given there are no trips in the system
    When I view the admin panel
    Then I should see "No trips yet"
    And I should see "There are no trips in the system to moderate."

  # Trip Moderation
  @trip-moderation
  Scenario: Hide a visible trip
    Given there is a visible trip
    When I click the "Hide" button on that trip
    Then the trip should be marked as hidden
    And the badge should change to "Hidden"
    And the button should change to "Show"

  @trip-moderation
  Scenario: Show a hidden trip
    Given there is a hidden trip
    When I click the "Show" button on that trip
    Then the trip should be made visible
    And the badge should change to "Visible"
    And the button should change to "Hide"

  @trip-moderation
  Scenario: Hide action shows loading state
    When I click to hide a trip
    Then the button should show a loading spinner
    And the button should be disabled until the action completes

  @trip-moderation
  Scenario: Error handling for moderation action
    Given a moderation action fails
    Then I should see an error message
    And I should see a "Dismiss" button to close the error

  # Technical Error Handling
  @technical
  Scenario: Hide trip that is already hidden
    Given a trip is already hidden
    When an admin attempts to hide it again
    Then the system should return error "Trip is already hidden"

  @technical
  Scenario: Hide non-existent trip
    When an admin attempts to hide a trip that doesn't exist
    Then the system should return error "Trip not found"

  @technical
  Scenario: Hide trip with invalid ID format
    When an admin attempts to hide a trip with an invalid UUID
    Then the system should return error "Invalid trip ID"

  @technical
  Scenario: Unhide trip that is not hidden
    Given a trip is not hidden
    When an admin attempts to unhide it
    Then the system should return error "Trip is not hidden"

  @technical
  Scenario: Unhide trip with invalid ID format
    When an admin attempts to unhide a trip with an invalid UUID
    Then the system should return error "Invalid trip ID"
