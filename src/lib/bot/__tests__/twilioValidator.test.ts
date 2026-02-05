import { describe, expect, it } from 'vitest';
import { createTwilioValidator } from '../twilioValidator';

describe('createTwilioValidator', () => {
  const authToken = 'test-auth-token';

  it('returns true for a valid signature', async () => {
    const validator = createTwilioValidator(authToken);

    // First, generate a valid signature
    const url = 'https://example.com/webhook';
    const params = { Body: 'Hello', From: '+1234567890' };

    // Build data to sign: URL + sorted key-value pairs
    const dataToSign = `${url}Body${params.Body}From${params.From}`;
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(authToken),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(dataToSign),
    );
    const validSignature = btoa(String.fromCharCode(...new Uint8Array(sig)));

    const result = await validator.validate(validSignature, url, params);
    expect(result).toBe(true);
  });

  it('returns false for an invalid signature', async () => {
    const validator = createTwilioValidator(authToken);

    const result = await validator.validate(
      'bad-signature',
      'https://example.com/webhook',
      { Body: 'Hello' },
    );
    expect(result).toBe(false);
  });
});
