/**
 * Technical specification: Test fixtures provide injected dependencies
 *
 * This test validates the test fixture infrastructure for vitest-cucumber integration.
 * Uses plain Vitest (not vitest-cucumber) since we're testing the fixtures themselves.
 */
import { describe, expect, vi } from 'vitest';

// Mock supabase before importing fixtures that depend on it
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

import { test } from '../componentFixtures';

describe('Component test fixtures', () => {
  describe('Wrapper fixture', () => {
    test('provides a React component wrapper', async ({ Wrapper }) => {
      expect(Wrapper).toBeDefined();
      expect(typeof Wrapper).toBe('function');
    });
  });

  describe('supabaseMock fixture', () => {
    test('provides auth methods', async ({ supabaseMock }) => {
      expect(supabaseMock).toBeDefined();
      expect(supabaseMock.auth).toBeDefined();
      expect(typeof supabaseMock.auth.signUp).toBe('function');
      expect(typeof supabaseMock.auth.signInWithPassword).toBe('function');
      expect(typeof supabaseMock.auth.signOut).toBe('function');
      expect(typeof supabaseMock.auth.getUser).toBe('function');
      expect(typeof supabaseMock.auth.getSession).toBe('function');
    });

    test('auth methods return configured responses', async ({
      supabaseMock,
    }) => {
      const result = await supabaseMock.auth.getSession();
      expect(result).toEqual({ data: { session: null }, error: null });
    });

    test('provides from method for database queries', async ({
      supabaseMock,
    }) => {
      expect(typeof supabaseMock.from).toBe('function');
      const builder = supabaseMock.from('test');
      expect(builder).toBeDefined();
      expect(typeof builder.select).toBe('function');
    });
  });

  describe('fake fixture', () => {
    test('provides data generators', async ({ fake }) => {
      expect(fake).toBeDefined();
      expect(typeof fake.createMockAuthUser).toBe('function');
      expect(typeof fake.createMockUserResponse).toBe('function');
      expect(typeof fake.createUser).toBe('function');
      expect(typeof fake.createTrip).toBe('function');
    });

    test('createMockAuthUser generates valid user', async ({ fake }) => {
      const user = fake.createMockAuthUser({ email: 'test@example.com' });
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.aud).toBe('authenticated');
      expect(user.created_at).toBeDefined();
    });
  });

  describe('renderWithProviders fixture', () => {
    test('is provided and callable', async ({ renderWithProviders }) => {
      expect(renderWithProviders).toBeDefined();
      expect(typeof renderWithProviders).toBe('function');
    });
  });
});
