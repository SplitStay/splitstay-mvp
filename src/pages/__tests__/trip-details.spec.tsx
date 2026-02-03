/**
 * Trip details feature tests using vitest-cucumber.
 *
 * This spec file binds to features/trip-details.feature and implements
 * executable tests for trip viewing scenarios.
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
      is: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
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
vi.mock('@/lib/tripService', () => ({
  getTripById: vi.fn(),
  getUserTrips: vi.fn().mockResolvedValue([]),
  searchTrips: vi.fn().mockResolvedValue([]),
}));

// Mock iframely
vi.mock('@/lib/iframely', () => ({
  iframelyService: {
    getAccommodationPreview: vi.fn().mockResolvedValue({}),
  },
}));

// Mock chatService
vi.mock('@/lib/chatService', () => ({
  ChatService: {
    getOrCreateDirectConversation: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

import { getTripById } from '@/lib/tripService';
import { test } from '@/test/componentFixtures';
import { TripDetailPage } from '../TripDetailPage';

// Mock useParams to return a trip id
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-trip-id' }),
  };
});

const feature = await loadFeature('features/trip-details.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  // Handle background - trip exists
  Background(({ Given }) => {
    Given('a trip to "Barcelona" exists hosted by "Alice"', () => {
      // Mocks are configured per-test
    });
  });
  // ============================================================================
  // Loading and Error States
  // ============================================================================

  Scenario('Trip loading state', ({ When, And, Then }) => {
    test('shows skeleton loading animation', async ({
      renderWithProviders,
    }) => {
      // Configure mock to delay response
      const mockedGetTripById = vi.mocked(getTripById);
      mockedGetTripById.mockImplementation(
        () => new Promise(() => {}), // Never resolves - stays in loading state
      );

      renderWithProviders(<TripDetailPage />, {
        initialRoute: '/trip/test-trip-id',
      });

      // Should see skeleton loading animation (animate-pulse class)
      await waitFor(() => {
        const loadingElements = document.querySelectorAll('.animate-pulse');
        expect(loadingElements.length).toBeGreaterThan(0);
      });
    });

    When('I navigate to a trip detail page', () => {});
    And('the trip is loading', () => {});
    Then('I should see a skeleton loading animation', () => {});
  });

  Scenario('Trip not found', ({ When, Then, And }) => {
    test('shows not found message with browse button', async ({
      renderWithProviders,
    }) => {
      // Configure mock to return null (trip not found)
      const mockedGetTripById = vi.mocked(getTripById);
      mockedGetTripById.mockResolvedValue(null);

      renderWithProviders(<TripDetailPage />, {
        initialRoute: '/trip/nonexistent',
      });

      // Should see "Trip not found"
      await waitFor(() => {
        expect(screen.getByText('Trip not found')).toBeInTheDocument();
      });

      // Should see explanation message
      expect(
        screen.getByText(
          'This trip may have been removed or is no longer available.',
        ),
      ).toBeInTheDocument();

      // Should see "Browse Trips" button
      expect(
        screen.getByRole('button', { name: /Browse Trips/i }),
      ).toBeInTheDocument();
    });

    When("I navigate to a trip that doesn't exist", () => {});
    Then('I should see "Trip not found"', () => {});
    And(
      'I should see "This trip may have been removed or is no longer available"',
      () => {},
    );
    And('I should see a "Browse Trips" button', () => {});
  });

  // ============================================================================
  // Safety Information
  // ============================================================================

  Scenario('View safety tips', ({ When, Then, And }) => {
    test('shows safety tips section with advice', async ({
      renderWithProviders,
      fake,
    }) => {
      // Configure mock to return a trip
      const mockedGetTripById = vi.mocked(getTripById);
      mockedGetTripById.mockResolvedValue({
        ...fake.createTrip(),
        isHiddenByAdmin: false,
      });

      renderWithProviders(<TripDetailPage />, {
        initialRoute: '/trip/test-trip-id',
      });

      // Should see "Safety Tips" section
      await waitFor(() => {
        expect(screen.getByText('Safety Tips')).toBeInTheDocument();
      });

      // Should see tips about meeting in public places
      expect(
        screen.getByText(/Always meet in public places first/i),
      ).toBeInTheDocument();

      // Should see tips about verifying bookings
      expect(
        screen.getByText(/Verify accommodation bookings/i),
      ).toBeInTheDocument();
    });

    When('I view the trip detail page', () => {});
    Then('I should see a "Safety Tips" section', () => {});
    And('I should see tips about meeting in public places', () => {});
    And('I should see tips about verifying bookings', () => {});
  });

  // ============================================================================
  // Viewing Trip Details
  // ============================================================================

  Scenario('View complete trip details', ({ When, Then, And }) => {
    test('shows trip name, location, dates, and duration', async ({
      renderWithProviders,
      fake,
    }) => {
      const mockTrip = {
        ...fake.createTrip({
          name: 'Barcelona Adventure',
          location: 'Barcelona, Spain',
          flexible: false,
          startDate: '2025-06-01',
          endDate: '2025-06-10',
        }),
        isHiddenByAdmin: false,
      };

      const mockedGetTripById = vi.mocked(getTripById);
      mockedGetTripById.mockResolvedValue(mockTrip);

      renderWithProviders(<TripDetailPage />, {
        initialRoute: '/trip/test-trip-id',
      });

      // Should see trip name as hero title
      await waitFor(() => {
        expect(screen.getByText('Barcelona Adventure')).toBeInTheDocument();
      });

      // Should see location (may appear multiple times)
      expect(screen.getAllByText('Barcelona, Spain').length).toBeGreaterThan(0);

      // Should see duration (9 days for June 1-10)
      expect(screen.getByText('9 days')).toBeInTheDocument();
    });

    When('I view the trip detail page', () => {});
    Then('I should see the trip name as the hero title', () => {});
    And('I should see the trip location', () => {});
    And(
      'I should see the trip dates or "Flexible dates" if flexible',
      () => {},
    );
    And('I should see the trip duration in days', () => {});
  });

  Scenario('View trip description', ({ When, Then, And }) => {
    test('shows about this trip section', async ({
      renderWithProviders,
      fake,
    }) => {
      const mockTrip = {
        ...fake.createTrip({
          description: 'Exploring the beautiful city of Barcelona!',
        }),
        isHiddenByAdmin: false,
      };

      const mockedGetTripById = vi.mocked(getTripById);
      mockedGetTripById.mockResolvedValue(mockTrip);

      renderWithProviders(<TripDetailPage />, {
        initialRoute: '/trip/test-trip-id',
      });

      // Should see "About this trip" section
      await waitFor(() => {
        expect(screen.getByText('About this trip')).toBeInTheDocument();
      });

      // Should see description
      expect(
        screen.getByText('Exploring the beautiful city of Barcelona!'),
      ).toBeInTheDocument();
    });

    When('I view the trip detail page', () => {});
    Then('I should see the "About this trip" section', () => {});
    And(
      'I should see the host\'s description or "No description provided"',
      () => {},
    );
  });

  // ============================================================================
  // Host Information
  // ============================================================================

  Scenario('View host card', ({ When, Then, And }) => {
    test('shows host information with verified badge', async ({
      renderWithProviders,
      fake,
    }) => {
      const mockTrip = {
        ...fake.createTrip(),
        host: { name: 'Alice', imageUrl: null },
        isHiddenByAdmin: false,
      };

      const mockedGetTripById = vi.mocked(getTripById);
      mockedGetTripById.mockResolvedValue(mockTrip);

      renderWithProviders(<TripDetailPage />, {
        initialRoute: '/trip/test-trip-id',
      });

      // Should see host name
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Should see "Verified host" badge
      expect(screen.getByText('Verified host')).toBeInTheDocument();

      // Should see hardcoded host stats
      expect(screen.getByText('Response rate')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });

    When('I view the trip detail page', () => {});
    Then("I should see the host's profile picture", () => {});
    And("I should see the host's name", () => {});
    And('I should see "Verified host" badge', () => {});
    And(
      'I should see hardcoded host stats (response rate, time, trips hosted)',
      () => {},
    );
  });

  // ============================================================================
  // Viewing Own Trip (Owner Actions)
  // ============================================================================

  Scenario.skip(
    'Cannot request to join own trip',
    ({ Given, When, Then, And }) => {
      // Requires authenticated user mock which is complex
      Given('I am signed in as the host', () => {});
      When('I view my own trip', () => {});
      Then(
        'I should see a "Manage Trip" button instead of "Message Host"',
        () => {},
      );
      And('I should not see the "Request to Join" button', () => {});
      And('I should see "This is your trip" message', () => {});
    },
  );

  // ============================================================================
  // Guest Actions (redirect to signup)
  // ============================================================================

  Scenario.skip('Message host as guest', ({ Given, When, Then, And }) => {
    // Requires click interaction and navigation testing
    Given('I am not signed in', () => {});
    When('I view the trip detail page', () => {});
    And('I click "Message Host"', () => {});
    Then('I should be redirected to the signup page', () => {});
    And('the redirect state should preserve the trip context', () => {});
  });

  Scenario.skip(
    'Request to join requires authentication',
    ({ Given, When, Then, And }) => {
      // Requires click interaction and navigation testing
      Given('I am not signed in', () => {});
      When('I view the trip detail page', () => {});
      And('I click "Request to Join"', () => {});
      Then('I should be redirected to the signup page', () => {});
      And(
        'the redirect state should preserve the trip and action context',
        () => {},
      );
    },
  );

  // ============================================================================
  // Trip Image and Accommodation
  // ============================================================================

  Scenario.skip(
    'View trip image from booking link',
    ({ Given, When, Then, And }) => {
      // Requires iframely mock with image response
      Given('the trip has a valid booking URL', () => {});
      When('I view the trip detail page', () => {});
      Then('I should see an image preview of the accommodation', () => {});
      And(
        'if no image is found, I should see a placeholder with the location name',
        () => {},
      );
    },
  );

  Scenario.skip('View accommodation summary', ({ When, Then, And }) => {
    // Complex UI verification
    When('I view the trip detail page', () => {});
    Then('I should see quick info cards showing:', () => {});
    And('I should see total beds and ensuite bathrooms count', () => {});
    And('I should see a link to view the booking site', () => {});
  });

  Scenario.skip('View estimated cost', ({ Given, When, Then }) => {
    Given('the trip has an estimated cost', () => {});
    When('I view the trip detail page', () => {});
    Then('I should see the cost per person', () => {});
  });

  Scenario.skip('Navigate to host profile', ({ When, Then, And }) => {
    // Requires click and navigation
    When('I view the trip detail page', () => {});
    And("I click on the host's name or image", () => {});
    Then("I should be taken to the host's profile page", () => {});
  });

  // ============================================================================
  // Message and Join Requests (authenticated scenarios)
  // ============================================================================

  Scenario.skip(
    'Message host as signed in user',
    ({ Given, When, Then, And }) => {
      Given('I am signed in', () => {});
      When('I view the trip detail page', () => {});
      And('I click "Message Host"', () => {});
      Then('a conversation should be created with the host', () => {});
      And('I should be taken to the messages page', () => {});
    },
  );

  Scenario.skip('Request to join a trip', ({ Given, When, Then, And }) => {
    Given('I am signed in', () => {});
    When('I view the trip detail page', () => {});
    And('I click "Request to Join"', () => {});
    Then('a join request should be created in the database', () => {});
    And('a pre-written message should be sent to the host', () => {});
    And('I should be taken to the messages page', () => {});
  });

  Scenario.skip(
    'Cannot request to join matched trip',
    ({ Given, When, Then, And }) => {
      Given('the trip already has a confirmed joinee', () => {});
      When('I view the trip detail page', () => {});
      Then('I should not see the "Request to Join" button', () => {});
      And('I should see "Matched" in the trip status', () => {});
    },
  );

  // ============================================================================
  // Trip Sharing and Saving
  // ============================================================================

  Scenario.skip('Share trip via modal', ({ When, Then, And }) => {
    When('I view the trip detail page', () => {});
    And('I click the share button', () => {});
    Then('I should see a share modal', () => {});
    And('the modal should contain a shareable link', () => {});
    And('the modal should contain a pre-written share message', () => {});
  });

  Scenario.skip('Toggle save trip button', ({ When, Then, And }) => {
    When('I view the trip detail page', () => {});
    And('I click the heart/save button', () => {});
    Then('the button should visually toggle to filled state', () => {});
    And('clicking again should toggle it back', () => {});
  });

  // ============================================================================
  // Admin Hidden Trip
  // ============================================================================

  Scenario.skip(
    'Owner views their own admin-hidden trip',
    ({ Given, When, Then, And }) => {
      // Requires authenticated user as owner
      Given('I am the host of a trip', () => {});
      And('my trip has been hidden by an administrator', () => {});
      When('I view my trip detail page', () => {});
      Then('I should see my trip details', () => {});
      And('I should see a banner indicating the trip is hidden', () => {});
      And(
        'the banner should show "This trip has been hidden by an administrator"',
        () => {},
      );
    },
  );

  Scenario(
    'Non-owner cannot view admin-hidden trip',
    ({ Given, When, Then, And }) => {
      test('returns trip not found for hidden trip', async ({
        renderWithProviders,
      }) => {
        // Hidden trip returns null for non-owner
        const mockedGetTripById = vi.mocked(getTripById);
        mockedGetTripById.mockResolvedValue(null);

        renderWithProviders(<TripDetailPage />, {
          initialRoute: '/trip/hidden-trip',
        });

        await waitFor(() => {
          expect(screen.getByText('Trip not found')).toBeInTheDocument();
        });

        expect(
          screen.getByText(
            'This trip may have been removed or is no longer available.',
          ),
        ).toBeInTheDocument();
      });

      Given('a trip has been hidden by an administrator', () => {});
      And('I am not the host of that trip', () => {});
      When('I try to view the trip detail page', () => {});
      Then('I should see "Trip not found"', () => {});
      And(
        'I should see "This trip may have been removed or is no longer available"',
        () => {},
      );
    },
  );

  // ============================================================================
  // Technical Scenarios (@technical tag - service level)
  // ============================================================================

  Scenario.skip(
    'Hidden trip returns isHiddenByAdmin flag for owner',
    ({ Given, When, Then, And }) => {
      // Service level test - covered in tripService.test.ts
      Given('I am the host of a hidden trip', () => {});
      When('the system fetches the trip by ID', () => {});
      Then('the trip should include isHiddenByAdmin: true', () => {});
      And('the trip details should be returned', () => {});
    },
  );

  Scenario.skip(
    'Hidden trip returns null for non-owner',
    ({ Given, When, Then, And }) => {
      // Service level test - covered in tripService.test.ts
      Given('a trip is hidden by an administrator', () => {});
      And('the current user is not the host', () => {});
      When('the system fetches the trip by ID', () => {});
      Then('the system should return null', () => {});
    },
  );
});
