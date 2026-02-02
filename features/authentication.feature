@authentication
Feature: User Authentication
  As a potential SplitStay user
  I want to create an account and sign in
  So that I can access personalized features and connect with travel partners

  Background:
    Given I am on the SplitStay website

  # Email/Password Registration
  Scenario: Sign up with email and password
    Given I am on the signup page
    When I enter my first name and last name
    And I enter a valid email address
    And I enter a password meeting the minimum length requirement
    And I confirm my password
    And I agree to the Terms of Use and Privacy Policy
    And I click "Sign up"
    Then I should see "Check your email for the confirmation link!"

  Scenario: Sign up with email that may already be registered
    Given I am on the signup page
    When I complete the signup form with any email address
    And I click "Sign up"
    Then I should see "Check your email for the confirmation link!"
    # Note: Same message shown whether email is new or already registered (security)

  Scenario: Sign up with password that is too short
    Given I am on the signup page
    When I complete the signup form with a password shorter than 6 characters
    And I click "Sign up"
    Then I should see "Password must be at least 6 characters"

  Scenario: Signup form requires terms agreement
    Given I am on the signup page
    When I fill in all fields but do not check the terms agreement
    Then the "Sign up" button should be disabled

  Scenario: Rapid signup attempts are rate limited
    Given I am on the signup page
    When I submit the signup form multiple times in quick succession
    Then I should see a message about waiting before trying again

  # Email Confirmation
  Scenario: Confirm email from confirmation link
    Given I have signed up with email and password
    And I have received a confirmation email
    When I click the confirmation link in the email
    Then I should be redirected to the profile creation page

  # Sign In
  Scenario: Sign in with valid credentials
    Given I have a confirmed account with a completed profile
    And I am on the signin page
    When I enter my email and password
    And I click "Sign in"
    Then I should be redirected to my dashboard

  Scenario: Sign in with invalid credentials
    Given I am on the signin page
    When I enter an email and password combination that is incorrect
    And I click "Sign in"
    Then I should see "Invalid login credentials"
    And I should remain on the signin page

  # OAuth
  Scenario: Sign up with Google OAuth as new user
    Given I am on the signup page
    When I click "Continue with Google"
    And I authenticate with my Google account
    Then I should be redirected to the profile creation page

  Scenario: Sign in with Google OAuth as returning user
    Given I have previously signed up with Google
    And I have completed my profile
    And I am on the signin page
    When I click "Continue with Google"
    And I authenticate with my Google account
    Then I should be redirected to my dashboard

  # Password Reset
  Scenario: Request password reset
    Given I am on the forgot password page
    When I enter any email address
    And I click "Send Reset Instructions"
    Then I should see "Check your email for password reset instructions!"
    # Note: Same message shown whether email is registered or not (security)

  Scenario: Reset password with valid token
    Given I have requested a password reset
    And I have received the reset email
    When I click the reset link in the email
    And I enter a new valid password
    And I confirm the new password
    And I submit the reset form
    Then my password should be updated
    And I should be able to sign in with my new password
    # Note: Other active sessions are NOT automatically signed out

  Scenario: Reset password with expired token
    Given I have a password reset token that has expired
    When I click the reset link in the email
    Then I should see an error that the link has expired
    And I should be prompted to request a new reset

  # Session Management
  Scenario: User session persists across page reloads
    Given I am signed in
    When I reload the page
    Then I should still be signed in

  Scenario: Sign out
    Given I am signed in
    When I click to sign out
    Then I should be signed out
    And I should be redirected to the landing page

  # Redirect after signin
  Scenario: Redirect to intended page after signin
    Given I am not signed in
    And I try to access the messages page
    When I am redirected to the signin page
    And I sign in successfully
    Then I should be redirected to the messages page
