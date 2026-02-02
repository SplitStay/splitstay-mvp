@trip-posting
Feature: Trip Posting
  As a SplitStay user
  I want to post a trip with accommodation details
  So that I can find partners to share the stay with

  Background:
    Given I am signed in
    And I have completed my profile

  # Trip Creation Wizard
  @trip-wizard
  Scenario: Create trip - Step 1 Destination with specific dates
    Given I am on the post trip page
    And I am on step 1
    When I enter a trip name
    And I search for a destination city using the autocomplete
    And I select "Barcelona, Spain" from the suggestions
    And I enter a start date and end date
    And I click "Next"
    Then I should advance to step 2 Accommodation

  @trip-wizard
  Scenario: Create trip - Step 1 Destination with flexible dates
    Given I am on the post trip page
    And I am on step 1
    When I enter a trip name
    And I select a destination
    And I toggle "I'm flexible / Dates not confirmed yet"
    And I select an estimated month and year
    And I click "Next"
    Then I should advance to step 2 Accommodation

  @trip-wizard
  Scenario: Create trip - Step 2 Accommodation
    Given I am on step 2 Accommodation
    When I select an accommodation type from the dropdown
    And I enter an accommodation link (URL required)
    And I set the number of rooms
    And I configure each room with number of beds and bed type
    And I optionally check ensuite bathroom for each room
    And I click "Next"
    Then I should advance to step 3 Preferences

  @trip-wizard @accommodation-types
  Scenario: User can categorize their accommodation when posting a trip
    Given I am on step 2 Accommodation
    When I click on the accommodation type dropdown
    Then I can select from accommodation categories:
      | Hostel Room |
      | Hotel Room  |
      | Apartment   |
      | House       |

  @trip-wizard
  Scenario: Booking URL shows preview
    Given I am on step 2 Accommodation
    When I enter a valid booking URL
    Then after a brief delay I should see an accommodation preview
    And the preview should show the property title and image
    And I should see a "Refresh" button to reload the preview

  @trip-wizard
  Scenario: Create trip - Step 3 Preferences
    Given I am on step 3 Preferences
    When I select who I want to match with (Male/Female/Anyone)
    And I enter a trip vibe/description
    And I select the trip privacy (Public/Private)
    And I click "Next"
    Then I should advance to step 4 Preview

  @trip-wizard
  Scenario: Create trip - Step 4 Preview and publish
    Given I am on step 4 Preview
    And I can see all my trip details
    When I click "Publish Trip"
    Then my trip should be created
    And I should see a success modal
    And I should see a toast notification "Trip posted successfully!"

  # Progress Indicator
  Scenario: Wizard shows progress indicator
    Given I am on the post trip page
    Then I should see a progress indicator with 4 dots
    And the current step dot should be highlighted

  # Room Configuration
  Scenario: Configure room details
    Given I am on step 2 Accommodation
    And I have set the number of rooms to 2
    Then I should see a configuration section for each room
    And each room section should have:
      | Number of beds input   |
      | Bed type dropdown      |
      | Ensuite bathroom checkbox |

  Scenario: Changing room count resets configuration
    Given I am on step 2 Accommodation
    And I have configured 3 rooms
    When I change the number of rooms to 2
    Then I should see only 2 room configuration sections
    And the configuration should reset to defaults

  # Guest Trip Posting
  @guest-mode
  Scenario: Guest completes wizard and is redirected to signup
    Given I am not signed in
    And I have completed all steps of the trip wizard
    When I click "Publish Trip"
    Then my trip data should be saved to local storage
    And I should be redirected to the signup page
    And the redirect state should indicate I was creating a trip

  # Trip Editing (via Edit Modal from trip detail page)
  @trip-edit
  Scenario: Open edit trip modal
    Given I have posted a trip
    When I view my trip detail page
    And I click "Manage Trip"
    Then I should see the edit trip modal

  @trip-edit
  Scenario: Edit trip basic details
    Given I am viewing the edit trip modal
    When I change the trip name
    And I change the location
    And I change the description
    And I click "Save Changes"
    Then my trip should be updated

  @trip-edit
  Scenario: Edit trip dates - switch to flexible
    Given I have a trip with specific dates
    When I open the edit modal
    And I check "Flexible dates"
    And I select an estimated month and year
    And I save changes
    Then my trip should show flexible dates

  @trip-edit
  Scenario: Edit trip dates - set specific dates
    Given I have a trip with flexible dates
    When I open the edit modal
    And I uncheck "Flexible dates"
    And I set start and end dates
    And I save changes
    Then my trip should show the specific dates

  @trip-edit
  Scenario: Edit accommodation details
    Given I am viewing the edit trip modal
    When I update the booking URL
    Then I should see the new accommodation preview
    And I can change the number of rooms
    And I can update room configurations

  @trip-edit
  Scenario: Edit match preferences
    Given I am viewing the edit trip modal
    When I change "Who would you like to match with?"
    And I save changes
    Then my trip should reflect the new preference

  @trip-edit
  Scenario: Change trip visibility
    Given I have a public trip
    When I open the edit modal
    And I uncheck "Make this trip public"
    And I save changes
    Then my trip should become private

  # Trip Deletion
  @trip-edit
  Scenario: Delete trip with confirmation
    Given I am viewing the edit trip modal
    When I scroll to the "Danger Zone" section
    And I click "Delete Trip"
    Then I should see a confirmation prompt
    And I should see "Are you sure? This cannot be undone."

  Scenario: Confirm trip deletion
    Given I am viewing the delete confirmation
    When I click "Yes, Delete Trip"
    Then my trip should be permanently deleted
    And I should be redirected to my dashboard

  Scenario: Cancel trip deletion
    Given I am viewing the delete confirmation
    When I click "Cancel"
    Then the confirmation should close
    And my trip should remain unchanged
