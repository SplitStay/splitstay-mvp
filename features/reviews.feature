@reviews
@not-implemented
Feature: Ratings and Reviews
  As a SplitStay user
  I want to leave and receive reviews after trips
  So that the community can build trust and make informed decisions

  # NOTE: This feature is NOT IMPLEMENTED in the UI.
  # The database schema has a review table but there is no frontend code
  # to create, view, or manage reviews.
  #
  # Database schema exists with:
  # - review table (id, tripId, reviewerId, revieweeId, stars, comment, created_at)
  # - review_stars enum ('1', '2', '3', '4', '5')
  #
  # When this feature is implemented, the following scenarios should be verified:

  Background:
    Given I am signed in
    And I have completed a trip with another user

  # Planned scenarios for future implementation:
  # - Leave a review after trip completion
  # - Star rating 1-5
  # - Review with comment
  # - View reviews on user profile
  # - Cannot leave duplicate reviews
  # - Cannot review before trip ends
