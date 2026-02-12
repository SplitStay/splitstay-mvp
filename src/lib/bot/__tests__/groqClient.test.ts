import { describe, expect, it, vi } from 'vitest';
import { createGroqClient } from '../groqClient';

const createMockFetch = (response: Response) =>
  vi.fn<typeof fetch>().mockResolvedValue(response);

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe('createGroqClient', () => {
  it('sends request to Groq chat completions endpoint with correct model', async () => {
    const mockFetch = createMockFetch(
      jsonResponse({ choices: [{ message: { content: 'Reply' } }] }),
    );
    const client = createGroqClient('test-api-key', mockFetch);
    await client.chatCompletion([{ role: 'user', content: 'Hello' }]);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');

    const body = JSON.parse(options?.body as string);
    expect(body.model).toBe('llama-3.1-8b-instant');
    expect(body.max_tokens).toBe(500);
    expect(body.temperature).toBe(0.7);
  });

  it('includes authorization header with bearer token', async () => {
    const mockFetch = createMockFetch(
      jsonResponse({ choices: [{ message: { content: 'Reply' } }] }),
    );
    const client = createGroqClient('my-secret-key', mockFetch);
    await client.chatCompletion([{ role: 'user', content: 'Hello' }]);

    const [, options] = mockFetch.mock.calls[0];
    const headers = options?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer my-secret-key');
  });

  it('returns content from first choice', async () => {
    const mockFetch = createMockFetch(
      jsonResponse({
        choices: [{ message: { content: 'Bot response here' } }],
      }),
    );
    const client = createGroqClient('test-key', mockFetch);
    const result = await client.chatCompletion([
      { role: 'user', content: 'Hello' },
    ]);

    expect(result.content).toBe('Bot response here');
  });

  it('throws when Groq API returns an error status', async () => {
    const mockFetch = createMockFetch(
      new Response('Rate limited', { status: 429 }),
    );
    const client = createGroqClient('test-key', mockFetch);

    await expect(
      client.chatCompletion([{ role: 'user', content: 'Hello' }]),
    ).rejects.toThrow('Groq API error 429');
  });

  it('throws when Groq API returns malformed JSON', async () => {
    const mockFetch = createMockFetch(jsonResponse({ unexpected: 'shape' }));
    const client = createGroqClient('test-key', mockFetch);

    await expect(
      client.chatCompletion([{ role: 'user', content: 'Hello' }]),
    ).rejects.toThrow();
  });

  it('throws when Groq API returns empty response', async () => {
    const mockFetch = createMockFetch(jsonResponse({ choices: [] }));
    const client = createGroqClient('test-key', mockFetch);

    await expect(
      client.chatCompletion([{ role: 'user', content: 'Hello' }]),
    ).rejects.toThrow('empty response');
  });
});
