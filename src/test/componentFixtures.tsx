/**
 * Component test fixtures for vitest-cucumber integration.
 *
 * Provides fixtures for testing React components with all required providers,
 * mocked Supabase client, and fake data generators.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { test as base, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { GuestModeProvider } from '../contexts/GuestModeContext';
import { createFakeApi, type FakeApi } from '../lib/testing/createFakeApi';

/**
 * Mock Supabase auth methods for testing.
 */
export interface SupabaseMock {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signInWithOAuth: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    resetPasswordForEmail: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    resend: ReturnType<typeof vi.fn>;
    onAuthStateChange: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
}

/**
 * Creates a fresh Supabase mock with all auth methods stubbed.
 */
export function createSupabaseMock(): SupabaseMock {
  return {
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
  };
}

/**
 * Props for the test Wrapper component.
 */
interface WrapperProps {
  children: ReactNode;
  initialRoute?: string;
}

/**
 * Wrapper component type for test fixtures.
 */
export type TestWrapper = React.FC<WrapperProps>;

/**
 * Creates a test wrapper component with all required providers.
 *
 * Each invocation creates a fresh QueryClient to prevent state leakage.
 */
export function createWrapper(): TestWrapper {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children, initialRoute = '/' }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <AuthProvider>
            <GuestModeProvider>{children}</GuestModeProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

/**
 * Fixtures provided to each test.
 */
export interface ComponentFixtures {
  /** Test wrapper with all providers */
  Wrapper: TestWrapper;
  /** Mocked Supabase client */
  supabaseMock: SupabaseMock;
  /** Fake data generators */
  fake: FakeApi;
  /** Render helper with providers included */
  renderWithProviders: (
    ui: ReactNode,
    options?: Omit<RenderOptions, 'wrapper'> & { initialRoute?: string },
  ) => ReturnType<typeof rtlRender>;
}

/**
 * Extended Vitest test function with component test fixtures.
 *
 * Provides Wrapper, supabaseMock, fake, and renderWithProviders fixtures.
 *
 * @example
 * ```typescript
 * import { test } from '@/test/componentFixtures';
 *
 * test('renders signup page', async ({ Wrapper, supabaseMock, fake }) => {
 *   // Configure mock
 *   supabaseMock.auth.getSession.mockResolvedValue({
 *     data: { session: null },
 *     error: null,
 *   });
 *
 *   // Render with providers
 *   render(<SignupPage />, { wrapper: Wrapper });
 *
 *   // Assert
 *   expect(screen.getByText('Create Account')).toBeInTheDocument();
 * });
 * ```
 */
export const test = base.extend<ComponentFixtures>({
  Wrapper: async ({ Wrapper: _unused }, use) => {
    await use(createWrapper());
  },
  supabaseMock: async ({ supabaseMock: _unused }, use) => {
    await use(createSupabaseMock());
  },
  fake: async ({ fake: _unused }, use) => {
    await use(createFakeApi());
  },
  renderWithProviders: async ({ Wrapper }, use) => {
    const render = (
      ui: ReactNode,
      options?: Omit<RenderOptions, 'wrapper'> & { initialRoute?: string },
    ) => {
      const { initialRoute, ...renderOptions } = options ?? {};
      const WrapperWithRoute: React.FC<{ children: ReactNode }> = ({
        children,
      }) => <Wrapper initialRoute={initialRoute}>{children}</Wrapper>;

      return rtlRender(ui, { wrapper: WrapperWithRoute, ...renderOptions });
    };
    await use(render);
  },
});

export { screen, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
// Re-export test utilities for convenience
export {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
