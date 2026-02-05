import { describe, expect, it } from 'vitest';
import { SYSTEM_PROMPT } from '../systemPrompt';

describe('SYSTEM_PROMPT', () => {
  it('defines seeker and host roles', () => {
    expect(SYSTEM_PROMPT).toContain('Seeker');
    expect(SYSTEM_PROMPT).toContain('Host');
  });

  it('instructs the bot to ask one question at a time', () => {
    expect(SYSTEM_PROMPT).toMatch(/one question at a time/i);
  });

  it('instructs the bot to keep responses short', () => {
    expect(SYSTEM_PROMPT).toMatch(/under 100 words/i);
  });

  it('instructs the bot to avoid emojis', () => {
    expect(SYSTEM_PROMPT).toMatch(/never use emojis/i);
  });

  it('instructs to check conversation history for incomplete flows', () => {
    expect(SYSTEM_PROMPT).toMatch(/incomplete flows/i);
  });

  it('instructs to show summary before confirming preferences', () => {
    expect(SYSTEM_PROMPT).toMatch(/summary/i);
  });

  it('requires explicit YES confirmation', () => {
    expect(SYSTEM_PROMPT).toContain('YES');
  });

  it('instructs bot to acknowledge confirmation and set expectations for follow-up', () => {
    expect(SYSTEM_PROMPT).toMatch(/confirm/i);
    expect(SYSTEM_PROMPT).toMatch(/saved/i);
    expect(SYSTEM_PROMPT).toMatch(/team will be in touch/i);
  });
});
