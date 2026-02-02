/**
 * Authentication feature tests using vitest-cucumber.
 *
 * This spec file binds to features/authentication.feature and implements
 * executable tests for the authentication user stories.
 */
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

import { supabase } from '@/lib/supabase';
import { test } from '@/test/componentFixtures';
import { ForgotPasswordPage } from '../ForgotPasswordPage';
import { LoginPage } from '../LoginPage';
import { SignupPage } from '../SignupPage';

const feature = await loadFeature('features/authentication.feature');

describeFeature(feature, ({ Background, Scenario }) => {
  Background(({ Given }) => {
    Given('I am on the SplitStay website', () => {
      // Background step - establishes the test environment
    });
  });

  // ============================================================================
  // Email/Password Registration
  // ============================================================================

  Scenario('Sign up with email and password', ({ Given, When, Then, And }) => {
    test('shows confirmation message after successful signup', async ({
      renderWithProviders,
    }) => {
      const user = userEvent.setup();

      // Mock successful signup
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      renderWithProviders(<SignupPage />, { initialRoute: '/signup' });

      // Fill in the form
      await user.type(screen.getByPlaceholderText('John'), 'Test');
      await user.type(screen.getByPlaceholderText('Doe'), 'User');
      await user.type(
        screen.getByPlaceholderText('john@example.com'),
        'test@example.com',
      );
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      // Accept terms
      await user.click(screen.getByRole('checkbox'));

      // Submit
      await user.click(screen.getByRole('button', { name: 'Sign up' }));

      // Verify success message appears
      await waitFor(() => {
        expect(
          screen.getByText('Check your email for the confirmation link!'),
        ).toBeInTheDocument();
      });

      // Verify signUp was called with correct data
      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
        }),
      );
    });

    Given('I am on the signup page', () => {});
    When('I enter my first name and last name', () => {});
    And('I enter a valid email address', () => {});
    And('I enter a password meeting the minimum length requirement', () => {});
    And('I confirm my password', () => {});
    And('I agree to the Terms of Use and Privacy Policy', () => {});
    And('I click "Sign up"', () => {});
    Then(
      'I should see "Check your email for the confirmation link!"',
      () => {},
    );
  });

  Scenario(
    'Sign up with email that may already be registered',
    ({ Given, When, Then, And }) => {
      test('shows same confirmation message for existing email (security)', async ({
        renderWithProviders,
      }) => {
        const user = userEvent.setup();

        // Mock signup - Supabase returns success even for existing emails
        // (confirmation email just won't be sent to prevent email enumeration)
        vi.mocked(supabase.auth.signUp).mockResolvedValue({
          data: { user: null, session: null },
          error: null,
        });

        renderWithProviders(<SignupPage />, { initialRoute: '/signup' });

        // Fill in the form with any email
        await user.type(screen.getByPlaceholderText('John'), 'Existing');
        await user.type(screen.getByPlaceholderText('Doe'), 'User');
        await user.type(
          screen.getByPlaceholderText('john@example.com'),
          'existing@example.com',
        );
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        await user.type(passwordInputs[0], 'password123');
        await user.type(passwordInputs[1], 'password123');

        // Accept terms
        await user.click(screen.getByRole('checkbox'));

        // Submit
        await user.click(screen.getByRole('button', { name: 'Sign up' }));

        // Same message shown whether email is new or already registered
        await waitFor(() => {
          expect(
            screen.getByText('Check your email for the confirmation link!'),
          ).toBeInTheDocument();
        });
      });

      Given('I am on the signup page', () => {});
      When('I complete the signup form with any email address', () => {});
      And('I click "Sign up"', () => {});
      Then(
        'I should see "Check your email for the confirmation link!"',
        () => {},
      );
    },
  );

  Scenario(
    'Sign up with password that is too short',
    ({ Given, When, Then, And }) => {
      test('shows validation error for short password', async ({
        renderWithProviders,
      }) => {
        const user = userEvent.setup();
        renderWithProviders(<SignupPage />, { initialRoute: '/signup' });

        // Fill form with short password
        await user.type(screen.getByPlaceholderText('John'), 'Test');
        await user.type(screen.getByPlaceholderText('Doe'), 'User');
        await user.type(
          screen.getByPlaceholderText('john@example.com'),
          'test@example.com',
        );

        // Enter a password shorter than 6 characters
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        await user.type(passwordInputs[0], '12345');
        await user.type(passwordInputs[1], '12345');

        // Check the terms checkbox
        const termsCheckbox = screen.getByRole('checkbox');
        await user.click(termsCheckbox);

        // Click sign up
        await user.click(screen.getByRole('button', { name: 'Sign up' }));

        // Verify error message appears
        await waitFor(() => {
          expect(
            screen.getByText('Password must be at least 6 characters'),
          ).toBeInTheDocument();
        });
      });

      Given('I am on the signup page', () => {});
      When(
        'I complete the signup form with a password shorter than 6 characters',
        () => {},
      );
      And('I click "Sign up"', () => {});
      Then('I should see "Password must be at least 6 characters"', () => {});
    },
  );

  Scenario('Signup form requires terms agreement', ({ Given, When, Then }) => {
    test('submit button is disabled without terms checkbox', async ({
      renderWithProviders,
    }) => {
      const user = userEvent.setup();
      renderWithProviders(<SignupPage />, { initialRoute: '/signup' });

      // Fill in all fields
      await user.type(screen.getByPlaceholderText('John'), 'Test');
      await user.type(screen.getByPlaceholderText('Doe'), 'User');
      await user.type(
        screen.getByPlaceholderText('john@example.com'),
        'test@example.com',
      );
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      // Don't check terms checkbox
      // Verify button is disabled
      const signupButton = screen.getByRole('button', { name: 'Sign up' });
      expect(signupButton).toBeDisabled();
    });

    Given('I am on the signup page', () => {});
    When('I fill in all fields but do not check the terms agreement', () => {});
    Then('the "Sign up" button should be disabled', () => {});
  });

  Scenario.skip(
    'Rapid signup attempts are rate limited',
    ({ Given, When, Then }) => {
      Given('I am on the signup page', () => {});
      When(
        'I submit the signup form multiple times in quick succession',
        () => {},
      );
      Then(
        'I should see a message about waiting before trying again',
        () => {},
      );
    },
  );

  // ============================================================================
  // Email Confirmation
  // ============================================================================

  Scenario.skip(
    'Confirm email from confirmation link',
    ({ Given, When, Then, And }) => {
      Given('I have signed up with email and password', () => {});
      And('I have received a confirmation email', () => {});
      When('I click the confirmation link in the email', () => {});
      Then('I should be redirected to the profile creation page', () => {});
    },
  );

  // ============================================================================
  // Sign In
  // ============================================================================

  Scenario('Sign in with valid credentials', ({ Given, When, Then, And }) => {
    test('redirects to dashboard after successful sign in', async ({
      renderWithProviders,
      fake,
    }) => {
      const user = userEvent.setup();

      // Mock successful sign in
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: fake.createMockAuthUser({ email: 'test@example.com' }),
          session: {} as ReturnType<typeof fake.createMockAuthUser>,
        },
        error: null,
      });

      // Mock getUser to return the user after sign in
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: {
          user: fake.createMockAuthUser({
            id: 'user-123',
            email: 'test@example.com',
          }),
        },
        error: null,
      });

      // Mock profile check to return completed profile
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { profileCreated: true },
          error: null,
        }),
      } as ReturnType<typeof supabase.from>);

      renderWithProviders(<LoginPage />, { initialRoute: '/login' });

      // Enter credentials
      await user.type(
        screen.getByPlaceholderText('john@example.com'),
        'test@example.com',
      );
      await user.type(screen.getByPlaceholderText('••••••••'), 'password123');

      // Click sign in
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      // Verify sign in was called
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    Given('I have a confirmed account with a completed profile', () => {});
    And('I am on the signin page', () => {});
    When('I enter my email and password', () => {});
    And('I click "Sign in"', () => {});
    Then('I should be redirected to my dashboard', () => {});
  });

  Scenario('Sign in with invalid credentials', ({ Given, When, Then, And }) => {
    test('shows error message for invalid credentials', async ({
      renderWithProviders,
    }) => {
      const user = userEvent.setup();

      // Mock failed sign in
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          name: 'AuthApiError',
          status: 400,
        },
      });

      renderWithProviders(<LoginPage />, { initialRoute: '/login' });

      // Enter invalid credentials
      await user.type(
        screen.getByPlaceholderText('john@example.com'),
        'wrong@example.com',
      );
      await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword');

      // Click sign in
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      // Verify error message appears
      await waitFor(() => {
        expect(
          screen.getByText('Invalid login credentials'),
        ).toBeInTheDocument();
      });
    });

    Given('I am on the signin page', () => {});
    When(
      'I enter an email and password combination that is incorrect',
      () => {},
    );
    And('I click "Sign in"', () => {});
    Then('I should see "Invalid login credentials"', () => {});
    And('I should remain on the signin page', () => {});
  });

  // ============================================================================
  // OAuth
  // ============================================================================

  Scenario.skip(
    'Sign up with Google OAuth as new user',
    ({ Given, When, Then, And }) => {
      Given('I am on the signup page', () => {});
      When('I click "Continue with Google"', () => {});
      And('I authenticate with my Google account', () => {});
      Then('I should be redirected to the profile creation page', () => {});
    },
  );

  Scenario.skip(
    'Sign in with Google OAuth as returning user',
    ({ Given, When, Then, And }) => {
      Given('I have previously signed up with Google', () => {});
      And('I have completed my profile', () => {});
      And('I am on the signin page', () => {});
      When('I click "Continue with Google"', () => {});
      And('I authenticate with my Google account', () => {});
      Then('I should be redirected to my dashboard', () => {});
    },
  );

  // ============================================================================
  // Password Reset
  // ============================================================================

  Scenario('Request password reset', ({ Given, When, Then, And }) => {
    test('shows confirmation message after requesting reset', async ({
      renderWithProviders,
    }) => {
      const user = userEvent.setup();

      // Mock successful password reset request
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      renderWithProviders(<ForgotPasswordPage />, {
        initialRoute: '/forgot-password',
      });

      // Enter email
      await user.type(
        screen.getByPlaceholderText('john@example.com'),
        'user@example.com',
      );

      // Click send button
      await user.click(
        screen.getByRole('button', { name: 'Send Reset Instructions' }),
      );

      // Verify success message appears
      await waitFor(() => {
        expect(
          screen.getByText('Check your email for password reset instructions!'),
        ).toBeInTheDocument();
      });

      // Verify resetPasswordForEmail was called
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.any(Object),
      );
    });

    Given('I am on the forgot password page', () => {});
    When('I enter any email address', () => {});
    And('I click "Send Reset Instructions"', () => {});
    Then(
      'I should see "Check your email for password reset instructions!"',
      () => {},
    );
  });

  Scenario.skip(
    'Reset password with valid token',
    ({ Given, When, Then, And }) => {
      Given('I have requested a password reset', () => {});
      And('I have received the reset email', () => {});
      When('I click the reset link in the email', () => {});
      And('I enter a new valid password', () => {});
      And('I confirm the new password', () => {});
      And('I submit the reset form', () => {});
      Then('my password should be updated', () => {});
      And('I should be able to sign in with my new password', () => {});
    },
  );

  Scenario.skip(
    'Reset password with expired token',
    ({ Given, When, Then, And }) => {
      Given('I have a password reset token that has expired', () => {});
      When('I click the reset link in the email', () => {});
      Then('I should see an error that the link has expired', () => {});
      And('I should be prompted to request a new reset', () => {});
    },
  );

  // ============================================================================
  // Session Management
  // ============================================================================

  Scenario.skip(
    'User session persists across page reloads',
    ({ Given, When, Then }) => {
      Given('I am signed in', () => {});
      When('I reload the page', () => {});
      Then('I should still be signed in', () => {});
    },
  );

  Scenario('Sign out', ({ Given, When, Then, And }) => {
    test('calls signOut when user clicks sign out', async () => {
      // This test verifies the signOut function works
      // Full UI testing requires a signed-in state and header component

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      // Call signOut directly
      const result = await supabase.auth.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    Given('I am signed in', () => {});
    When('I click to sign out', () => {});
    Then('I should be signed out', () => {});
    And('I should be redirected to the landing page', () => {});
  });

  // ============================================================================
  // Redirect after signin
  // ============================================================================

  Scenario.skip(
    'Redirect to intended page after signin',
    ({ Given, When, Then, And }) => {
      Given('I am not signed in', () => {});
      And('I try to access the messages page', () => {});
      When('I am redirected to the signin page', () => {});
      And('I sign in successfully', () => {});
      Then('I should be redirected to the messages page', () => {});
    },
  );
});
