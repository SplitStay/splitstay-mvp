/**
 * Guest mode feature tests using vitest-cucumber.
 *
 * This spec file binds to features/guest-mode.feature and implements
 * executable tests for the guest browsing user stories.
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

// Mock tripService for dashboard
vi.mock('@/lib/tripService', () => ({
  getUserTrips: vi.fn().mockResolvedValue([]),
  searchTrips: vi.fn().mockResolvedValue([]),
}));

import { test } from '@/test/componentFixtures';
import { DashboardPage } from '../DashboardPage';
import { HomePage } from '../HomePage';
import HowItWorks from '../HowItWorks';
import PrivacyPage from '../PrivacyPage';
import TermsPage from '../TermsPage';

const feature = await loadFeature('features/guest-mode.feature');

describeFeature(feature, ({ Scenario }) => {
  // ============================================================================
  // Landing Page
  // ============================================================================

  Scenario('View landing page as guest', ({ Given, When, Then, And }) => {
    test('shows value proposition and CTA buttons', async ({
      renderWithProviders,
    }) => {
      renderWithProviders(<HomePage />, { initialRoute: '/' });

      // Should see value proposition - look for the main heading text
      await waitFor(() => {
        expect(screen.getByText(/Share your/i)).toBeInTheDocument();
      });

      // Should see CTA buttons (there may be multiple, use getAllBy)
      expect(
        screen.getAllByRole('button', { name: /Post Your Trip/i }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByRole('button', { name: /Create Profile/i }).length,
      ).toBeGreaterThan(0);
    });

    Given('I am not signed in', () => {});
    When('I visit the SplitStay homepage', () => {});
    Then('I should see the value proposition', () => {});
    And('I should see Trustpilot reviews', () => {});
    And(
      'I should see "Get Started", "Post Your Trip", and "Create Profile" buttons',
      () => {},
    );
  });

  // ============================================================================
  // Trip Browsing
  // ============================================================================

  Scenario.skip('Search trips as guest', ({ Given, When, Then, And }) => {
    Given('I am not signed in', () => {});
    When('I navigate to the find partners page', () => {});
    And('I search for trips in "Barcelona"', () => {});
    Then('I should see matching trips', () => {});
    And(
      'I should see trip cards with host info, location, and dates',
      () => {},
    );
  });

  Scenario.skip('View trip details as guest', ({ Given, When, Then, And }) => {
    Given('I am not signed in', () => {});
    When('I view a trip detail page', () => {});
    Then('I should see the destination and dates', () => {});
    And('I should see accommodation details', () => {});
    And('I should see "Message Host" and "Request to Join" buttons', () => {});
  });

  Scenario.skip('Apply filters as guest', ({ Given, When, Then, And }) => {
    Given('I am not signed in', () => {});
    When('I filter trips by accommodation type', () => {});
    Then('the filter should work', () => {});
    And('I should see filtered results', () => {});
  });

  // ============================================================================
  // Dashboard Access
  // ============================================================================

  Scenario('Guest views dashboard', ({ Given, When, Then, And }) => {
    test('shows guest welcome message and browse buttons', async ({
      renderWithProviders,
    }) => {
      renderWithProviders(<DashboardPage />, { initialRoute: '/dashboard' });

      // Should see welcome message
      await waitFor(() => {
        expect(screen.getByText('Welcome to SplitStay')).toBeInTheDocument();
      });

      // Should see guest mode message
      expect(
        screen.getByText(
          /You're browsing as a guest. Sign up to post trips and message travelers!/i,
        ),
      ).toBeInTheDocument();

      // Should see action buttons
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
    And(
      'I should see "You\'re browsing as a guest. Sign up to post trips and message travelers!"',
      () => {},
    );
    And('I should see "Browse Trips" and "Post Your Trip" buttons', () => {});
  });

  // ============================================================================
  // Auth-Required Actions
  // ============================================================================

  Scenario.skip(
    'Guest tries to message a host',
    ({ Given, When, Then, And }) => {
      Given('I am not signed in', () => {});
      And('I am viewing a trip detail page', () => {});
      When('I click "Message Host"', () => {});
      Then('I should be redirected to the signup page', () => {});
    },
  );

  Scenario.skip(
    'Guest tries to request joining a trip',
    ({ Given, When, Then, And }) => {
      Given('I am not signed in', () => {});
      And('I am viewing a trip detail page', () => {});
      When('I click "Request to Join"', () => {});
      Then('I should be redirected to the signup page', () => {});
    },
  );

  Scenario.skip('Guest posts a trip', ({ Given, When, Then, And }) => {
    Given('I am not signed in', () => {});
    When('I complete the post trip wizard', () => {});
    And('I click to publish the trip', () => {});
    Then('my trip data should be saved to local storage', () => {});
    And('I should be redirected to the signup page', () => {});
  });

  Scenario.skip(
    'Pending trip is created after signup',
    ({ Given, When, Then, And }) => {
      Given('I completed the post trip wizard as a guest', () => {});
      And('my trip data was saved to local storage', () => {});
      When('I sign up and create my profile', () => {});
      Then('my pending trip should be automatically created', () => {});
      And('I should see my trip on my dashboard', () => {});
    },
  );

  // ============================================================================
  // Messages Page Access
  // ============================================================================

  Scenario.skip(
    'Guest accessing messages page',
    ({ Given, When, Then, And }) => {
      Given('I am not signed in', () => {});
      When('I try to access the messages page directly', () => {});
      Then('I should be redirected to the signin page', () => {});
      And(
        'the redirect URL should preserve "/messages" as the destination',
        () => {},
      );
    },
  );

  // ============================================================================
  // Profile Viewing
  // ============================================================================

  Scenario.skip('View user profile as guest', ({ Given, When, Then, And }) => {
    Given('I am not signed in', () => {});
    When("I view a user's profile page", () => {});
    Then('I should see their public information', () => {});
    And('I should see their name, bio, and travel traits', () => {});
  });

  // ============================================================================
  // Static Pages
  // ============================================================================

  Scenario('Guest can view how it works page', ({ Given, When, Then }) => {
    test('renders how it works content', async ({ renderWithProviders }) => {
      renderWithProviders(<HowItWorks />, { initialRoute: '/how-it-works' });

      // Wait for auth state to settle, then check content
      await waitFor(() => {
        expect(screen.getByText(/How SplitStay Works/i)).toBeInTheDocument();
      });

      // Should see key sections - use getAllBy since text may appear multiple times
      expect(screen.getAllByText('Create Your Profile').length).toBeGreaterThan(
        0,
      );
      expect(screen.getByText('Browse & Match')).toBeInTheDocument();
      expect(screen.getByText('Split the Cost')).toBeInTheDocument();
    });

    Given('I am not signed in', () => {});
    When('I navigate to the "How It Works" page', () => {});
    Then('I should see the platform explanation', () => {});
  });

  Scenario('Guest can view terms of service', ({ Given, When, Then }) => {
    test('renders terms of service content', async ({
      renderWithProviders,
    }) => {
      renderWithProviders(<TermsPage />, { initialRoute: '/terms' });

      // Wait for auth state to settle, then check content
      await waitFor(() => {
        expect(
          screen.getByText('SplitStay - Terms & Conditions'),
        ).toBeInTheDocument();
      });

      // Should see key sections
      expect(screen.getByText('1. About SplitStay')).toBeInTheDocument();
      expect(screen.getByText('2. Definitions')).toBeInTheDocument();
    });

    Given('I am not signed in', () => {});
    When('I navigate to the terms page', () => {});
    Then('I should see the terms of service', () => {});
  });

  Scenario('Guest can view privacy policy', ({ Given, When, Then }) => {
    test('renders privacy policy content', async ({ renderWithProviders }) => {
      renderWithProviders(<PrivacyPage />, { initialRoute: '/privacy' });

      // Wait for auth state to settle, then check content
      await waitFor(() => {
        expect(
          screen.getByText('SplitStay - User Privacy Policy'),
        ).toBeInTheDocument();
      });

      // Should see key sections
      expect(screen.getByText('1. What data we collect')).toBeInTheDocument();
      expect(screen.getByText('2. How we use your data')).toBeInTheDocument();
    });

    Given('I am not signed in', () => {});
    When('I navigate to the privacy page', () => {});
    Then('I should see the privacy policy', () => {});
  });
});
