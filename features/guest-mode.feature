@guest-mode
Feature: Guest Mode Experience
  As a visitor to SplitStay
  I want to browse and explore without creating an account
  So that I can evaluate the platform before committing

  # Landing Page
  Scenario: View landing page as guest
    Given I am not signed in
    When I visit the SplitStay homepage
    Then I should see the value proposition
    And I should see Trustpilot reviews
    And I should see "Get Started", "Post Your Trip", and "Create Profile" buttons

  # Trip Browsing
  @guest-browsing
  Scenario: Search trips as guest
    Given I am not signed in
    When I navigate to the find partners page
    And I search for trips in "Barcelona"
    Then I should see matching trips
    And I should see trip cards with host info, location, and dates

  @guest-browsing
  Scenario: View trip details as guest
    Given I am not signed in
    When I view a trip detail page
    Then I should see the destination and dates
    And I should see accommodation details
    And I should see "Message Host" and "Request to Join" buttons

  @guest-browsing
  Scenario: Apply filters as guest
    Given I am not signed in
    When I filter trips by accommodation type
    Then the filter should work
    And I should see filtered results

  # Dashboard Access
  Scenario: Guest views dashboard
    Given I am not signed in
    When I navigate to the dashboard
    Then I should see "Welcome to SplitStay"
    And I should see "You're browsing as a guest. Sign up to post trips and message travelers!"
    And I should see "Browse Trips" and "Post Your Trip" buttons

  # Auth-Required Actions
  @deferred-action
  Scenario: Guest tries to message a host
    Given I am not signed in
    And I am viewing a trip detail page
    When I click "Message Host"
    Then I should be redirected to the signup page

  @deferred-action
  Scenario: Guest tries to request joining a trip
    Given I am not signed in
    And I am viewing a trip detail page
    When I click "Request to Join"
    Then I should be redirected to the signup page

  @deferred-action
  Scenario: Guest posts a trip
    Given I am not signed in
    When I complete the post trip wizard
    And I click to publish the trip
    Then my trip data should be saved to local storage
    And I should be redirected to the signup page

  Scenario: Pending trip is created after signup
    Given I completed the post trip wizard as a guest
    And my trip data was saved to local storage
    When I sign up and create my profile
    Then my pending trip should be automatically created
    And I should see my trip on my dashboard

  # Messages Page Access
  Scenario: Guest accessing messages page
    Given I am not signed in
    When I try to access the messages page directly
    Then I should be redirected to the signin page
    And the redirect URL should preserve "/messages" as the destination

  # Profile Viewing
  Scenario: View user profile as guest
    Given I am not signed in
    When I view a user's profile page
    Then I should see their public information
    And I should see their name, bio, and travel traits

  # Static Pages
  Scenario: Guest can view how it works page
    Given I am not signed in
    When I navigate to the "How It Works" page
    Then I should see the platform explanation

  Scenario: Guest can view terms of service
    Given I am not signed in
    When I navigate to the terms page
    Then I should see the terms of service

  Scenario: Guest can view privacy policy
    Given I am not signed in
    When I navigate to the privacy page
    Then I should see the privacy policy
