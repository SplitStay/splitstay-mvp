@trip-search
Feature: Finding Travel Partners
  As a SplitStay user
  I want to search and filter available trips
  So that I can find suitable travel partners

  Background:
    Given there are trips posted by various hosts

  # Basic Search
  Scenario: Search trips by destination
    When I enter a destination in the city autocomplete
    And I click "Apply Filters"
    Then I should see trips matching that destination
    And the destination should appear as a filter chip

  Scenario: Search with flexible dates
    When I toggle the flexible dates switch
    And I click "Apply Filters"
    Then I should see trips marked as flexible
    And "Flexible Dates" should appear as a filter chip

  Scenario: Search with no results
    When I search for a destination with no matching trips
    Then I should see "No trips found"
    And I should see "Try adjusting your filters or check back later for new trips."
    And I should see a "Post Your Own Trip" button

  # Advanced Filters
  @filters
  Scenario: Access advanced filters
    When I click "More Filters"
    Then I should see additional filter options revealed
    And I should see filters for:
      | Region              |
      | Country             |
      | City                |
      | Accommodation Type  |
      | Group Size          |
      | Vibe                |

  @filters
  Scenario: Filter trips by region
    When I click "More Filters"
    And I select region "Europe"
    And I click "Apply Filters"
    Then I should see trips in European locations
    And "Europe" should appear as a filter chip

  @filters
  Scenario: Filter trips by country
    When I click "More Filters"
    And I select a country from the dropdown
    And I click "Apply Filters"
    Then I should see trips in that country

  @filters
  Scenario: Filter trips by accommodation type
    When I click "More Filters"
    And I select accommodation type "Apartment"
    And I click "Apply Filters"
    Then I should see trips with apartment accommodations

  @filters
  Scenario: Filter trips by group size
    When I click "More Filters"
    And I select group size "4 people"
    And I click "Apply Filters"
    Then I should see trips with approximately 4 rooms

  @filters
  Scenario: Filter trips by vibe
    When I click "More Filters"
    And I select vibe "Adventure"
    And I click "Apply Filters"
    Then I should see trips with adventure in their description or vibe field

  @filters
  Scenario: Filter by date range when not flexible
    Given flexible dates is not toggled
    When I click "More Filters"
    Then I should see start date and end date inputs
    And I can select specific dates to filter by

  # Filter Management
  Scenario: Remove individual filter
    Given I have applied a destination filter
    When I click the X on the destination filter chip
    Then the destination filter should be removed
    And the filter chip should disappear

  Scenario: Clear all filters
    Given I have applied multiple filters
    When I click "Clear all filters"
    Then all filters should be reset
    And all filter chips should disappear
    And I should see all available trips

  Scenario: Filter count badge
    Given I have applied 3 filters
    Then the "More Filters" button should show a badge with "3"

  # Search Results Display
  Scenario: View trips count
    When I view the search results
    Then I should see "X trips found" where X is the number of results

  Scenario: Results display in grid
    When I view the search results
    Then I should see trip cards displayed in a grid
    And the grid should be responsive (3 columns on desktop, fewer on mobile)

  Scenario: Trip card in search results
    When I view the search results
    Then each trip card should display:
      | Trip name/title        |
      | Destination            |
      | Dates or flexibility   |
      | Host information       |
      | Accommodation image    |

  # Trip Card Interactions
  Scenario: Click trip card to view details
    When I click on a trip card in search results
    Then I should be taken to the trip detail page

  # Loading State
  Scenario: Loading state while searching
    When filters are being applied
    Then I should see skeleton loading cards
    And I should see "Loading trips..."

  # Guest Search Experience
  @guest-mode
  Scenario: Guest user can search and filter trips
    Given I am not signed in
    When I navigate to the find partners page
    Then I should see the search interface
    And I can use all filter options
    And I can view trip cards in results

  # Hidden Trips
  Scenario: Admin-hidden trips do not appear in search results
    Given a trip has been hidden by an administrator
    When I search for trips
    Then the hidden trip should not appear in results
    And only visible trips should be shown

  @technical
  Scenario: Search queries searchable_trips view
    When the system performs a trip search
    Then it should query the searchable_trips view
    And the view automatically excludes hidden trips
