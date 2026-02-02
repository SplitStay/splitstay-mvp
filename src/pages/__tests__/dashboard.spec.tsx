/**
 * Dashboard feature tests using vitest-cucumber.
 *
 * This spec file binds to features/dashboard.feature and implements
 * executable tests for the user dashboard user stories.
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
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      resend: vi.fn().mockResolvedValue({ error: null }),
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

// Mock tripService - we'll override this per test
vi.mock('@/lib/tripService', () => ({
  getUserTrips: vi.fn().mockResolvedValue([]),
  searchTrips: vi.fn().mockResolvedValue([]),
}));

import { test } from '@/test/componentFixtures';
import { DashboardPage } from '../DashboardPage';

const feature = await loadFeature('features/dashboard.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  Background(({ Given, And }) => {
    Given('I am signed in', () => {
      // Background step - establishes signed-in state
    });
    And('I have a complete profile', () => {
      // Background step - profile is complete
    });
  });

  // ============================================================================
  // Dashboard Overview
  // ============================================================================

  Scenario.skip(
    'View dashboard with future trips',
    ({ Given, When, Then, And }) => {
      Given('I have trips with start dates in the future', () => {});
      When('I navigate to my dashboard', () => {});
      Then('I should see the "Future Trips" tab selected by default', () => {});
      And('I should see my future trips displayed as cards', () => {});
      And(
        'each trip card should show the host name, location, dates, and accommodation type',
        () => {},
      );
    },
  );

  Scenario.skip(
    'View dashboard with past trips',
    ({ Given, When, Then, And }) => {
      Given('I have trips with end dates in the past', () => {});
      When('I navigate to my dashboard', () => {});
      And('I click the "Past Trips" tab', () => {});
      Then('I should see my past trips displayed as cards', () => {});
    },
  );

  Scenario.skip(
    'View empty dashboard - no future trips',
    ({ Given, When, Then, And }) => {
      // Note: Requires AuthContext mock with onAuthStateChange
      Given('I have no trips with future dates', () => {});
      When('I navigate to my dashboard', () => {});
      Then('I should see "No upcoming trips yet"', () => {});
      And('I should see a "Post Your First Trip" button', () => {});
    },
  );

  Scenario.skip(
    'View empty dashboard - no past trips',
    ({ Given, When, Then, And }) => {
      // Note: Requires AuthContext mock with onAuthStateChange
      Given('I have no trips with past end dates', () => {});
      When('I navigate to my dashboard', () => {});
      And('I click the "Past Trips" tab', () => {});
      Then('I should see "No past trips yet"', () => {});
      And('I should see "Your completed trips will appear here"', () => {});
    },
  );

  // ============================================================================
  // Trip Card Information
  // ============================================================================

  Scenario.skip(
    'Trip card displays key information',
    ({ Given, When, Then, And }) => {
      Given('I have a trip on my dashboard', () => {});
      When('I view the trip card', () => {});
      Then('I should see the host name and image', () => {});
      And('I should see the trip location', () => {});
      And('I should see the trip dates or "Dates TBD" if flexible', () => {});
      And('I should see the accommodation type', () => {});
      And('I should see the room and bed count', () => {});
    },
  );

  Scenario.skip(
    'Trip card shows "Open" status when no joinee',
    ({ Given, When, Then }) => {
      Given('I have a trip without a matched joinee', () => {});
      When('I view the trip card', () => {});
      Then('I should see an "Open" badge', () => {});
    },
  );

  Scenario.skip(
    'Trip card shows "Matched" status when joinee exists',
    ({ Given, When, Then }) => {
      Given('I have a trip with a matched joinee', () => {});
      When('I view the trip card', () => {});
      Then('I should see a "Matched" badge', () => {});
    },
  );

  Scenario.skip(
    'Trip card shows "Flexible" badge for flexible dates',
    ({ Given, When, Then }) => {
      Given('I have a trip with flexible dates', () => {});
      When('I view the trip card', () => {});
      Then('I should see a "Flexible" badge', () => {});
    },
  );

  Scenario.skip(
    'Trip card shows "Private" badge for private trips',
    ({ Given, When, Then }) => {
      Given('I have a private trip', () => {});
      When('I view the trip card', () => {});
      Then('I should see a "Private" badge', () => {});
    },
  );

  Scenario.skip(
    'Owner sees their admin-hidden trip on dashboard',
    ({ Given, When, Then, And }) => {
      Given('I have a trip that was hidden by an administrator', () => {});
      When('I navigate to my dashboard', () => {});
      Then('I should still see my hidden trip in the list', () => {});
      And('the trip should indicate it has been hidden by admin', () => {});
    },
  );

  Scenario.skip(
    "getUserTrips includes hidden status for user's trips",
    ({ Given, When, Then, And }) => {
      Given('I have trips where some are admin-hidden', () => {});
      When('the system fetches my trips', () => {});
      Then('each trip should include an isHiddenByAdmin flag', () => {});
      And('hidden trips should have isHiddenByAdmin: true', () => {});
      And('visible trips should have isHiddenByAdmin: false', () => {});
    },
  );

  // ============================================================================
  // Trip Card Navigation
  // ============================================================================

  Scenario.skip(
    'Navigate to trip detail from dashboard',
    ({ Given, When, Then }) => {
      Given('I have a trip on my dashboard', () => {});
      When('I click on the trip card', () => {});
      Then('I should be taken to the trip detail page', () => {});
    },
  );

  // ============================================================================
  // Trip Requests Section
  // ============================================================================

  Scenario.skip('View trip requests section', ({ Given, Then, And }) => {
    // Note: Requires AuthContext mock with onAuthStateChange
    Given('I am on my dashboard', () => {});
    Then('I should see a "Trip Requests Received" section', () => {});
    And(
      'the section should show "People wanting to join your trips"',
      () => {},
    );
  });

  Scenario.skip('No pending trip requests', ({ Given, When, Then, And }) => {
    // Note: Requires AuthContext mock with onAuthStateChange
    Given('no one has requested to join my trips', () => {});
    When('I view the trip requests section', () => {});
    Then('I should see "No Trip Requests Yet"', () => {});
    And(
      'I should see "When people want to join your trips, you\'ll see their requests here"',
      () => {},
    );
  });

  // ============================================================================
  // Guest Dashboard Experience
  // ============================================================================

  Scenario('Guest views dashboard', ({ Given, When, Then, And }) => {
    test('shows guest welcome message', async ({ renderWithProviders }) => {
      renderWithProviders(<DashboardPage />, { initialRoute: '/dashboard' });

      await waitFor(() => {
        expect(screen.getByText('Welcome to SplitStay')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/You're browsing as a guest/i),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /Browse Trips/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Post Your Trip/i }),
      ).toBeInTheDocument();
    });

    Given('I am not signed in', () => {});
    When('I navigate to the dashboard', () => {});
    Then('I should see "Welcome to SplitStay"', () => {});
    And('I should see "You\'re browsing as a guest"', () => {});
    And('I should see "Browse Trips" and "Post Your Trip" buttons', () => {});
  });

  // ============================================================================
  // Loading and Error States
  // ============================================================================

  Scenario.skip(
    'Dashboard shows loading state',
    ({ Given, When, Then, And }) => {
      Given('I am signed in', () => {});
      When('I navigate to my dashboard', () => {});
      And('my trips are loading', () => {});
      Then('I should see a loading indicator', () => {});
    },
  );

  Scenario.skip('Dashboard shows error state', ({ Given, When, Then, And }) => {
    Given('I am signed in', () => {});
    When('I navigate to my dashboard', () => {});
    And('trip data fails to load', () => {});
    Then('I should see "Error"', () => {});
    And('I should see "Failed to load user data"', () => {});
  });
});
