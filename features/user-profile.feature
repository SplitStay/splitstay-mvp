@user-profile
Feature: User Profile Management
  As a SplitStay user
  I want to create and manage my profile
  So that potential travel partners can learn about me

  Background:
    Given I am signed in

  # Profile Creation (4-step wizard)
  @onboarding
  Scenario: Complete profile creation wizard - Step 1 Basic Info
    Given I am on the profile creation page
    And I am on step 1 "Basic Info"
    When I enter my full name
    And I select my date of birth (day, month, year)
    And I select my gender
    And I upload a profile picture
    And I click "Next"
    Then I should advance to step 2 "Location"

  @onboarding
  Scenario: Complete profile creation wizard - Step 2 Location
    Given I am on step 2 "Location"
    When I search for and select my birth place
    And I search for and select my current location
    And I optionally select my most influenced country
    And I optionally describe why that country influenced me
    And I click "Next"
    Then I should advance to step 3 "Languages"

  @onboarding
  Scenario: Complete profile creation wizard - Step 3 Languages
    Given I am on step 3 "Languages"
    When I select the languages I speak
    And I optionally select languages I am learning
    And I optionally enter a personalized profile link
    And I click "Next"
    Then I should advance to step 4 "Preferences"

  @onboarding
  Scenario: Complete profile creation wizard - Step 4 Preferences
    Given I am on step 4 "Preferences"
    When I select my travel traits
    And I enter my bio
    And I optionally add travel photos
    And I optionally describe my most influential travel experience
    And I click "Complete"
    Then my profile should be created
    And I should see a toast notification "Profile created successfully!"
    And I should be redirected to my dashboard

  @onboarding
  Scenario: Navigate back through profile creation steps
    Given I am on the profile creation page
    And I am on step 3 "Languages"
    When I click "Back"
    Then I should return to step 2 "Location"
    And my previously entered data should be preserved

  @onboarding
  Scenario: Pending trip is created after profile completion
    Given I completed the post trip wizard as a guest
    And my trip data was saved to local storage
    When I complete my profile
    Then my pending trip should be automatically created
    And I should see "Trip posted successfully!" toast

  # Profile Viewing
  Scenario: View my own profile
    Given I have completed my profile
    When I navigate to my profile page
    Then I should see my name in the header
    And I should see my profile picture
    And I should see my bio
    And I should see my current location
    And I should see my birth place
    And I should see my age (calculated from date of birth)
    And I should see my gender
    And I should see my languages spoken as chips
    And I should see my learning languages as chips
    And I should see my travel style/traits as chips
    And I should see an "Edit Profile" button
    And I should see a "Share Profile" button

  Scenario: View my travel experience section
    Given I have completed my profile with travel experience info
    When I view my profile
    Then I should see "Most Influenced by [country]" section
    And I should see "Most Impactful Travel Experience" section
    And I should see my travel photos

  Scenario: View another user's profile
    Given another user "Alice" has a complete profile
    When I navigate to Alice's profile page
    Then I should see Alice's public profile information
    And I should see a "Share Profile" button
    And I should NOT see an "Edit Profile" button

  Scenario: Profile not found
    When I navigate to a profile that doesn't exist
    Then I should see "Profile not found"
    And I should see "This profile doesn't exist or has been removed."
    And I should see a "Back to Dashboard" button

  # Profile Editing
  @profile-edit
  Scenario: Edit profile via wizard
    Given I have completed my profile
    And I click "Edit Profile" on my profile page
    Then I should see the 4-step edit wizard
    And my existing data should be pre-filled in each step

  @profile-edit
  Scenario: Update profile information
    Given I am on the edit profile page
    When I make changes to my profile data
    And I complete all steps
    And I click the final save button
    Then my profile should be updated
    And I should see "Profile updated successfully!"
    And I should be redirected to my profile page

  # Profile Sharing
  Scenario: Share profile via modal
    Given I am on any profile page
    When I click "Share Profile"
    Then I should see a share modal
    And the modal should contain a shareable link

  Scenario: Access profile via personalized link
    Given user "Bob" has set a personalized profile link "bob-travels"
    When I visit /profile/bob-travels
    Then I should see Bob's profile page

  # Progress Indicator
  Scenario: Profile wizard shows progress
    Given I am on the profile creation page
    Then I should see a progress indicator
    And I should see step titles: Basic Info, Location, Languages, Preferences
    And the current step should be highlighted

  # Loading State
  Scenario: Profile loading state
    When I navigate to a profile page
    And the profile is loading
    Then I should see "Loading profile..."
    And I should see a loading spinner
