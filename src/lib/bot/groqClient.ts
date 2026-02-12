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

export const createGroqClient = (
  apiKey: string,
  fetchFn: typeof fetch = globalThis.fetch,
): LlmClient => ({
  chatCompletion: async (
    messages: ConversationMessage[],
  ): Promise<{ content: string }> => {
    const response = await fetchFn(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
      },
    );

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
