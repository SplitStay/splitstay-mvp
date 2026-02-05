import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGroqClient } from '../groqClient';

describe('createGroqClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends request to Groq chat completions endpoint with correct model', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Reply' } }],
        }),
      ),
    );

    const client = createGroqClient('test-api-key');
    await client.chatCompletion([{ role: 'user', content: 'Hello' }]);

    const [url, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');

    const body = JSON.parse(options?.body as string);
    expect(body.model).toBe('llama-3.1-8b-instant');
    expect(body.max_tokens).toBe(500);
    expect(body.temperature).toBe(0.7);
  });

  it('includes authorization header with bearer token', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Reply' } }],
        }),
      ),
    );

    const client = createGroqClient('my-secret-key');
    await client.chatCompletion([{ role: 'user', content: 'Hello' }]);

    const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    const headers = options?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer my-secret-key');
  });

  it('returns content from first choice', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Bot response here' } }],
        }),
      ),
    );

    const client = createGroqClient('test-key');
    const result = await client.chatCompletion([
      { role: 'user', content: 'Hello' },
    ]);

    expect(result.content).toBe('Bot response here');
  });

  it('throws when Groq API returns an error status', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('Rate limited', { status: 429 }),
    );

    const client = createGroqClient('test-key');
    await expect(
      client.chatCompletion([{ role: 'user', content: 'Hello' }]),
    ).rejects.toThrow('Groq API error 429');
  });

  it('throws when Groq API returns malformed JSON', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ unexpected: 'shape' })),
    );

    const client = createGroqClient('test-key');
    await expect(
      client.chatCompletion([{ role: 'user', content: 'Hello' }]),
    ).rejects.toThrow();
  });

  it('throws when Groq API returns empty response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ choices: [] })),
    );

    const client = createGroqClient('test-key');
    await expect(
      client.chatCompletion([{ role: 'user', content: 'Hello' }]),
    ).rejects.toThrow('empty response');
  });
});
