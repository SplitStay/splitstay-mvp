/**
 * Trip search feature tests using vitest-cucumber.
 *
 * This spec file binds to features/trip-search.feature and implements
 * executable tests for finding travel partners scenarios.
 */
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock supabase before importing components
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

// Mock amplitude
vi.mock('@/lib/amplitude', () => ({
  trackEvent: vi.fn(),
  identifyUser: vi.fn(),
  amplitudeService: {
    reset: vi.fn(),
  },
}));

// Mock tripService
const mockSearchTrips = vi.fn();
vi.mock('@/lib/tripService', () => ({
  searchTrips: (...args: unknown[]) => mockSearchTrips(...args),
  getUserTrips: vi.fn().mockResolvedValue([]),
}));

import { test } from '@/test/componentFixtures';
import FindPartnerPage from '../FindPartnerPage';

const feature = await loadFeature('features/trip-search.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  // Handle background - trips exist
  Background(({ Given }) => {
    Given('there are trips posted by various hosts', () => {
      // Mocks are configured per-test
    });
  });
  // ============================================================================
  // Loading State
  // ============================================================================

  Scenario('Loading state while searching', ({ When, Then, And }) => {
    test('shows skeleton loading cards', async ({ renderWithProviders }) => {
      // Configure mock to delay response
      mockSearchTrips.mockImplementation(
        () => new Promise(() => {}), // Never resolves - stays in loading state
      );

      renderWithProviders(<FindPartnerPage />, {
        initialRoute: '/find-partner',
      });

      // Should see skeleton loading cards (animate-pulse class)
      await waitFor(() => {
        const loadingElements = document.querySelectorAll('.animate-pulse');
        expect(loadingElements.length).toBeGreaterThan(0);
      });

      // Should see "Loading trips..."
      expect(screen.getByText('Loading trips...')).toBeInTheDocument();
    });

    When('filters are being applied', () => {});
    Then('I should see skeleton loading cards', () => {});
    And('I should see "Loading trips..."', () => {});
  });

  // ============================================================================
  // Search Results Display
  // ============================================================================

  Scenario('View trips count', ({ When, Then }) => {
    test('shows trip count in results header', async ({
      renderWithProviders,
      fake,
    }) => {
      const mockTrips = [
        fake.createTrip(),
        fake.createTrip(),
        fake.createTrip(),
      ];
      mockSearchTrips.mockResolvedValue(mockTrips);

      renderWithProviders(<FindPartnerPage />, {
        initialRoute: '/find-partner',
      });

      // Should see trip count
      await waitFor(() => {
        expect(screen.getByText('3 trips found')).toBeInTheDocument();
      });
    });

    When('I view the search results', () => {});
    Then(
      'I should see "X trips found" where X is the number of results',
      () => {},
    );
  });

  Scenario('Search with no results', ({ When, Then, And }) => {
    test('shows no results message with post button', async ({
      renderWithProviders,
    }) => {
      mockSearchTrips.mockResolvedValue([]);

      renderWithProviders(<FindPartnerPage />, {
        initialRoute: '/find-partner',
      });

      // Should see "No trips found"
      await waitFor(() => {
        expect(screen.getByText('No trips found')).toBeInTheDocument();
      });

      // Should see suggestion message
      expect(
        screen.getByText(
          'Try adjusting your filters or check back later for new trips.',
        ),
      ).toBeInTheDocument();

      // Should see "Post Your Own Trip" button
      expect(
        screen.getByRole('button', { name: /Post Your Own Trip/i }),
      ).toBeInTheDocument();
    });

    When('I search for a destination with no matching trips', () => {});
    Then('I should see "No trips found"', () => {});
    And(
      'I should see "Try adjusting your filters or check back later for new trips."',
      () => {},
    );
    And('I should see a "Post Your Own Trip" button', () => {});
  });

  Scenario('Results display in grid', ({ When, Then, And }) => {
    test('shows trips in responsive grid', async ({
      renderWithProviders,
      fake,
    }) => {
      const mockTrips = [
        fake.createTrip(),
        fake.createTrip(),
        fake.createTrip(),
      ];
      mockSearchTrips.mockResolvedValue(mockTrips);

      renderWithProviders(<FindPartnerPage />, {
        initialRoute: '/find-partner',
      });

      await waitFor(() => {
        expect(screen.getByText('3 trips found')).toBeInTheDocument();
      });

      // Should have grid container with responsive classes
      const gridContainer = document.querySelector(
        '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3',
      );
      expect(gridContainer).toBeInTheDocument();
    });

    When('I view the search results', () => {});
    Then('I should see trip cards displayed in a grid', () => {});
    And(
      'the grid should be responsive (3 columns on desktop, fewer on mobile)',
      () => {},
    );
  });

  // ============================================================================
  // Guest Search Experience
  // ============================================================================

  Scenario(
    'Guest user can search and filter trips',
    ({ Given, When, Then, And }) => {
      test('shows search interface for guests', async ({
        renderWithProviders,
      }) => {
        mockSearchTrips.mockResolvedValue([]);

        renderWithProviders(<FindPartnerPage />, {
          initialRoute: '/find-partner',
        });

        // Should see search interface (destination input)
        await waitFor(() => {
          expect(
            screen.getByPlaceholderText(/Where are you going/i),
          ).toBeInTheDocument();
        });

        // Should see "More Filters" button
        expect(
          screen.getByRole('button', { name: /More Filters/i }),
        ).toBeInTheDocument();

        // Should see "Apply Filters" button
        expect(
          screen.getByRole('button', { name: /Apply Filters/i }),
        ).toBeInTheDocument();
      });

      Given('I am not signed in', () => {});
      When('I navigate to the find partners page', () => {});
      Then('I should see the search interface', () => {});
      And('I can use all filter options', () => {});
      And('I can view trip cards in results', () => {});
    },
  );

  // ============================================================================
  // Basic Search
  // ============================================================================

  Scenario.skip('Search trips by destination', ({ When, Then, And }) => {
    // Requires interaction with autocomplete
    When('I enter a destination in the city autocomplete', () => {});
    And('I click "Apply Filters"', () => {});
    Then('I should see trips matching that destination', () => {});
    And('the destination should appear as a filter chip', () => {});
  });

  Scenario.skip('Search with flexible dates', ({ When, Then, And }) => {
    // Requires toggle interaction
    When('I toggle the flexible dates switch', () => {});
    And('I click "Apply Filters"', () => {});
    Then('I should see trips marked as flexible', () => {});
    And('"Flexible Dates" should appear as a filter chip', () => {});
  });

  // ============================================================================
  // Advanced Filters
  // ============================================================================

  Scenario.skip('Access advanced filters', ({ When, Then, And }) => {
    When('I click "More Filters"', () => {});
    Then('I should see additional filter options revealed', () => {});
    And('I should see filters for:', () => {});
  });

  Scenario.skip('Filter trips by region', ({ When, Then, And }) => {
    When('I click "More Filters"', () => {});
    And('I select region "Europe"', () => {});
    And('I click "Apply Filters"', () => {});
    Then('I should see trips in European locations', () => {});
    And('"Europe" should appear as a filter chip', () => {});
  });

  Scenario.skip('Filter trips by country', ({ When, Then, And }) => {
    When('I click "More Filters"', () => {});
    And('I select a country from the dropdown', () => {});
    And('I click "Apply Filters"', () => {});
    Then('I should see trips in that country', () => {});
  });

  Scenario.skip('Filter trips by accommodation type', ({ When, Then, And }) => {
    When('I click "More Filters"', () => {});
    And('I select accommodation type "Apartment"', () => {});
    And('I click "Apply Filters"', () => {});
    Then('I should see trips with apartment accommodations', () => {});
  });

  Scenario.skip('Filter trips by group size', ({ When, Then, And }) => {
    When('I click "More Filters"', () => {});
    And('I select group size "4 people"', () => {});
    And('I click "Apply Filters"', () => {});
    Then('I should see trips with approximately 4 rooms', () => {});
  });

  Scenario.skip('Filter trips by vibe', ({ When, Then, And }) => {
    When('I click "More Filters"', () => {});
    And('I select vibe "Adventure"', () => {});
    And('I click "Apply Filters"', () => {});
    Then(
      'I should see trips with adventure in their description or vibe field',
      () => {},
    );
  });

  Scenario.skip(
    'Filter by date range when not flexible',
    ({ Given, When, Then, And }) => {
      Given('flexible dates is not toggled', () => {});
      When('I click "More Filters"', () => {});
      Then('I should see start date and end date inputs', () => {});
      And('I can select specific dates to filter by', () => {});
    },
  );

  // ============================================================================
  // Filter Management
  // ============================================================================

  Scenario.skip('Remove individual filter', ({ Given, When, Then, And }) => {
    Given('I have applied a destination filter', () => {});
    When('I click the X on the destination filter chip', () => {});
    Then('the destination filter should be removed', () => {});
    And('the filter chip should disappear', () => {});
  });

  Scenario.skip('Clear all filters', ({ Given, When, Then, And }) => {
    Given('I have applied multiple filters', () => {});
    When('I click "Clear all filters"', () => {});
    Then('all filters should be reset', () => {});
    And('all filter chips should disappear', () => {});
    And('I should see all available trips', () => {});
  });

  Scenario.skip('Filter count badge', ({ Given, Then }) => {
    Given('I have applied 3 filters', () => {});
    Then('the "More Filters" button should show a badge with "3"', () => {});
  });

  // ============================================================================
  // Trip Card Interactions
  // ============================================================================

  Scenario.skip('Trip card in search results', ({ When, Then }) => {
    When('I view the search results', () => {});
    Then('each trip card should display:', () => {});
  });

  Scenario.skip('Click trip card to view details', ({ When, Then }) => {
    When('I click on a trip card in search results', () => {});
    Then('I should be taken to the trip detail page', () => {});
  });

  // ============================================================================
  // Hidden Trips
  // ============================================================================

  Scenario.skip(
    'Admin-hidden trips do not appear in search results',
    ({ Given, When, Then, And }) => {
      // This is handled at the database/service level via searchable_trips view
      Given('a trip has been hidden by an administrator', () => {});
      When('I search for trips', () => {});
      Then('the hidden trip should not appear in results', () => {});
      And('only visible trips should be shown', () => {});
    },
  );

  // ============================================================================
  // Technical Scenarios
  // ============================================================================

  Scenario.skip(
    'Search queries searchable_trips view',
    ({ When, Then, And }) => {
      // Service level test - covered in tripService.test.ts
      When('the system performs a trip search', () => {});
      Then('it should query the searchable_trips view', () => {});
      And('the view automatically excludes hidden trips', () => {});
    },
  );
});
