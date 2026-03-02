@user
Feature: Matching Preferences
  Users configure how important each compatibility dimension is
  when viewing matches at events.

  Scenario: User sets matching preferences on their profile
    Given I am editing my profile preferences
    When I configure my matching preferences
    Then I can set each dimension to "Must match", "Prefer", or "Don't care":
      | Language overlap         |
      | Travel traits similarity |
      | Age proximity            |
      | Gender                   |

  Scenario: User sets gender preferences as multi-select
    Given I am editing my matching preferences
    When I configure my gender preference
    Then I can select one or more genders I am open to matching with
    And the available options include Man, Woman, Trans man, Trans woman, Non-binary, and Prefer not to say

  Scenario: User sets age range when age preference is active
    Given I am editing my matching preferences
    And I set age proximity to "Must match" or "Prefer"
    Then I see min and max age inputs
    And I can define my preferred age range between 18 and 120
    And the minimum age cannot exceed the maximum age

  Scenario: User sees validation error for invalid age range
    Given I am editing my matching preferences
    When I set the minimum age higher than the maximum age
    Then I see a validation error explaining the range is invalid

  Scenario: Matching preferences default to fully open
    Given I have not configured matching preferences
    Then all dimensions default to "Don't care"
    And I see all profiles at events without filtering
