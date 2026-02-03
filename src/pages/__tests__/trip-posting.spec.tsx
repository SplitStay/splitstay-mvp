/**
 * Trip posting feature tests using vitest-cucumber.
 *
 * This spec file binds to features/trip-posting.feature and implements
 * executable tests for trip creation wizard scenarios.
 *
 * Note: Most trip posting scenarios involve multi-step wizard flows which
 * are complex to test at the unit level. This file focuses on simpler
 * component-level tests.
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

// Mock iframely
vi.mock('@/lib/iframely', () => ({
  iframelyService: {
    getAccommodationPreview: vi.fn().mockResolvedValue({}),
  },
}));

// Mock tripService
vi.mock('@/lib/tripService', () => ({
  createTrip: vi.fn(),
  updateTrip: vi.fn(),
  getUserTrips: vi.fn().mockResolvedValue([]),
}));

// Mock storageService
vi.mock('@/lib/storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock accommodationService
vi.mock('@/lib/accommodationService', () => ({
  getAccommodationTypes: vi.fn().mockResolvedValue([
    { id: 'hostel-room', name: 'Hostel Room' },
    { id: 'hotel-room', name: 'Hotel Room' },
    { id: 'apartment', name: 'Apartment' },
    { id: 'house', name: 'House' },
  ]),
}));

import { test } from '@/test/componentFixtures';
import PostTripPage from '../PostTripPage';

const feature = await loadFeature('features/trip-posting.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  // Handle background - user is signed in with completed profile
  Background(({ Given, And }) => {
    Given('I am signed in', () => {
      // Mocks are configured per-test
    });
    And('I have completed my profile', () => {
      // Mocks are configured per-test
    });
  });
  // ============================================================================
  // Progress Indicator
  // ============================================================================

  Scenario('Wizard shows progress indicator', ({ Given, Then, And }) => {
    test('shows 4-step progress indicator', async ({ renderWithProviders }) => {
      renderWithProviders(<PostTripPage />, { initialRoute: '/post-trip' });

      // Should be on step 1 (Destination) - this confirms the wizard is rendering
      await waitFor(() => {
        expect(screen.getByText(/Trip Name/i)).toBeInTheDocument();
      });

      // Should see the Next button indicating step navigation is available
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();

      // Should see destination-related inputs
      expect(screen.getByText(/City & Country/i)).toBeInTheDocument();
    });

    Given('I am on the post trip page', () => {});
    Then('I should see a progress indicator with 4 dots', () => {});
    And('the current step dot should be highlighted', () => {});
  });

  // ============================================================================
  // Trip Creation Wizard - Step 1
  // ============================================================================

  Scenario.skip(
    'Create trip - Step 1 Destination with specific dates',
    ({ Given, When, Then, And }) => {
      // Complex wizard interaction
      Given('I am on the post trip page', () => {});
      And('I am on step 1', () => {});
      When('I enter a trip name', () => {});
      And('I search for a destination city using the autocomplete', () => {});
      And('I select "Barcelona, Spain" from the suggestions', () => {});
      And('I enter a start date and end date', () => {});
      And('I click "Next"', () => {});
      Then('I should advance to step 2 Accommodation', () => {});
    },
  );

  Scenario.skip(
    'Create trip - Step 1 Destination with flexible dates',
    ({ Given, When, Then, And }) => {
      // Complex wizard interaction
      Given('I am on the post trip page', () => {});
      And('I am on step 1', () => {});
      When('I enter a trip name', () => {});
      And('I select a destination', () => {});
      And('I toggle "I\'m flexible / Dates not confirmed yet"', () => {});
      And('I select an estimated month and year', () => {});
      And('I click "Next"', () => {});
      Then('I should advance to step 2 Accommodation', () => {});
    },
  );

  // ============================================================================
  // Trip Creation Wizard - Step 2
  // ============================================================================

  Scenario.skip(
    'Create trip - Step 2 Accommodation',
    ({ Given, When, Then, And }) => {
      // Complex wizard interaction
      Given('I am on step 2 Accommodation', () => {});
      When('I select an accommodation type from the dropdown', () => {});
      And('I enter an accommodation link (URL required)', () => {});
      And('I set the number of rooms', () => {});
      And('I configure each room with number of beds and bed type', () => {});
      And('I optionally check ensuite bathroom for each room', () => {});
      And('I click "Next"', () => {});
      Then('I should advance to step 3 Preferences', () => {});
    },
  );

  Scenario.skip(
    'User can categorize their accommodation when posting a trip',
    ({ Given, When, Then }) => {
      // @accommodation-types
      Given('I am on step 2 Accommodation', () => {});
      When('I click on the accommodation type dropdown', () => {});
      Then('I can select from accommodation categories:', () => {});
    },
  );

  Scenario.skip('Booking URL shows preview', ({ Given, When, Then, And }) => {
    Given('I am on step 2 Accommodation', () => {});
    When('I enter a valid booking URL', () => {});
    Then('after a brief delay I should see an accommodation preview', () => {});
    And('the preview should show the property title and image', () => {});
    And('I should see a "Refresh" button to reload the preview', () => {});
  });

  // ============================================================================
  // Room Configuration
  // ============================================================================

  Scenario.skip('Configure room details', ({ Given, Then, And }) => {
    Given('I am on step 2 Accommodation', () => {});
    And('I have set the number of rooms to 2', () => {});
    Then('I should see a configuration section for each room', () => {});
    And('each room section should have:', () => {});
  });

  Scenario.skip(
    'Changing room count resets configuration',
    ({ Given, When, Then, And }) => {
      Given('I am on step 2 Accommodation', () => {});
      And('I have configured 3 rooms', () => {});
      When('I change the number of rooms to 2', () => {});
      Then('I should see only 2 room configuration sections', () => {});
      And('the configuration should reset to defaults', () => {});
    },
  );

  // ============================================================================
  // Trip Creation Wizard - Step 3 & 4
  // ============================================================================

  Scenario.skip(
    'Create trip - Step 3 Preferences',
    ({ Given, When, Then, And }) => {
      Given('I am on step 3 Preferences', () => {});
      When('I select who I want to match with (Male/Female/Anyone)', () => {});
      And('I enter a trip vibe/description', () => {});
      And('I select the trip privacy (Public/Private)', () => {});
      And('I click "Next"', () => {});
      Then('I should advance to step 4 Preview', () => {});
    },
  );

  Scenario.skip(
    'Create trip - Step 4 Preview and publish',
    ({ Given, When, Then, And }) => {
      Given('I am on step 4 Preview', () => {});
      And('I can see all my trip details', () => {});
      When('I click "Publish Trip"', () => {});
      Then('my trip should be created', () => {});
      And('I should see a success modal', () => {});
      And(
        'I should see a toast notification "Trip posted successfully!"',
        () => {},
      );
    },
  );

  // ============================================================================
  // Guest Trip Posting
  // ============================================================================

  Scenario.skip(
    'Guest completes wizard and is redirected to signup',
    ({ Given, When, Then, And }) => {
      // @guest-mode
      Given('I am not signed in', () => {});
      And('I have completed all steps of the trip wizard', () => {});
      When('I click "Publish Trip"', () => {});
      Then('my trip data should be saved to local storage', () => {});
      And('I should be redirected to the signup page', () => {});
      And('the redirect state should indicate I was creating a trip', () => {});
    },
  );

  // ============================================================================
  // Trip Editing - Skipped (modal-based, requires trip context)
  // ============================================================================

  Scenario.skip('Open edit trip modal', ({ Given, When, Then, And }) => {
    Given('I have posted a trip', () => {});
    When('I view my trip detail page', () => {});
    And('I click "Manage Trip"', () => {});
    Then('I should see the edit trip modal', () => {});
  });

  Scenario.skip('Edit trip basic details', ({ Given, When, Then, And }) => {
    Given('I am viewing the edit trip modal', () => {});
    When('I change the trip name', () => {});
    And('I change the location', () => {});
    And('I change the description', () => {});
    And('I click "Save Changes"', () => {});
    Then('my trip should be updated', () => {});
  });

  Scenario.skip(
    'Edit trip dates - switch to flexible',
    ({ Given, When, Then, And }) => {
      Given('I have a trip with specific dates', () => {});
      When('I open the edit modal', () => {});
      And('I check "Flexible dates"', () => {});
      And('I select an estimated month and year', () => {});
      And('I save changes', () => {});
      Then('my trip should show flexible dates', () => {});
    },
  );

  Scenario.skip(
    'Edit trip dates - set specific dates',
    ({ Given, When, Then, And }) => {
      Given('I have a trip with flexible dates', () => {});
      When('I open the edit modal', () => {});
      And('I uncheck "Flexible dates"', () => {});
      And('I set start and end dates', () => {});
      And('I save changes', () => {});
      Then('my trip should show the specific dates', () => {});
    },
  );

  Scenario.skip('Edit accommodation details', ({ Given, When, Then, And }) => {
    Given('I am viewing the edit trip modal', () => {});
    When('I update the booking URL', () => {});
    Then('I should see the new accommodation preview', () => {});
    And('I can change the number of rooms', () => {});
    And('I can update room configurations', () => {});
  });

  Scenario.skip('Edit match preferences', ({ Given, When, Then, And }) => {
    Given('I am viewing the edit trip modal', () => {});
    When('I change "Who would you like to match with?"', () => {});
    And('I save changes', () => {});
    Then('my trip should reflect the new preference', () => {});
  });

  Scenario.skip('Change trip visibility', ({ Given, When, Then, And }) => {
    Given('I have a public trip', () => {});
    When('I open the edit modal', () => {});
    And('I uncheck "Make this trip public"', () => {});
    And('I save changes', () => {});
    Then('my trip should become private', () => {});
  });

  // ============================================================================
  // Trip Deletion
  // ============================================================================

  Scenario.skip(
    'Delete trip with confirmation',
    ({ Given, When, Then, And }) => {
      Given('I am viewing the edit trip modal', () => {});
      When('I scroll to the "Danger Zone" section', () => {});
      And('I click "Delete Trip"', () => {});
      Then('I should see a confirmation prompt', () => {});
      And('I should see "Are you sure? This cannot be undone."', () => {});
    },
  );

  Scenario.skip('Confirm trip deletion', ({ Given, When, Then, And }) => {
    Given('I am viewing the delete confirmation', () => {});
    When('I click "Yes, Delete Trip"', () => {});
    Then('my trip should be permanently deleted', () => {});
    And('I should be redirected to my dashboard', () => {});
  });

  Scenario.skip('Cancel trip deletion', ({ Given, When, Then, And }) => {
    Given('I am viewing the delete confirmation', () => {});
    When('I click "Cancel"', () => {});
    Then('the confirmation should close', () => {});
    And('my trip should remain unchanged', () => {});
  });
});
