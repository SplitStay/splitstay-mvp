@technical
Feature: Compatibility Scoring
  Server-side scoring algorithm that ranks profiles by compatibility
  within an event context, using user-defined preference weights.

  Scenario: Scoring RPC returns profiles ranked by compatibility
    Given user A is registered for an event
    When user A requests their match list
    Then the RPC returns host profiles if user A is a seeker, or seeker profiles if user A is a host
    And profiles are ordered by descending compatibility score

  Scenario: "Must match" dimensions act as hard filters
    Given user A has language set to "must_match"
    And user B shares no languages with user A
    When user A's match list is computed
    Then user B is excluded from the results

  Scenario: "Prefer" dimensions contribute to compatibility score
    Given user A has travel traits set to "prefer"
    And user B shares 3 of 5 travel traits with user A
    And user C shares 1 of 5 travel traits with user A
    When user A's match list is computed
    Then user B ranks higher than user C

  Scenario: "Don't care" dimensions are excluded from scoring
    Given user A has all dimensions set to "don't care"
    When user A's match list is computed
    Then all profiles of the other role appear with equal scores

  Scenario: Scoring is asymmetric
    Given user A has language set to "must_match" and user B has language set to "don't care"
    And user A and user B share no languages
    When match lists are computed
    Then user B does not appear in user A's results
    But user A does appear in user B's results

  Scenario: Language score is binary
    Given user A and user B share at least one language
    When the language dimension is scored
    Then the score is 1.0

  Scenario: Language score is zero when no languages are shared
    Given user A and user B share no languages
    When the language dimension is scored
    Then the score is 0.0

  Scenario: Age score uses the user-defined range with linear decay
    Given user A has age range 25-35
    And user B is 30 years old
    And user C is 40 years old
    When the age dimension is scored for "prefer"
    Then user B scores 1.0 (within range)
    And user C scores max(0, 1 - |40 - 35| / (35 - 25)) = 0.5

  Scenario: Age score is 1.0 at range boundaries
    Given user A has age range 25-35
    And user B is exactly 25 years old
    When the age dimension is scored
    Then user B scores 1.0

  Scenario: Age score floors at 0.0 for distant ages
    Given user A has age range 25-35 (range width = 10)
    And user B is 46 years old (11 beyond the range boundary)
    When the age dimension is scored
    Then user B scores 0.0

  Scenario: Scoring excludes profiles already acted on
    Given user A has already expressed interest or disinterest in user B
    When user A's match list is computed
    Then user B does not appear in the results

  Scenario: Scoring excludes hosts whose trips are full
    Given a host's trip has as many trip_member records as it has rooms
    When a seeker's match list is computed
    Then that host is excluded from the results
