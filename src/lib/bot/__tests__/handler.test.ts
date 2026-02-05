import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHandler } from '../handler';
import type {
  AccessControl,
  DbClient,
  HandlerDependencies,
  LlmClient,
  TwilioValidator,
} from '../types';

const createMockDeps = (
  overrides: Partial<HandlerDependencies> = {},
): HandlerDependencies => {
  const llm: LlmClient = {
    chatCompletion: vi.fn().mockResolvedValue({ content: 'Bot reply' }),
  };

  const db: DbClient = {
    checkSeenSid: vi.fn().mockResolvedValue(false),
    markSidSeen: vi.fn().mockResolvedValue(undefined),
    checkRateLimit: vi
      .fn()
      .mockResolvedValue({ allowed: true, retryAfterMinutes: 0 }),
    getConversationHistory: vi.fn().mockResolvedValue([]),
    saveMessages: vi.fn().mockResolvedValue(undefined),
  };

  const accessControl: AccessControl = {
    isAdmin: vi.fn().mockReturnValue(true),
  };

  const twilioValidator: TwilioValidator = {
    validate: vi.fn().mockResolvedValue(true),
  };

  return { llm, db, accessControl, twilioValidator, ...overrides };
};

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

describe('createHandler', () => {
  let deps: HandlerDependencies;

  beforeEach(() => {
    deps = createMockDeps();
  });

  it('returns HTTP 200 with TwiML content type for valid messages', async () => {
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/xml');
  });

  it('returns TwiML containing the LLM response', async () => {
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(text).toContain('<Message>Bot reply</Message>');
  });

  it('rejects invalid Twilio signature with HTTP 403', async () => {
    deps = createMockDeps({
      twilioValidator: { validate: vi.fn().mockResolvedValue(false) },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));

    expect(response.status).toBe(403);
    expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
  });

  it('returns friendly rejection for non-admin users', async () => {
    deps = createMockDeps({
      accessControl: { isAdmin: vi.fn().mockReturnValue(false) },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('not quite ready yet - check back in a few days');
    expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
  });

  it('rejects duplicate MessageSid with already-received TwiML', async () => {
    deps = createMockDeps({
      db: {
        ...createMockDeps().db,
        checkSeenSid: vi.fn().mockResolvedValue(true),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('already received');
    expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
  });

  it('rejects rate-limited users with wait time message', async () => {
    deps = createMockDeps({
      db: {
        ...createMockDeps().db,
        checkRateLimit: vi
          .fn()
          .mockResolvedValue({ allowed: false, retryAfterMinutes: 42 }),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('42');
    expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
  });

  it('asks user to type instead when media is attached', async () => {
    const mediaBody =
      'MessageSid=SM123&From=whatsapp%3A%2B1234567890&Body=&NumMedia=1';
    const handler = createHandler(deps);
    const response = await handler(createRequest(mediaBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('type your response');
    expect(deps.llm.chatCompletion).not.toHaveBeenCalled();
  });

  it('returns graceful error TwiML when LLM fails', async () => {
    deps = createMockDeps({
      llm: {
        chatCompletion: vi.fn().mockRejectedValue(new Error('Groq timeout')),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('having trouble thinking right now');
  });

  it('does not save conversation when LLM fails', async () => {
    deps = createMockDeps({
      llm: {
        chatCompletion: vi.fn().mockRejectedValue(new Error('Groq timeout')),
      },
    });
    const handler = createHandler(deps);
    await handler(createRequest(validFormBody));

    expect(deps.db.saveMessages).not.toHaveBeenCalled();
  });

  it('saves both user and assistant messages on success', async () => {
    const handler = createHandler(deps);
    await handler(createRequest(validFormBody));

    expect(deps.db.saveMessages).toHaveBeenCalledWith('whatsapp:+1234567890', [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Bot reply' },
    ]);
  });

  it('still returns LLM response when conversation save fails', async () => {
    deps = createMockDeps({
      db: {
        ...createMockDeps().db,
        saveMessages: vi.fn().mockRejectedValue(new Error('DB down')),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('Bot reply');
  });

  it('allows message through when rate limit check fails', async () => {
    deps = createMockDeps({
      db: {
        ...createMockDeps().db,
        checkRateLimit: vi.fn().mockRejectedValue(new Error('DB down')),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('Bot reply');
  });

  it('fetches last 50 messages for conversation context', async () => {
    const handler = createHandler(deps);
    await handler(createRequest(validFormBody));

    expect(deps.db.getConversationHistory).toHaveBeenCalledWith(
      'whatsapp:+1234567890',
      50,
    );
  });

  it('prepends system prompt and appends user message to LLM context', async () => {
    deps = createMockDeps({
      db: {
        ...createMockDeps().db,
        getConversationHistory: vi.fn().mockResolvedValue([
          { role: 'user', content: 'Previous message' },
          { role: 'assistant', content: 'Previous reply' },
        ]),
      },
    });
    const handler = createHandler(deps);
    await handler(createRequest(validFormBody));

    const callArgs = vi.mocked(deps.llm.chatCompletion).mock.calls[0][0];

    expect(callArgs[0]).toEqual({
      role: 'system',
      content: expect.stringContaining('SplitStay'),
    });
    expect(callArgs[1]).toEqual({
      role: 'user',
      content: 'Previous message',
    });
    expect(callArgs[2]).toEqual({
      role: 'assistant',
      content: 'Previous reply',
    });
    expect(callArgs[3]).toEqual({ role: 'user', content: 'Hello' });
  });

  it('marks MessageSid as seen after successful processing', async () => {
    const handler = createHandler(deps);
    await handler(createRequest(validFormBody));

    expect(deps.db.markSidSeen).toHaveBeenCalledWith('SM123');
  });

  it('returns TwiML apology for unexpected errors', async () => {
    deps = createMockDeps({
      twilioValidator: {
        validate: vi.fn().mockRejectedValue(new Error('Unexpected')),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('Sorry, something went wrong');
  });

  it('allows message through when dedup check fails', async () => {
    deps = createMockDeps({
      db: {
        ...createMockDeps().db,
        checkSeenSid: vi.fn().mockRejectedValue(new Error('DB down')),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('Bot reply');
  });

  it('allows message through when conversation history fetch fails', async () => {
    deps = createMockDeps({
      db: {
        ...createMockDeps().db,
        getConversationHistory: vi.fn().mockRejectedValue(new Error('DB down')),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('Bot reply');
  });

  it('still returns LLM response when marking SID as seen fails', async () => {
    deps = createMockDeps({
      db: {
        ...createMockDeps().db,
        markSidSeen: vi.fn().mockRejectedValue(new Error('DB down')),
      },
    });
    const handler = createHandler(deps);
    const response = await handler(createRequest(validFormBody));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('Bot reply');
  });

  it('rejects requests missing Content-Type header with HTTP 400', async () => {
    const handler = createHandler(deps);
    const request = new Request('https://example.com/whatsapp-webhook', {
      method: 'POST',
      headers: { 'X-Twilio-Signature': 'valid-sig' },
      body: validFormBody,
    });
    const response = await handler(request);

    expect(response.status).toBe(400);
  });

  it('logs invalid Content-Type before rejecting', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = createHandler(deps);
    const request = new Request('https://example.com/whatsapp-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Twilio-Signature': 'valid-sig',
      },
      body: validFormBody,
    });
    const response = await handler(request);

    expect(response.status).toBe(400);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid Content-Type'),
    );
    errorSpy.mockRestore();
  });

  it('returns HTTP 400 when webhook payload is missing required fields', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = createHandler(deps);
    const response = await handler(createRequest('Body=Hello'));
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(text).toBe('Bad Request');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid webhook payload'),
    );
    errorSpy.mockRestore();
  });
});
