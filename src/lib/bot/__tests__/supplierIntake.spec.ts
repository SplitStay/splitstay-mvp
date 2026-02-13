/**
 * Supplier intake feature tests using vitest-cucumber.
 *
 * Binds to features/supplier-intake.feature and implements step definitions
 * for handler-level and unit-level scenarios. Migration scenarios (@migration)
 * are verified by SQL review and skipped here.
 *
 * NOTE: vitest-cucumber wraps each step as its own `it` block, so beforeEach
 * runs between steps. All setup must happen inline within scenario steps.
 */
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { expect, vi } from 'vitest';
import { createHandler } from '../handler';
import { buildSupplierSystemPrompt } from '../supplierPrompt';
import {
  extractJsonBlock,
  hasIncompleteJsonBlock,
  SupplierListingSchema,
  stripJsonBlock,
} from '../supplierSchema';
import type {
  DbClient,
  HandlerDependencies,
  LlmClient,
  MatchedEvent,
  TwilioValidator,
} from '../types';

// ---------------------------------------------------------------------------
// Suppress handler console output during tests (module-level, not per-step)
// ---------------------------------------------------------------------------
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

type MockOverrides = {
  llm?: Partial<LlmClient>;
  db?: Partial<DbClient>;
  accessControl?: Partial<HandlerDependencies['accessControl']>;
  twilioValidator?: Partial<TwilioValidator>;
  validateOutput?: HandlerDependencies['validateOutput'];
  validateInput?: HandlerDependencies['validateInput'];
};

const glastonbury: MatchedEvent = {
  id: 'evt-glast-2026',
  name: 'Glastonbury 2026',
  startDate: '2026-06-24',
  endDate: '2026-06-28',
  location: 'Pilton, Somerset',
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
      .mockResolvedValue({ propertyListingId: 'pl-123' }),
    ...overrides.db,
  },
  accessControl: {
    isAdmin: vi.fn().mockReturnValue(true),
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

const formBody = (message: string, phone = 'whatsapp:+1234567890') =>
  `MessageSid=SM${Date.now()}&From=${encodeURIComponent(phone)}&Body=${encodeURIComponent(message)}`;

const feature = await loadFeature('features/supplier-intake.feature');

describeFeature(feature, ({ Scenario }) => {
  // ==========================================================================
  // User Requirements
  // ==========================================================================

  Scenario(
    'Supplier arriving from outreach email is recognized for the correct event',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      Given('I am an admin user', () => {
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
          },
        });
      });

      And(
        'an event "Glastonbury 2026" exists with dates June 24 to June 28',
        () => {
          // Event configured in Given step
        },
      );

      And(
        'I send a WhatsApp message saying "Hi, I\'d like to list my property for Glastonbury 2026"',
        () => {},
      );

      When('the bot receives my message', async () => {
        const handler = createHandler(deps);
        await handler(
          createRequest(
            formBody("Hi, I'd like to list my property for Glastonbury 2026"),
          ),
        );
      });

      Then(
        'the bot confirms I am listing for Glastonbury 2026, June 24 to June 28',
        () => {
          const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
          const systemPrompt = callArgs[0];
          expect(systemPrompt.role).toBe('system');
          expect(systemPrompt.content).toContain('Glastonbury 2026');
          expect(systemPrompt.content).toContain('2026-06-24');
          expect(systemPrompt.content).toContain('2026-06-28');
        },
      );

      And('begins collecting my property details', () => {
        const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
        expect(callArgs[0].content).toContain('SUPPLIER INTAKE FLOW');
      });
    },
  );

  Scenario(
    'Supplier with a misspelled event name is matched to the correct event',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      Given('I am an admin user', () => {
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
          },
        });
      });

      And('an event "Glastonbury 2026" exists', () => {});

      And('I send a WhatsApp message mentioning "Glastonbery 2026"', () => {});

      When('the bot receives my message', async () => {
        const handler = createHandler(deps);
        await handler(
          createRequest(
            formBody("I'd like to list my property for Glastonbery 2026"),
          ),
        );
      });

      Then('the bot matches me to the Glastonbury 2026 event', () => {
        const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
        expect(callArgs[0].content).toContain('Glastonbury 2026');
      });

      And('begins collecting my property details', () => {
        const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
        expect(callArgs[0].content).toContain('SUPPLIER INTAKE FLOW');
      });
    },
  );

  Scenario(
    'Supplier referencing an unrecognized event is told it was not found',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;
      let response: Response;

      Given('I am an admin user', () => {
        deps = createMockDeps({
          db: { findMatchingEvents: vi.fn().mockResolvedValue([]) },
        });
      });

      And('no event matching "Coachella 2026" exists', () => {});

      And(
        'I send a WhatsApp message saying "I\'d like to list my property for Coachella 2026"',
        () => {},
      );

      When('the bot receives my message', async () => {
        const handler = createHandler(deps);
        response = await handler(
          createRequest(
            formBody("I'd like to list my property for Coachella 2026"),
          ),
        );
      });

      Then('the bot tells me it could not find that event', async () => {
        const text = await response.text();
        expect(text).toContain('find that event');
        expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
      });

      And(
        'asks me to re-state the event name or contact the SplitStay team',
        async () => {
          expect(deps.db.saveMessages).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining([
              expect.objectContaining({
                role: 'assistant',
                content: expect.stringContaining('SplitStay team'),
              }),
            ]),
          );
        },
      );
    },
  );

  Scenario(
    'Supplier referencing an ambiguous event name is asked to clarify',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;
      const leedsFest: MatchedEvent = {
        id: 'evt-leeds-1',
        name: 'Leeds Festival 2026',
        startDate: '2026-08-21',
        endDate: '2026-08-23',
        location: 'Bramham Park',
      };
      const leedsJazz: MatchedEvent = {
        id: 'evt-leeds-2',
        name: 'Leeds Jazz Festival 2026',
        startDate: '2026-07-10',
        endDate: '2026-07-12',
        location: 'Leeds City Centre',
      };

      Given('I am an admin user', () => {
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi
              .fn()
              .mockResolvedValue([leedsFest, leedsJazz]),
          },
        });
      });

      And(
        'events "Leeds Festival 2026" and "Leeds Jazz Festival 2026" both exist',
        () => {},
      );

      And('I send a WhatsApp message mentioning "Leeds Festival"', () => {});

      When('the bot receives my message', async () => {
        const handler = createHandler(deps);
        await handler(
          createRequest(
            formBody("I'd like to list my property for Leeds Festival"),
          ),
        );
      });

      Then('the bot asks me to clarify which event I mean', () => {
        const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
        expect(callArgs[0].content).toContain('Leeds Festival 2026');
        expect(callArgs[0].content).toContain('Leeds Jazz Festival 2026');
        expect(callArgs[0].content).toContain('clarify');
      });
    },
  );

  Scenario(
    'Supplier provides property details one question at a time',
    ({ Given, When, Then, And }) => {
      Given('I am in the supplier intake flow for an event', () => {});

      When('the bot collects my property information', () => {});

      Then(
        'it asks for supplier name, location, accommodation type, number of bedrooms, price per night, room availability, and house rules one at a time',
        () => {
          const prompt = buildSupplierSystemPrompt(glastonbury);
          expect(prompt).toContain('Ask only ONE question at a time');
          expect(prompt).toContain('Collect one at a time');
        },
      );

      And(
        'does not ask the next question until I have answered the current one',
        () => {
          const prompt = buildSupplierSystemPrompt(glastonbury);
          expect(prompt).toContain('ONE question at a time');
        },
      );
    },
  );

  Scenario(
    'Supplier whose rooms are all available for the full event dates skips per-room collection',
    ({ Given, And, When, Then }) => {
      Given('I am in the supplier intake flow', () => {});
      And('I have provided the number of bedrooms', () => {});

      When(
        'the bot asks if all rooms are available for the full event dates',
        () => {},
      );

      And('I confirm they are', () => {});

      Then('the bot skips per-room date collection', () => {
        const prompt = buildSupplierSystemPrompt(glastonbury);
        expect(prompt).toContain(
          'all rooms are available for the full event dates',
        );
        expect(prompt).toContain('skip per-room collection');
      });

      And('moves on to house rules', () => {
        const prompt = buildSupplierSystemPrompt(glastonbury);
        expect(prompt).toMatch(/House rules/i);
      });
    },
  );

  Scenario(
    'Supplier with rooms on different dates provides per-room availability',
    ({ Given, And, When, Then }) => {
      Given(
        'I am in the supplier intake flow for an event running June 24 to June 28',
        () => {},
      );
      And('I have said my rooms have different availability', () => {});
      When("the bot asks for each room's dates", () => {});

      Then(
        'I can specify different check-in and check-out dates for each room within the event window',
        () => {
          const prompt = buildSupplierSystemPrompt(glastonbury);
          expect(prompt).toContain(
            'collect check-in and check-out dates for each room',
          );
        },
      );
    },
  );

  Scenario(
    'Supplier sees a complete summary before confirming',
    ({ Given, When, Then, And }) => {
      Given(
        'I have provided all property details in the supplier intake flow',
        () => {},
      );

      When('the bot has enough information', () => {});

      Then(
        'it shows a summary including event name, event dates, supplier name, property location, accommodation type, number of bedrooms, price per night, per-room availability, and house rules',
        () => {
          const prompt = buildSupplierSystemPrompt(glastonbury);
          expect(prompt).toContain('complete summary');
        },
      );

      And('asks me to reply YES to confirm', () => {
        const prompt = buildSupplierSystemPrompt(glastonbury);
        expect(prompt).toContain('YES to confirm');
      });
    },
  );

  Scenario(
    'Supplier declines confirmation and edits details',
    ({ Given, When, Then, And }) => {
      Given(
        'the bot has shown me a listing summary and asked for confirmation',
        () => {},
      );
      When('I reply with something other than YES', () => {});

      Then('the bot asks what I would like to change', () => {
        const prompt = buildSupplierSystemPrompt(glastonbury);
        expect(prompt).toContain(
          'anything other than YES, ask what they want to change',
        );
      });

      And('lets me update the detail before showing a revised summary', () => {
        const prompt = buildSupplierSystemPrompt(glastonbury);
        expect(prompt).toContain('revised summary');
      });
    },
  );

  Scenario(
    'Supplier corrects a previous answer during intake',
    ({ Given, When, Then, And }) => {
      Given('I am partway through the supplier intake flow', () => {});

      When(
        'I tell the bot I need to change a previously provided detail',
        () => {},
      );

      Then('the bot acknowledges the correction', () => {
        const prompt = buildSupplierSystemPrompt(glastonbury);
        expect(prompt).toContain('CORRECTIONS');
        expect(prompt).toContain('acknowledge the change');
      });

      And('continues collecting the remaining details from where I was', () => {
        const prompt = buildSupplierSystemPrompt(glastonbury);
        expect(prompt).toContain('continue from where they were');
      });
    },
  );

  Scenario(
    'Supplier receives acknowledgment after confirming their listing',
    ({ Given, When, Then, And }) => {
      let deps: HandlerDependencies;
      let response: Response;

      Given('the bot has shown me a listing summary', () => {
        const jsonBlock = `\`\`\`json
{"supplier_name":"Jane Smith","location":"123 Road","accommodation_type_id":"apartment","num_bedrooms":1,"price_per_night":100,"house_rules":"None","rooms":[{"room_number":1,"available_from":"2026-06-24","available_to":"2026-06-28"}]}
\`\`\``;
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
            getConversationHistory: vi.fn().mockResolvedValue([
              { role: 'user', content: 'I want to list for Glastonbury 2026' },
              { role: 'assistant', content: 'Great! What is the location?' },
            ]),
          },
          llm: {
            chatCompletion: vi.fn().mockResolvedValue({
              content: `Your listing has been saved! ${jsonBlock} The SplitStay team will review it shortly.`,
            }),
          },
        });
      });

      When('I reply YES', async () => {
        const handler = createHandler(deps);
        response = await handler(createRequest(formBody('YES')));
      });

      Then('the bot confirms my listing has been saved', async () => {
        const text = await response.text();
        expect(text).toContain('Your listing has been saved');
      });

      And('tells me the SplitStay team will review it shortly', () => {
        expect(deps.db.savePropertyListing).toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'Supplier who already listed for an event is told their listing exists',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      Given('I have already confirmed a listing for Glastonbury 2026', () => {
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
            findPropertyListing: vi.fn().mockResolvedValue(true),
          },
        });
      });

      And(
        'I send a new WhatsApp message referencing Glastonbury 2026',
        () => {},
      );

      When('the bot receives my message', async () => {
        const handler = createHandler(deps);
        await handler(
          createRequest(formBody('I want to list for Glastonbury 2026')),
        );
      });

      Then('the bot tells me I already have a listing for this event', () => {
        const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
        expect(callArgs[0].content).toContain('already has a property listing');
      });

      And(
        'tells me the SplitStay team will reach out if I need changes',
        () => {
          const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
          expect(callArgs[0].content).toContain(
            'SplitStay team will reach out',
          );
        },
      );
    },
  );

  Scenario(
    'Supplier is told the event has passed if they confirm after event dates',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      Given('I have been completing the supplier intake flow', () => {
        const expiredEvent: MatchedEvent = {
          ...glastonbury,
          endDate: '2025-06-28',
        };
        const jsonBlock = `\`\`\`json
{"supplier_name":"Jane","location":"Road","accommodation_type_id":"apartment","num_bedrooms":1,"price_per_night":100,"house_rules":"","rooms":[{"room_number":1,"available_from":"2025-06-24","available_to":"2025-06-28"}]}
\`\`\``;
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([expiredEvent]),
            getConversationHistory: vi.fn().mockResolvedValue([
              { role: 'user', content: 'List for Glastonbury' },
              { role: 'assistant', content: 'Location?' },
            ]),
          },
          llm: {
            chatCompletion: vi.fn().mockResolvedValue({
              content: `Saved! ${jsonBlock}`,
            }),
          },
        });
      });

      And("the event's end date has passed since I started", () => {});

      When('I reply YES to confirm', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('YES')));
      });

      Then('the bot tells me the event dates have passed', () => {
        expect(deps.db.savePropertyListing).not.toHaveBeenCalled();
      });

      And('my listing is not saved', () => {
        expect(deps.db.savePropertyListing).not.toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'Organic user without an event reference sees the standard greeting',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      Given('I am an admin user', () => {
        deps = createMockDeps({
          db: { findMatchingEvents: vi.fn().mockResolvedValue([]) },
        });
      });

      And(
        'I send a WhatsApp message that does not reference any event',
        () => {},
      );

      When('the bot receives my message', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('Hello, what is SplitStay?')));
      });

      Then(
        'I receive the standard greeting explaining seeker and host roles',
        () => {
          const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
          const prompt = callArgs[0].content;
          expect(prompt).toContain('Seeker');
          expect(prompt).toContain('Host');
          expect(prompt).not.toContain('SUPPLIER INTAKE FLOW');
        },
      );
    },
  );

  // ==========================================================================
  // Technical Specifications - Migration scenarios (verified by SQL review)
  // ==========================================================================

  Scenario.skip(
    'Database migration creates event table',
    ({ Given, When, Then, And }) => {
      Given('a new Supabase migration is created', () => {});
      When('the migration runs', () => {});
      Then('it enables the pg_trgm extension', () => {});
      And(
        'creates the event table with columns: id, name, start_date, end_date, location, created_at, updated_at',
        () => {},
      );
      And(
        'adds CHECK constraints for end_date, name length, and location length',
        () => {},
      );
      And('creates a GIN trigram index on event.name', () => {});
    },
  );

  Scenario.skip(
    'Database migration creates supplier table',
    ({ Given, When, Then, And }) => {
      Given('the event table exists', () => {});
      When('the migration creates the supplier table', () => {});
      Then(
        'it has columns: id, phone_number, name, created_at, updated_at',
        () => {},
      );
      And(
        'adds CHECK constraints for name length and phone_number length',
        () => {},
      );
    },
  );

  Scenario.skip(
    'Database migration creates property_listing table',
    ({ Given, When, Then, And }) => {
      Given('the supplier and event tables exist', () => {});
      When('the migration creates the property_listing table', () => {});
      Then(
        'it has columns: id, supplier_id, event_id, location, accommodation_type_id, num_bedrooms, price_per_night, house_rules, status, created_at, updated_at',
        () => {},
      );
      And(
        'adds CHECK constraints and a UNIQUE constraint on supplier_id and event_id',
        () => {},
      );
    },
  );

  Scenario.skip(
    'Database migration creates property_room table',
    ({ Given, When, Then, And }) => {
      Given('the property_listing table exists', () => {});
      When('the migration creates the property_room table', () => {});
      Then(
        'it has columns: id, property_listing_id, room_number, available_from, available_to, created_at, updated_at',
        () => {},
      );
      And('adds CHECK constraint for available_to >= available_from', () => {});
    },
  );

  Scenario.skip(
    'RLS policies restrict event table to admin writes and authenticated reads',
    ({ Given, When, Then }) => {
      Given('the event table exists with RLS enabled', () => {});
      When('an authenticated non-admin user queries the event table', () => {});
      Then('SELECT succeeds and INSERT, UPDATE, DELETE are denied', () => {});
    },
  );

  Scenario.skip(
    'RLS policies restrict supplier tables to service role only',
    ({ Given, When, Then }) => {
      Given(
        'the supplier, property_listing, and property_room tables exist with RLS enabled',
        () => {},
      );
      When('any authenticated user queries these tables directly', () => {});
      Then('all operations are denied', () => {});
    },
  );

  Scenario.skip(
    'save_property_listing function creates records atomically',
    ({ Given, When, Then, And }) => {
      Given('the save_property_listing PL/pgSQL function exists', () => {});
      When(
        'called with a phone number, supplier name, event ID, property data, and rooms JSON',
        () => {},
      );
      Then('it upserts the supplier record by phone number', () => {});
      And('inserts a property_listing with status confirmed', () => {});
      And('inserts property_room records for each room', () => {});
    },
  );

  Scenario.skip(
    'save_property_listing validates room dates against event window',
    ({ Given, When, Then }) => {
      Given('an event with dates June 24 to June 28', () => {});
      When(
        'save_property_listing is called with a room available from June 23 to June 28',
        () => {},
      );
      Then('the function raises an error', () => {});
    },
  );

  Scenario.skip(
    'save_property_listing reuses existing supplier for a different event',
    ({ Given, When, Then }) => {
      Given('a supplier already exists for phone number +1234567890', () => {});
      When(
        'save_property_listing is called with the same phone number for a new event',
        () => {},
      );
      Then('the existing supplier record is reused', () => {});
    },
  );

  // ==========================================================================
  // Technical Specifications - Handler / service level
  // ==========================================================================

  Scenario(
    'Event detection uses word_similarity before the LLM call',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      Given('active events exist in the database', () => {
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
          },
        });
      });

      And('a new conversation starts with a message body', () => {});

      When('the handler runs event detection', async () => {
        const handler = createHandler(deps);
        await handler(
          createRequest(formBody('List my property for Glastonbury')),
        );
      });

      Then(
        'it queries events using word_similarity against the message body',
        () => {
          expect(deps.db.findMatchingEvents).toHaveBeenCalledWith(
            'List my property for Glastonbury',
          );
        },
      );

      And('this check runs before the LLM is called', () => {
        const eventCallOrder = vi.mocked(deps.db.findMatchingEvents).mock
          .invocationCallOrder[0];
        const llmCallOrder = vi.mocked(deps.llm.chatCompletion).mock
          .invocationCallOrder[0];
        expect(eventCallOrder).toBeLessThan(llmCallOrder);
      });
    },
  );

  Scenario(
    'Supplier context is injected into the system prompt when an event matches',
    ({ Given, When, Then, And }) => {
      let deps: HandlerDependencies;

      Given('event detection matched "Glastonbury 2026"', () => {
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
          },
        });
      });

      When('the handler builds the LLM request', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('List for Glastonbury 2026')));
      });

      Then(
        'the system prompt includes the event name, dates, and location',
        () => {
          const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
          const prompt = callArgs[0].content;
          expect(prompt).toContain('Glastonbury 2026');
          expect(prompt).toContain('2026-06-24');
          expect(prompt).toContain('2026-06-28');
          expect(prompt).toContain('Pilton, Somerset');
        },
      );

      And('instructs the LLM to follow the supplier intake flow', () => {
        const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
        expect(callArgs[0].content).toContain('SUPPLIER INTAKE FLOW');
        expect(callArgs[0].content).toContain('DATA VALIDATION');
      });

      And('does not ask the user for their role', () => {
        const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
        expect(callArgs[0].content).not.toContain('which role applies');
      });
    },
  );

  Scenario(
    'Event detection only runs on first message in a conversation',
    ({ Given, When, Then, And }) => {
      let deps: HandlerDependencies;

      Given('a supplier has an existing conversation history', () => {
        deps = createMockDeps({
          db: {
            getConversationHistory: vi.fn().mockResolvedValue([
              { role: 'user', content: 'List for Glastonbury' },
              { role: 'assistant', content: 'Sure! What is the location?' },
            ]),
            findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
          },
        });
      });

      When('the supplier sends a follow-up message', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('123 Festival Road, Pilton')));
      });

      Then(
        'the handler recovers event context from the first user message',
        () => {
          expect(deps.db.findMatchingEvents).toHaveBeenCalledWith(
            'List for Glastonbury',
          );
        },
      );

      And('the LLM continues the intake flow from conversation history', () => {
        expect(deps.llm.chatCompletion).toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'After disambiguation the handler applies the supplier prompt for the clarified event',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      const leedsFestival: MatchedEvent = {
        id: 'event-leeds',
        name: 'Leeds Festival 2026',
        startDate: '2026-08-28',
        endDate: '2026-08-30',
        location: 'Bramham Park, Leeds',
      };

      const leedsJazz: MatchedEvent = {
        id: 'event-jazz',
        name: 'Leeds Jazz Festival 2026',
        startDate: '2026-07-10',
        endDate: '2026-07-13',
        location: 'Leeds City Centre',
      };

      Given('a supplier sent a message that matched multiple events', () => {
        const findMatchingEvents = vi
          .fn()
          // First call with first user message: ambiguous match
          .mockResolvedValueOnce([leedsFestival, leedsJazz])
          // Second call with current message: single match
          .mockResolvedValueOnce([leedsFestival]);

        deps = createMockDeps({
          db: {
            findMatchingEvents,
            getConversationHistory: vi.fn().mockResolvedValue([
              { role: 'user', content: 'I want to list for Leeds Festival' },
              {
                role: 'assistant',
                content: 'Which Leeds event do you mean?',
              },
            ]),
          },
        });
      });

      And(
        'the supplier has conversation history from disambiguation',
        () => {},
      );

      When(
        'the supplier sends a follow-up message matching a single event',
        async () => {
          const handler = createHandler(deps);
          await handler(
            createRequest(formBody('Leeds Festival 2026 at Bramham Park')),
          );
        },
      );

      Then(
        'the handler applies the supplier system prompt for that event',
        () => {
          const systemPrompt = (
            deps.llm.chatCompletion as ReturnType<typeof vi.fn>
          ).mock.calls[0][0][0].content as string;
          expect(systemPrompt).toContain('Leeds Festival 2026');
          expect(systemPrompt).toContain('SUPPLIER INTAKE FLOW');
        },
      );

      And('begins collecting property details', () => {
        expect(deps.llm.chatCompletion).toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'Handler checks for existing listing before starting supplier intake',
    ({ Given, When, And, Then }) => {
      let deps: HandlerDependencies;

      Given('event detection matched an event for a phone number', () => {
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
            findPropertyListing: vi.fn().mockResolvedValue(true),
          },
        });
      });

      When(
        'the handler queries property_listing for this supplier and event',
        async () => {
          const handler = createHandler(deps);
          await handler(createRequest(formBody('List for Glastonbury')));
        },
      );

      And('an existing listing is found', () => {});

      Then('the handler injects this context into the system prompt', () => {
        const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];
        expect(callArgs[0].content).toContain('already has a property listing');
      });
    },
  );

  Scenario(
    'Handler validates event has not expired before saving listing',
    ({ Given, When, Then, And }) => {
      let deps: HandlerDependencies;

      Given('a supplier confirms with YES', () => {
        const expiredEvent: MatchedEvent = {
          ...glastonbury,
          endDate: '2025-01-01',
        };
        const jsonBlock = `\`\`\`json
{"supplier_name":"Jane","location":"Road","accommodation_type_id":"apt","num_bedrooms":1,"price_per_night":100,"house_rules":"","rooms":[{"room_number":1,"available_from":"2025-01-01","available_to":"2025-01-01"}]}
\`\`\``;
        deps = createMockDeps({
          db: {
            findMatchingEvents: vi.fn().mockResolvedValue([expiredEvent]),
            getConversationHistory: vi.fn().mockResolvedValue([
              { role: 'user', content: 'List property' },
              { role: 'assistant', content: 'Details?' },
            ]),
          },
          llm: {
            chatCompletion: vi
              .fn()
              .mockResolvedValue({ content: `Done! ${jsonBlock}` }),
          },
        });
      });

      When('the handler prepares to call save_property_listing', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('YES')));
      });

      Then(
        'it checks that the event end_date is at or after the current date',
        () => {},
      );

      And('rejects the save if the event has expired', () => {
        expect(deps.db.savePropertyListing).not.toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'LLM produces structured JSON on supplier confirmation',
    ({ Given, And, When, Then }) => {
      const jsonPayload = {
        supplier_name: 'Jane Smith',
        location: '123 Road',
        accommodation_type_id: 'apartment',
        num_bedrooms: 1,
        price_per_night: 100,
        house_rules: 'No pets',
        rooms: [
          {
            room_number: 1,
            available_from: '2026-06-24',
            available_to: '2026-06-28',
          },
        ],
      };
      const jsonBlock = `\`\`\`json\n${JSON.stringify(jsonPayload)}\n\`\`\``;
      const fullResponse = `Your listing has been saved! ${jsonBlock} We will review it shortly.`;

      Given(
        'the system prompt instructs the LLM to include a JSON block on confirmation',
        () => {},
      );

      And('the supplier has replied YES', () => {});

      When('the LLM generates its response', () => {});

      Then('the response contains a fenced JSON block', () => {
        const result = extractJsonBlock(fullResponse);
        expect(result.found).toBe(true);
      });

      And(
        'the handler extracts and strips the JSON block before sending the text response',
        () => {
          const stripped = stripJsonBlock(fullResponse);
          expect(stripped).not.toContain('```json');
          expect(stripped).toContain('Your listing has been saved!');
        },
      );
    },
  );

  Scenario(
    'Structured output is validated with a Zod schema',
    ({ Given, When, Then, And }) => {
      const validPayload = {
        supplier_name: 'Jane Smith',
        location: '123 Festival Road',
        accommodation_type_id: 'apartment',
        num_bedrooms: 2,
        price_per_night: 150,
        house_rules: 'No smoking',
        rooms: [
          {
            room_number: 1,
            available_from: '2026-06-24',
            available_to: '2026-06-28',
          },
          {
            room_number: 2,
            available_from: '2026-06-24',
            available_to: '2026-06-28',
          },
        ],
      };

      Given(
        'the handler has extracted a JSON block from the LLM response',
        () => {},
      );

      When('it parses the JSON with the SupplierListingSchema', () => {
        expect(() => SupplierListingSchema.parse(validPayload)).not.toThrow();
      });

      Then('valid data is passed to save_property_listing', () => {
        const result = SupplierListingSchema.parse(validPayload);
        expect(result.supplier_name).toBe('Jane Smith');
        expect(result.rooms).toHaveLength(2);
      });

      And('rooms.length must equal num_bedrooms', () => {
        const mismatched = { ...validPayload, num_bedrooms: 3 };
        expect(() => SupplierListingSchema.parse(mismatched)).toThrow();
      });

      And('num_bedrooms must not exceed 20', () => {
        const tooMany = {
          ...validPayload,
          num_bedrooms: 21,
          rooms: Array.from({ length: 21 }, (_, i) => ({
            room_number: i + 1,
            available_from: '2026-06-24',
            available_to: '2026-06-28',
          })),
        };
        expect(() => SupplierListingSchema.parse(tooMany)).toThrow();
      });
    },
  );

  Scenario(
    'LLM system prompt includes a concrete JSON example for reliable extraction',
    ({ Given, When, Then }) => {
      Given(
        'the system prompt is being built for a supplier intake flow',
        () => {},
      );

      When('the prompt includes the JSON extraction instruction', () => {});

      Then(
        'it provides a complete example JSON object with realistic values',
        () => {
          const prompt = buildSupplierSystemPrompt(glastonbury);
          expect(prompt).toContain('```json');
          expect(prompt).toContain('supplier_name');
          expect(prompt).toContain('rooms');
          expect(prompt).toContain('Jane Smith');
        },
      );
    },
  );

  Scenario(
    'Handler retries LLM call when structured output fails validation',
    ({ Given, When, Then, And }) => {
      let deps: HandlerDependencies;
      const invalidJson = '```json\n{"bad": "data"}\n```';
      const validJson = `\`\`\`json
{"supplier_name":"Jane","location":"Road","accommodation_type_id":"apt","num_bedrooms":1,"price_per_night":100,"house_rules":"","rooms":[{"room_number":1,"available_from":"2026-06-24","available_to":"2026-06-28"}]}
\`\`\``;

      Given(
        'the LLM response contains a JSON block that fails Zod validation',
        () => {
          deps = createMockDeps({
            db: {
              findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
              getConversationHistory: vi.fn().mockResolvedValue([
                { role: 'user', content: 'List property for Glastonbury 2026' },
                { role: 'assistant', content: 'Details?' },
              ]),
            },
            llm: {
              chatCompletion: vi
                .fn()
                .mockResolvedValueOnce({ content: `Done ${invalidJson}` })
                .mockResolvedValueOnce({
                  content: `Done ${validJson}`,
                }),
            },
          });
        },
      );

      When('the handler catches the validation error', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('YES')));
      });

      Then('it retries the LLM call up to 2 additional times', () => {
        expect(deps.llm.chatCompletion).toHaveBeenCalledTimes(2);
      });

      And('a successful retry proceeds normally', () => {
        expect(deps.db.savePropertyListing).toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'Handler detects confirmation response without JSON block and retries',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      const validJson = `\`\`\`json
{"supplier_name":"Jane Smith","location":"123 Festival Road","accommodation_type_id":"house","num_bedrooms":2,"price_per_night":150,"house_rules":"No smoking","rooms":[{"room_number":1,"available_from":"2026-06-24","available_to":"2026-06-28"},{"room_number":2,"available_from":"2026-06-24","available_to":"2026-06-28"}]}
\`\`\``;

      Given(
        'the LLM responds with a confirmation message but no JSON block',
        () => {
          const chatCompletion = vi
            .fn()
            // First call: confirmation without JSON
            .mockResolvedValueOnce({
              content:
                'Your listing has been saved! The SplitStay team will review it shortly.',
            })
            // Retry: valid JSON block
            .mockResolvedValueOnce({
              content: `Great, your listing is confirmed! ${validJson}`,
            });

          deps = createMockDeps({
            db: {
              findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
              getConversationHistory: vi.fn().mockResolvedValue([
                {
                  role: 'user',
                  content: 'List property for Glastonbury 2026',
                },
                { role: 'assistant', content: 'Details?' },
              ]),
            },
            llm: { chatCompletion },
          });
        },
      );

      And(
        'the handler is in a supplier context with a matched event',
        () => {},
      );

      When('the handler checks for structured data', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('YES')));
      });

      Then('it detects the missing JSON block', () => {
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('without JSON block'),
        );
      });

      And('retries the LLM call to obtain structured data', () => {
        expect(deps.llm.chatCompletion).toHaveBeenCalledTimes(2);
        expect(deps.db.savePropertyListing).toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'Handler detects truncated JSON block and retries',
    ({ Given, And, When, Then }) => {
      let deps: HandlerDependencies;

      const validJson = `\`\`\`json
{"supplier_name":"Jane Smith","location":"123 Festival Road","accommodation_type_id":"house","num_bedrooms":2,"price_per_night":150,"house_rules":"No smoking","rooms":[{"room_number":1,"available_from":"2026-06-24","available_to":"2026-06-28"},{"room_number":2,"available_from":"2026-06-24","available_to":"2026-06-28"}]}
\`\`\``;

      Given(
        'the LLM responds with a truncated JSON block missing its closing marker',
        () => {
          const chatCompletion = vi
            .fn()
            // First call: truncated JSON (no closing ```)
            .mockResolvedValueOnce({
              content:
                '```json\n{"supplier_name":"Jane","location":"Road","num_bedrooms":100,"rooms":[{"room_number":1',
            })
            // Retry: valid JSON block
            .mockResolvedValueOnce({
              content: `Your listing is confirmed! ${validJson}`,
            });

          deps = createMockDeps({
            db: {
              findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
              getConversationHistory: vi.fn().mockResolvedValue([
                {
                  role: 'user',
                  content: 'List property for Glastonbury 2026',
                },
                { role: 'assistant', content: 'Details?' },
              ]),
            },
            llm: { chatCompletion },
          });
        },
      );

      And(
        'the handler is in a supplier context with a matched event',
        () => {},
      );

      When('the handler checks for structured data', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('YES')));
      });

      Then('it detects the incomplete JSON block', () => {
        expect(hasIncompleteJsonBlock('```json\n{"truncated":')).toBe(true);
        expect(hasIncompleteJsonBlock('```json\n{"data":1}\n```')).toBe(false);
        expect(hasIncompleteJsonBlock('no json here')).toBe(false);
      });

      And('retries the LLM call to obtain structured data', () => {
        expect(deps.llm.chatCompletion).toHaveBeenCalledTimes(2);
        expect(deps.db.savePropertyListing).toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'Empty or whitespace-only messages are rejected before reaching the LLM',
    ({ Given, When, Then, And }) => {
      let deps: HandlerDependencies;
      let response: Response;

      Given('a user sends a message containing only whitespace', () => {
        deps = createMockDeps({});
      });

      When('the input validator checks the message', async () => {
        const handler = createHandler(deps);
        response = await handler(createRequest(formBody('   ')));
      });

      Then('it flags the message as empty', async () => {
        const text = await response.text();
        expect(text).toContain('accommodation and travel');
      });

      And('the LLM is not called', () => {
        expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
      });
    },
  );

  Scenario(
    'Output containing system prompt markers is blocked',
    ({ Given, When, Then, And }) => {
      let deps: HandlerDependencies;
      let responseText: string;

      Given('the LLM response contains system prompt section headers', () => {
        deps = createMockDeps({
          llm: {
            chatCompletion: vi.fn().mockResolvedValue({
              content:
                'Here is the flow:\n\nSUPPLIER INTAKE FLOW:\n1. Location\n2. Type',
            }),
          },
        });
      });

      When('the output validator checks the response', async () => {
        const handler = createHandler(deps);
        const response = await handler(createRequest(formBody('hello')));
        responseText = await response.text();
      });

      Then('it flags the response as system_prompt_disclosure', () => {
        expect(responseText).not.toContain('SUPPLIER INTAKE FLOW');
      });

      And('the user receives the canned redirect message', () => {
        expect(responseText).toContain('accommodation and travel');
      });
    },
  );

  Scenario(
    'All retries exhausted flags the conversation for manual review',
    ({ Given, When, Then, And }) => {
      let deps: HandlerDependencies;
      const invalidJson = '```json\n{"bad": "data"}\n```';

      Given(
        'the LLM has failed to produce valid structured output 3 times',
        () => {
          deps = createMockDeps({
            db: {
              findMatchingEvents: vi.fn().mockResolvedValue([glastonbury]),
              getConversationHistory: vi.fn().mockResolvedValue([
                { role: 'user', content: 'List property for Glastonbury 2026' },
                { role: 'assistant', content: 'Details?' },
              ]),
            },
            llm: {
              chatCompletion: vi
                .fn()
                .mockResolvedValue({ content: `Done ${invalidJson}` }),
            },
          });
        },
      );

      When('the handler exhausts all retries', async () => {
        const handler = createHandler(deps);
        await handler(createRequest(formBody('YES')));
      });

      Then(
        'it saves a record to whatsapp_flagged_content with flag_reason extraction_failed',
        () => {
          expect(deps.db.saveFlaggedContent).toHaveBeenCalledWith(
            'whatsapp:+1234567890',
            expect.any(String),
            'extraction_failed',
          );
        },
      );

      And(
        'sends the supplier a message that their listing was received',
        () => {
          expect(deps.db.savePropertyListing).not.toHaveBeenCalled();
        },
      );
    },
  );
});
