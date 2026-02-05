import { describe, expect, it } from 'vitest';
import { createLog } from '../logger';

describe('createLog', () => {
  it('truncates phone to last 4 digits', () => {
    const log = createLog('+1234567890', 'validation', 'test');

    expect(log.phone).toBe('****7890');
  });

  it('includes timestamp in ISO format', () => {
    const log = createLog('+1234567890', 'validation', 'test');

    expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('includes stage and message', () => {
    const log = createLog('+1234567890', 'rate-limit', 'check passed');

    expect(log.stage).toBe('rate-limit');
    expect(log.message).toBe('check passed');
  });

  it('includes error field when provided', () => {
    const log = createLog('+1234567890', 'llm', 'failed', 'timeout');

    expect(log.error).toBe('timeout');
  });

  it('omits error field when not provided', () => {
    const log = createLog('+1234567890', 'response', 'sent');

    expect(log).not.toHaveProperty('error');
  });

  it('handles short phone numbers gracefully', () => {
    const log = createLog('+12', 'validation', 'test');

    expect(log.phone).toBe('****');
  });
});
