import { z } from 'zod';
import type { ConversationMessage } from './schemas';
import type { LlmClient } from './types';

const GROQ_TIMEOUT_MS = 30_000;

const GroqChatResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({ content: z.string() }),
    }),
  ),
});

const DEFAULT_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

export const createGroqClient = (
  apiKey: string,
  fetchFn: typeof fetch = globalThis.fetch,
  baseUrl = DEFAULT_BASE_URL,
  model = DEFAULT_MODEL,
): LlmClient => ({
  chatCompletion: async (
    messages: ConversationMessage[],
  ): Promise<{ content: string }> => {
    const response = await fetchFn(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
    });

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch {
        errorText = '(unable to read error body)';
      }
      throw new Error(`Groq API error ${response.status}: ${errorText}`);
    }

    const data = GroqChatResponseSchema.parse(await response.json());
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq API returned empty response');
    }

    return { content };
  },
});
