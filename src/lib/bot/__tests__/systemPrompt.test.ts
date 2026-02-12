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
    expect(SYSTEM_PROMPT).toMatch(/reply YES to confirm/i);
  });

  it('instructs bot to acknowledge confirmation and set expectations for follow-up', () => {
    expect(SYSTEM_PROMPT).toMatch(/saved/i);
    expect(SYSTEM_PROMPT).toMatch(/team will be in touch/i);
  });

  it('anchors the bot identity as ONLY the SplitStay assistant', () => {
    expect(SYSTEM_PROMPT).toMatch(/you are (?:only )?the splitstay assistant/i);
    expect(SYSTEM_PROMPT).toMatch(/do not adopt|never adopt|do not change/i);
  });

  it('limits topic to accommodation and travel', () => {
    expect(SYSTEM_PROMPT).toMatch(/accommodation/i);
    expect(SYSTEM_PROMPT).toMatch(/travel/i);
    expect(SYSTEM_PROMPT).toMatch(
      /only help with|only assist with|limited to/i,
    );
  });

  it('instructs the model to ignore role-change attempts', () => {
    expect(SYSTEM_PROMPT).toMatch(
      /ignore.*role.change|ignore.*identity.change|ignore.*pretend|disregard.*instruction/i,
    );
  });

  it('declines legal, medical, financial, and emergency advice', () => {
    expect(SYSTEM_PROMPT).toMatch(/legal/i);
    expect(SYSTEM_PROMPT).toMatch(/medical/i);
    expect(SYSTEM_PROMPT).toMatch(/financial/i);
    expect(SYSTEM_PROMPT).toMatch(/emergency/i);
  });

  it('provides an example of a valid request when declining off-topic questions', () => {
    expect(SYSTEM_PROMPT).toMatch(/I need a room in/i);
  });
});
