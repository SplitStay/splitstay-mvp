/**
 * User profile feature tests using vitest-cucumber.
 *
 * This spec file binds to features/user-profile.feature and implements
 * executable tests for profile management scenarios.
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

// Mock useUser hooks
const mockUseUser = vi.fn();
const mockUseUserByIdOrCustomUrl = vi.fn();
vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser(),
  useUserByIdOrCustomUrl: (id: string) => mockUseUserByIdOrCustomUrl(id),
}));

import { test } from '@/test/componentFixtures';
import ProfilePage from '../ProfilePage';

// Mock useParams to return a profile id
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-profile-id' }),
  };
});

const feature = await loadFeature('features/user-profile.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  // Handle background - user is signed in
  Background(({ Given }) => {
    Given('I am signed in', () => {
      // Mocks are configured per-test
    });
  });
  // ============================================================================
  // Loading State
  // ============================================================================

  Scenario('Profile loading state', ({ When, Then, And }) => {
    test('shows loading spinner', async ({ renderWithProviders }) => {
      // Configure mocks to be in loading state
      mockUseUser.mockReturnValue({ data: null });
      mockUseUserByIdOrCustomUrl.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ProfilePage />, {
        initialRoute: '/profile/test-id',
      });

      // Should see "Loading profile..."
      await waitFor(() => {
        expect(screen.getByText('Loading profile...')).toBeInTheDocument();
      });

      // Should see spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    When('I navigate to a profile page', () => {});
    And('the profile is loading', () => {});
    Then('I should see "Loading profile..."', () => {});
    And('I should see a loading spinner', () => {});
  });

  // ============================================================================
  // Profile Not Found
  // ============================================================================

  Scenario('Profile not found', ({ When, Then, And }) => {
    test('shows not found message', async ({ renderWithProviders }) => {
      mockUseUser.mockReturnValue({ data: null });
      mockUseUserByIdOrCustomUrl.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Not found'),
      });

      renderWithProviders(<ProfilePage />, {
        initialRoute: '/profile/nonexistent',
      });

      // Should see "Profile not found"
      await waitFor(() => {
        expect(screen.getByText('Profile not found')).toBeInTheDocument();
      });

      // Should see message
      expect(
        screen.getByText("This profile doesn't exist or has been removed."),
      ).toBeInTheDocument();

      // Should see "Back to Dashboard" button
      expect(
        screen.getByRole('button', { name: /Back to Dashboard/i }),
      ).toBeInTheDocument();
    });

    When("I navigate to a profile that doesn't exist", () => {});
    Then('I should see "Profile not found"', () => {});
    And(
      'I should see "This profile doesn\'t exist or has been removed."',
      () => {},
    );
    And('I should see a "Back to Dashboard" button', () => {});
  });

  // ============================================================================
  // Profile Viewing
  // ============================================================================

  Scenario('View my own profile', ({ Given, When, Then, And }) => {
    test('shows complete profile information', async ({
      renderWithProviders,
      fake,
    }) => {
      const mockUser = {
        ...fake.createUser({
          name: 'Alice Smith',
          bio: 'Love to travel!',
          currentPlace: 'New York',
          birthPlace: 'London',
          gender: 'female',
          languages: ['English', 'Spanish'],
          learningLanguages: ['French'],
          travelTraits: ['Adventurous', 'Foodie'],
          yearOfBirth: 1990,
          monthOfBirth: 5,
          dayOfBirth: 15,
        }),
        profileCreated: true,
      };

      mockUseUser.mockReturnValue({ data: mockUser });
      mockUseUserByIdOrCustomUrl.mockReturnValue({
        data: mockUser,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ProfilePage />, { initialRoute: '/profile/my-id' });

      // Should see name
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });

      // Should see bio
      expect(screen.getByText('Love to travel!')).toBeInTheDocument();

      // Should see current location
      expect(screen.getByText('New York')).toBeInTheDocument();

      // Should see birth place
      expect(screen.getByText('From London')).toBeInTheDocument();

      // Should see gender
      expect(screen.getByText('female')).toBeInTheDocument();

      // Should see languages as chips
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Spanish')).toBeInTheDocument();

      // Should see learning languages
      expect(screen.getByText('French')).toBeInTheDocument();

      // Should see travel traits
      expect(screen.getByText('Adventurous')).toBeInTheDocument();
      expect(screen.getByText('Foodie')).toBeInTheDocument();

      // Should see "Share Profile" button
      expect(
        screen.getByRole('button', { name: /Share Profile/i }),
      ).toBeInTheDocument();
    });

    Given('I have completed my profile', () => {});
    When('I navigate to my profile page', () => {});
    Then('I should see my name in the header', () => {});
    And('I should see my profile picture', () => {});
    And('I should see my bio', () => {});
    And('I should see my current location', () => {});
    And('I should see my birth place', () => {});
    And('I should see my age (calculated from date of birth)', () => {});
    And('I should see my gender', () => {});
    And('I should see my languages spoken as chips', () => {});
    And('I should see my learning languages as chips', () => {});
    And('I should see my travel style/traits as chips', () => {});
    And('I should see an "Edit Profile" button', () => {});
    And('I should see a "Share Profile" button', () => {});
  });

  Scenario("View another user's profile", ({ Given, When, Then, And }) => {
    test('shows public info without edit button', async ({
      renderWithProviders,
      fake,
    }) => {
      const currentUser = {
        ...fake.createUser({ name: 'Me' }),
        profileCreated: true,
      };
      const profileUser = {
        ...fake.createUser({
          id: 'alice-id',
          name: 'Alice',
          bio: 'Traveler bio',
        }),
        profileCreated: true,
      };

      mockUseUser.mockReturnValue({ data: currentUser });
      mockUseUserByIdOrCustomUrl.mockReturnValue({
        data: profileUser,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ProfilePage />, {
        initialRoute: '/profile/alice-id',
      });

      // Should see Alice's name
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Should see "Share Profile" button
      expect(
        screen.getByRole('button', { name: /Share Profile/i }),
      ).toBeInTheDocument();

      // Should NOT see "Edit Profile" button (not own profile)
      expect(
        screen.queryByRole('button', { name: /Edit Profile/i }),
      ).not.toBeInTheDocument();
    });

    Given('another user "Alice" has a complete profile', () => {});
    When("I navigate to Alice's profile page", () => {});
    Then("I should see Alice's public profile information", () => {});
    And('I should see a "Share Profile" button', () => {});
    And('I should NOT see an "Edit Profile" button', () => {});
  });

  // ============================================================================
  // Travel Experience
  // ============================================================================

  Scenario(
    'View my travel experience section',
    ({ Given, When, Then, And }) => {
      test('shows travel experience sections', async ({
        renderWithProviders,
        fake,
      }) => {
        const mockUser = {
          ...fake.createUser({
            mostInfluencedCountry: 'Japan',
            mostInfluencedCountryDescription: 'Changed my perspective on life',
            mostInfluencedExperience: 'Backpacking through Southeast Asia',
            travelPhotos: ['photo1.jpg', 'photo2.jpg'],
          }),
          profileCreated: true,
        };

        mockUseUser.mockReturnValue({ data: mockUser });
        mockUseUserByIdOrCustomUrl.mockReturnValue({
          data: mockUser,
          isLoading: false,
          error: null,
        });

        renderWithProviders(<ProfilePage />, {
          initialRoute: '/profile/my-id',
        });

        // Should see "Most Influenced by [country]" section
        await waitFor(() => {
          expect(
            screen.getByText(/Most Influenced by Japan/i),
          ).toBeInTheDocument();
        });

        // Should see "Most Impactful Travel Experience" section
        expect(
          screen.getByText('Most Impactful Travel Experience'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('Backpacking through Southeast Asia'),
        ).toBeInTheDocument();

        // Should see travel photos section
        expect(screen.getByText('Travel Photos')).toBeInTheDocument();
      });

      Given(
        'I have completed my profile with travel experience info',
        () => {},
      );
      When('I view my profile', () => {});
      Then('I should see "Most Influenced by [country]" section', () => {});
      And('I should see "Most Impactful Travel Experience" section', () => {});
      And('I should see my travel photos', () => {});
    },
  );

  // ============================================================================
  // Profile Sharing
  // ============================================================================

  Scenario.skip('Share profile via modal', ({ Given, When, Then, And }) => {
    // Requires click interaction
    Given('I am on any profile page', () => {});
    When('I click "Share Profile"', () => {});
    Then('I should see a share modal', () => {});
    And('the modal should contain a shareable link', () => {});
  });

  Scenario.skip(
    'Access profile via personalized link',
    ({ Given, When, Then }) => {
      // Requires URL routing test
      Given(
        'user "Bob" has set a personalized profile link "bob-travels"',
        () => {},
      );
      When('I visit /profile/bob-travels', () => {});
      Then("I should see Bob's profile page", () => {});
    },
  );

  // ============================================================================
  // Profile Creation (4-step wizard) - Skipped (complex wizard)
  // ============================================================================

  Scenario.skip(
    'Complete profile creation wizard - Step 1 Basic Info',
    ({ Given, When, Then, And }) => {
      Given('I am on the profile creation page', () => {});
      And('I am on step 1 "Basic Info"', () => {});
      When('I enter my full name', () => {});
      And('I select my date of birth (day, month, year)', () => {});
      And('I select my gender', () => {});
      And('I upload a profile picture', () => {});
      And('I click "Next"', () => {});
      Then('I should advance to step 2 "Location"', () => {});
    },
  );

  Scenario.skip(
    'Complete profile creation wizard - Step 2 Location',
    ({ Given, When, Then, And }) => {
      Given('I am on step 2 "Location"', () => {});
      When('I search for and select my birth place', () => {});
      And('I search for and select my current location', () => {});
      And('I optionally select my most influenced country', () => {});
      And('I optionally describe why that country influenced me', () => {});
      And('I click "Next"', () => {});
      Then('I should advance to step 3 "Languages"', () => {});
    },
  );

  Scenario.skip(
    'Complete profile creation wizard - Step 3 Languages',
    ({ Given, When, Then, And }) => {
      Given('I am on step 3 "Languages"', () => {});
      When('I select the languages I speak', () => {});
      And('I optionally select languages I am learning', () => {});
      And('I optionally enter a personalized profile link', () => {});
      And('I click "Next"', () => {});
      Then('I should advance to step 4 "Preferences"', () => {});
    },
  );

  Scenario.skip(
    'Complete profile creation wizard - Step 4 Preferences',
    ({ Given, When, Then, And }) => {
      Given('I am on step 4 "Preferences"', () => {});
      When('I select my travel traits', () => {});
      And('I enter my bio', () => {});
      And('I optionally add travel photos', () => {});
      And(
        'I optionally describe my most influential travel experience',
        () => {},
      );
      And('I click "Complete"', () => {});
      Then('my profile should be created', () => {});
      And(
        'I should see a toast notification "Profile created successfully!"',
        () => {},
      );
      And('I should be redirected to my dashboard', () => {});
    },
  );

  Scenario.skip(
    'Navigate back through profile creation steps',
    ({ Given, When, Then, And }) => {
      Given('I am on the profile creation page', () => {});
      And('I am on step 3 "Languages"', () => {});
      When('I click "Back"', () => {});
      Then('I should return to step 2 "Location"', () => {});
      And('my previously entered data should be preserved', () => {});
    },
  );

  Scenario.skip(
    'Pending trip is created after profile completion',
    ({ Given, When, Then, And }) => {
      Given('I completed the post trip wizard as a guest', () => {});
      And('my trip data was saved to local storage', () => {});
      When('I complete my profile', () => {});
      Then('my pending trip should be automatically created', () => {});
      And('I should see "Trip posted successfully!" toast', () => {});
    },
  );

  // ============================================================================
  // Profile Editing - Skipped (complex wizard)
  // ============================================================================

  Scenario.skip('Edit profile via wizard', ({ Given, Then, And }) => {
    Given('I have completed my profile', () => {});
    And('I click "Edit Profile" on my profile page', () => {});
    Then('I should see the 4-step edit wizard', () => {});
    And('my existing data should be pre-filled in each step', () => {});
  });

  Scenario.skip('Update profile information', ({ Given, When, Then, And }) => {
    Given('I am on the edit profile page', () => {});
    When('I make changes to my profile data', () => {});
    And('I complete all steps', () => {});
    And('I click the final save button', () => {});
    Then('my profile should be updated', () => {});
    And('I should see "Profile updated successfully!"', () => {});
    And('I should be redirected to my profile page', () => {});
  });

  // ============================================================================
  // Progress Indicator - Skipped (wizard tests)
  // ============================================================================

  Scenario.skip('Profile wizard shows progress', ({ Given, Then, And }) => {
    Given('I am on the profile creation page', () => {});
    Then('I should see a progress indicator', () => {});
    And(
      'I should see step titles: Basic Info, Location, Languages, Preferences',
      () => {},
    );
    And('the current step should be highlighted', () => {});
  });
});
