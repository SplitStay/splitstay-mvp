import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHandler } from '../handler';
import type {
  AccessControl,
  DbClient,
  EventRegistration,
  HandlerDependencies,
  LlmClient,
  MatchingUser,
  MatchProfile,
  TwilioValidator,
} from '../types';

type MockOverrides = {
  llm?: Partial<LlmClient>;
  db?: Partial<DbClient>;
  accessControl?: Partial<AccessControl>;
  twilioValidator?: Partial<TwilioValidator>;
  validateOutput?: HandlerDependencies['validateOutput'];
  validateInput?: HandlerDependencies['validateInput'];
};

const matchingUser: MatchingUser = {
  id: 'user-123',
  displayName: 'Jane Doe',
  preferencesConfigured: true,
};

const sampleRegistration: EventRegistration = {
  eventId: 'evt-1',
  eventName: 'Summer Festival',
  startDate: '2026-06-24',
  endDate: '2026-06-28',
  location: 'Pilton',
  isHost: false,
};

const sampleMatch: MatchProfile = {
  userId: 'user-b',
  displayName: 'Alice',
  bio: 'Love exploring',
  sharedTraits: ['adventure'],
  sharedLanguages: ['English'],
  compatibilityScore: 0.85,
  accommodationSummary: '2-bed apartment',
  profileUrl: null,
};

const createMockDeps = (
  overrides: MockOverrides = {},
): HandlerDependencies => ({
  llm: {
    chatCompletion: vi.fn().mockResolvedValue({ content: 'Bot reply' }),
    ...overrides.llm,
  },
  db: {
    checkSeenSid: vi.fn().mockResolvedValue(false),
    markSidSeen: vi.fn().mockResolvedValue(undefined),
    checkRateLimit: vi
      .fn()
      .mockResolvedValue({ allowed: true, retryAfterMinutes: 0 }),
    getConversationHistory: vi.fn().mockResolvedValue([]),
    saveMessages: vi.fn().mockResolvedValue(undefined),
    saveFlaggedContent: vi.fn().mockResolvedValue(undefined),
    countRecentFlags: vi.fn().mockResolvedValue(0),
    findMatchingEvents: vi.fn().mockResolvedValue([]),
    findPropertyListing: vi.fn().mockResolvedValue(false),
    savePropertyListing: vi
      .fn()
      .mockResolvedValue({ propertyListingId: 'pl-mock' }),
    findUserByPhone: vi.fn().mockResolvedValue(null),
    getUserEventRegistrations: vi.fn().mockResolvedValue([]),
    getEventMatchProfiles: vi.fn().mockResolvedValue([]),
    ...overrides.db,
  },
  accessControl: {
    isAdmin: vi.fn().mockReturnValue(false),
    ...overrides.accessControl,
  },
  twilioValidator: {
    validate: vi.fn().mockResolvedValue(true),
    ...overrides.twilioValidator,
  },
  ...(overrides.validateOutput && {
    validateOutput: overrides.validateOutput,
  }),
  ...(overrides.validateInput && {
    validateInput: overrides.validateInput,
  }),
});

const validFormBody =
  'MessageSid=SM123&From=whatsapp%3A%2B1234567890&Body=Hello';

const createRequest = (
  body: string,
  headers: Record<string, string> = {},
): Request =>
  new Request('https://example.com/whatsapp-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Twilio-Signature': 'valid-sig',
      ...headers,
    },
    body,
  });

describe('handler matching flow', () => {
  let deps: HandlerDependencies;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('routing', () => {
    it('routes registered non-admin users to the matching flow', async () => {
      const secondReg = {
        ...sampleRegistration,
        eventId: 'evt-2',
        eventName: 'Winter Retreat',
      };
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration, secondReg]),
        },
      });
      const handler = createHandler(deps);
      const response = await handler(createRequest(validFormBody));

      expect(response.status).toBe(200);
      const systemPromptArg = vi.mocked(deps.llm.chatCompletion).mock
        .calls[0][0][0];
      expect(systemPromptArg.content).toContain('accommodation matches');
    });

    it('rejects unregistered non-admin users', async () => {
      deps = createMockDeps({
        db: { findUserByPhone: vi.fn().mockResolvedValue(null) },
      });
      const handler = createHandler(deps);
      const response = await handler(createRequest(validFormBody));
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(text).toContain('not quite ready yet');
    });

    it('routes admin users to supplier flow even when registered', async () => {
      deps = createMockDeps({
        accessControl: { isAdmin: vi.fn().mockReturnValue(true) },
        db: { findUserByPhone: vi.fn().mockResolvedValue(matchingUser) },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      expect(deps.db.findUserByPhone).not.toHaveBeenCalled();
    });

    it('returns error when user lookup fails', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockRejectedValue(new Error('DB down')),
        },
      });
      const handler = createHandler(deps);
      const response = await handler(createRequest(validFormBody));
      const text = await response.text();

      expect(text).toContain('Sorry, something went wrong');
    });
  });

  describe('matching prompt context', () => {
    it('includes user event registrations in the system prompt', async () => {
      const secondReg = {
        ...sampleRegistration,
        eventId: 'evt-2',
        eventName: 'Winter Retreat',
        isHost: true,
      };
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration, secondReg]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      const systemPromptArg = vi.mocked(deps.llm.chatCompletion).mock
        .calls[0][0][0];
      expect(systemPromptArg.content).toContain('Summer Festival');
      expect(systemPromptArg.content).toContain('Seeker');
      expect(systemPromptArg.content).toContain('Winter Retreat');
      expect(systemPromptArg.content).toContain('Host');
    });

    it('returns no-registrations message when user has no events', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi.fn().mockResolvedValue([]),
        },
      });
      const handler = createHandler(deps);
      const response = await handler(createRequest(validFormBody));
      const text = await response.text();

      expect(text).toContain('not registered for any events');
      expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
    });

    it('uses preferences walkthrough prompt when preferences are not configured', async () => {
      const userNoPrefs = { ...matchingUser, preferencesConfigured: false };
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(userNoPrefs),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration]),
          findMatchingEvents: vi.fn().mockResolvedValue([
            {
              id: 'evt-1',
              name: 'Summer Festival',
              startDate: '2026-06-24',
              endDate: '2026-06-28',
              location: 'Pilton',
            },
          ]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      const systemPromptArg = vi.mocked(deps.llm.chatCompletion).mock
        .calls[0][0][0];
      expect(systemPromptArg.content).toContain('matching preferences');
      expect(systemPromptArg.content).toContain('Language overlap');
    });

    it('skips preferences walkthrough when preferences are already configured', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration]),
          findMatchingEvents: vi.fn().mockResolvedValue([
            {
              id: 'evt-1',
              name: 'Summer Festival',
              startDate: '2026-06-24',
              endDate: '2026-06-28',
              location: 'Pilton',
            },
          ]),
          getEventMatchProfiles: vi.fn().mockResolvedValue([sampleMatch]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      const systemPromptArg = vi.mocked(deps.llm.chatCompletion).mock
        .calls[0][0][0];
      expect(systemPromptArg.content).not.toContain('matching preferences');
      expect(systemPromptArg.content).toContain('Alice');
    });
  });

  describe('match presentation', () => {
    it('includes match profiles when a specific event is detected', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration]),
          findMatchingEvents: vi.fn().mockResolvedValue([
            {
              id: 'evt-1',
              name: 'Summer Festival',
              startDate: '2026-06-24',
              endDate: '2026-06-28',
              location: 'Pilton',
            },
          ]),
          getEventMatchProfiles: vi.fn().mockResolvedValue([sampleMatch]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      expect(deps.db.getEventMatchProfiles).toHaveBeenCalledWith(
        'evt-1',
        'user-123',
      );
      const systemPromptArg = vi.mocked(deps.llm.chatCompletion).mock
        .calls[0][0][0];
      expect(systemPromptArg.content).toContain('85% compatible');
    });

    it('auto-selects event for single-registration user without event detection', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration]),
          findMatchingEvents: vi.fn().mockResolvedValue([]),
          getEventMatchProfiles: vi.fn().mockResolvedValue([sampleMatch]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      expect(deps.db.getEventMatchProfiles).toHaveBeenCalledWith(
        'evt-1',
        'user-123',
      );
    });

    it('shows entry prompt for multi-registration user without event detection', async () => {
      const secondReg = {
        ...sampleRegistration,
        eventId: 'evt-2',
        eventName: 'Winter Retreat',
      };
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration, secondReg]),
          findMatchingEvents: vi.fn().mockResolvedValue([]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      const systemPromptArg = vi.mocked(deps.llm.chatCompletion).mock
        .calls[0][0][0];
      expect(systemPromptArg.content).toContain('Summer Festival');
      expect(systemPromptArg.content).toContain('Winter Retreat');
      expect(deps.db.getEventMatchProfiles).not.toHaveBeenCalled();
    });

    it('only fetches matches for events the user is registered for', async () => {
      const secondReg = {
        ...sampleRegistration,
        eventId: 'evt-2',
        eventName: 'Winter Retreat',
      };
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration, secondReg]),
          findMatchingEvents: vi.fn().mockResolvedValue([
            {
              id: 'evt-OTHER',
              name: 'Unregistered Event',
              startDate: '2026-07-01',
              endDate: '2026-07-05',
              location: 'Elsewhere',
            },
          ]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      expect(deps.db.getEventMatchProfiles).not.toHaveBeenCalled();
      const systemPromptArg = vi.mocked(deps.llm.chatCompletion).mock
        .calls[0][0][0];
      expect(systemPromptArg.content).toContain('accommodation matches');
    });
  });

  describe('error handling', () => {
    it('returns error when fetching user event registrations fails', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockRejectedValue(new Error('DB down')),
        },
      });
      const handler = createHandler(deps);
      const response = await handler(createRequest(validFormBody));
      const text = await response.text();

      expect(text).toContain('Sorry, something went wrong');
      expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
    });

    it('falls back to entry prompt when fetching match profiles fails', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration]),
          findMatchingEvents: vi.fn().mockResolvedValue([
            {
              id: 'evt-1',
              name: 'Summer Festival',
              startDate: '2026-06-24',
              endDate: '2026-06-28',
              location: 'Pilton',
            },
          ]),
          getEventMatchProfiles: vi
            .fn()
            .mockRejectedValue(new Error('DB down')),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      const systemPromptArg = vi.mocked(deps.llm.chatCompletion).mock
        .calls[0][0][0];
      expect(systemPromptArg.content).toContain('accommodation matches');
      expect(systemPromptArg.content).not.toContain('85% compatible');
    });

    it('continues with auto-select when event detection fails for single-registration user', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration]),
          findMatchingEvents: vi.fn().mockRejectedValue(new Error('RPC down')),
          getEventMatchProfiles: vi.fn().mockResolvedValue([sampleMatch]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      expect(deps.db.getEventMatchProfiles).toHaveBeenCalledWith(
        'evt-1',
        'user-123',
      );
    });
  });

  describe('identity verification', () => {
    it('verifies phone maps to registered user before showing events', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      expect(deps.db.findUserByPhone).toHaveBeenCalledWith(
        'whatsapp:+1234567890',
      );
    });

    it('still saves conversation for matching flow messages', async () => {
      deps = createMockDeps({
        db: {
          findUserByPhone: vi.fn().mockResolvedValue(matchingUser),
          getUserEventRegistrations: vi
            .fn()
            .mockResolvedValue([sampleRegistration]),
        },
      });
      const handler = createHandler(deps);
      await handler(createRequest(validFormBody));

      expect(deps.db.saveMessages).toHaveBeenCalledWith(
        'whatsapp:+1234567890',
        expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Hello' }),
        ]),
      );
    });
  });
});
