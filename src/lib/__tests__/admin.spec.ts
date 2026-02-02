/**
 * Admin feature tests using vitest-cucumber.
 *
 * This spec file binds to features/admin.feature and implements
 * the @technical service-level scenarios.
 */
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { expect, vi } from 'vitest';

// Mock supabase before importing the service
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { hideTrip, isCurrentUserAdmin, unhideTrip } from '../adminService';
import { supabase } from '../supabase';

const feature = await loadFeature('features/admin.feature');

// Valid UUIDs for tests
const VALID_TRIP_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_USER_ID = '660e8400-e29b-41d4-a716-446655440001';

describeFeature(feature, ({ Background, Scenario }) => {
  Background(({ Given }) => {
    Given('I am signed in as an admin user', () => {
      vi.clearAllMocks();
    });
  });

  // ============================================================================
  // Admin Access - service layer tests
  // ============================================================================

  Scenario(
    'Admin status is determined by admin_users table',
    ({ Given, Then, And }) => {
      let isAdmin = false;

      Given('my user ID is in the admin_users table', async () => {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
          data: {
            user: { id: VALID_USER_ID } as ReturnType<
              typeof supabase.auth.getUser
            > extends Promise<infer T>
              ? T extends { data: { user: infer U } }
                ? U
                : never
              : never,
          },
          error: null,
        });

        const mockFrom = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { userId: VALID_USER_ID, createdAt: '2026-01-28' },
                error: null,
              }),
            }),
          }),
        });
        vi.mocked(supabase.from).mockImplementation(mockFrom);

        isAdmin = await isCurrentUserAdmin();
      });

      Then('I should be recognized as an admin', () => {
        expect(isAdmin).toBe(true);
      });

      And('I can access the admin panel', () => {
        // Access is determined by isAdmin being true
        expect(isAdmin).toBe(true);
      });
    },
  );

  // ============================================================================
  // Technical Error Handling - hideTrip
  // ============================================================================

  Scenario('Hide trip that is already hidden', ({ Given, When, Then }) => {
    let error: Error | null = null;

    Given('a trip is already hidden', () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'duplicate key' },
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);
    });

    When('an admin attempts to hide it again', async () => {
      try {
        await hideTrip(VALID_TRIP_ID);
      } catch (e) {
        error = e as Error;
      }
    });

    Then('the system should return error "Trip is already hidden"', () => {
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Trip is already hidden');
    });
  });

  Scenario('Hide non-existent trip', ({ When, Then }) => {
    let error: Error | null = null;

    When("an admin attempts to hide a trip that doesn't exist", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23503', message: 'foreign key violation' },
            }),
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);

      try {
        await hideTrip(VALID_TRIP_ID);
      } catch (e) {
        error = e as Error;
      }
    });

    Then('the system should return error "Trip not found"', () => {
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Trip not found');
    });
  });

  Scenario('Hide trip with invalid ID format', ({ When, Then }) => {
    let error: Error | null = null;

    When('an admin attempts to hide a trip with an invalid UUID', async () => {
      try {
        await hideTrip('not-a-uuid');
      } catch (e) {
        error = e as Error;
      }
    });

    Then('the system should return error "Invalid trip ID"', () => {
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Invalid trip ID');
    });
  });

  // ============================================================================
  // Technical Error Handling - unhideTrip
  // ============================================================================

  Scenario('Unhide trip that is not hidden', ({ Given, When, Then }) => {
    let error: Error | null = null;

    Given('a trip is not hidden', () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
            count: 0,
          }),
        }),
      });
      vi.mocked(supabase.from).mockImplementation(mockFrom);
    });

    When('an admin attempts to unhide it', async () => {
      try {
        await unhideTrip(VALID_TRIP_ID);
      } catch (e) {
        error = e as Error;
      }
    });

    Then('the system should return error "Trip is not hidden"', () => {
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Trip is not hidden');
    });
  });

  Scenario('Unhide trip with invalid ID format', ({ When, Then }) => {
    let error: Error | null = null;

    When(
      'an admin attempts to unhide a trip with an invalid UUID',
      async () => {
        try {
          await unhideTrip('invalid-uuid');
        } catch (e) {
          error = e as Error;
        }
      },
    );

    Then('the system should return error "Invalid trip ID"', () => {
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Invalid trip ID');
    });
  });

  // ============================================================================
  // UI Scenarios - Skipped (tested in admin.spec.tsx or require auth mocking)
  // ============================================================================

  Scenario.skip('Admin can access admin panel', ({ When, Then, And }) => {
    When('I navigate to /admin', () => {});
    Then('I should see "Admin - Trip Moderation" header', () => {});
    And('I should see a list of all trips', () => {});
  });

  Scenario.skip(
    'Non-admin sees 404 on admin page',
    ({ Given, When, Then, And }) => {
      Given('I am signed in as a regular user', () => {});
      When('I navigate to /admin', () => {});
      Then('I should see "404"', () => {});
      And('I should see "Page not found"', () => {});
      And('I should see a "Go Home" button', () => {});
    },
  );

  Scenario.skip(
    'Unauthenticated user is redirected to login',
    ({ Given, When, Then }) => {
      Given('I am not signed in', () => {});
      When('I try to navigate to /admin', () => {});
      Then('I should be redirected to /login?redirect=/admin', () => {});
    },
  );

  Scenario.skip('View all trips for moderation', ({ When, Then, And }) => {
    When('I view the admin trip list', () => {});
    Then('I should see a table with columns:', () => {});
    And('each row should show the trip name', () => {});
    And("each row should show the host's name and image", () => {});
    And('each row should show the location', () => {});
    And('each row should show the dates or "Flexible dates"', () => {});
    And('each row should show a "Visible" or "Hidden" badge', () => {});
  });

  Scenario.skip(
    'Empty state when no trips exist',
    ({ Given, When, Then, And }) => {
      Given('there are no trips in the system', () => {});
      When('I view the admin panel', () => {});
      Then('I should see "No trips yet"', () => {});
      And(
        'I should see "There are no trips in the system to moderate."',
        () => {},
      );
    },
  );

  Scenario.skip('Hide a visible trip', ({ Given, When, Then, And }) => {
    Given('there is a visible trip', () => {});
    When('I click the "Hide" button on that trip', () => {});
    Then('the trip should be marked as hidden', () => {});
    And('the badge should change to "Hidden"', () => {});
    And('the button should change to "Show"', () => {});
  });

  Scenario.skip('Show a hidden trip', ({ Given, When, Then, And }) => {
    Given('there is a hidden trip', () => {});
    When('I click the "Show" button on that trip', () => {});
    Then('the trip should be made visible', () => {});
    And('the badge should change to "Visible"', () => {});
    And('the button should change to "Hide"', () => {});
  });

  Scenario.skip('Hide action shows loading state', ({ When, Then, And }) => {
    When('I click to hide a trip', () => {});
    Then('the button should show a loading spinner', () => {});
    And('the button should be disabled until the action completes', () => {});
  });

  Scenario.skip(
    'Error handling for moderation action',
    ({ Given, Then, And }) => {
      Given('a moderation action fails', () => {});
      Then('I should see an error message', () => {});
      And('I should see a "Dismiss" button to close the error', () => {});
    },
  );
});
