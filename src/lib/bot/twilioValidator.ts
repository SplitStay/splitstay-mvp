import type { TwilioValidator } from './types';

const sortedEntries = (params: Record<string, string>): string =>
  Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], '');

const hmacSha1 = async (key: string, data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(data),
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
};

// Constant-time comparison prevents timing attacks on HMAC validation.
// The early return on mismatched lengths is acceptable because base64-encoded
// HMAC-SHA1 signatures are always the same length (28 characters).
const timingSafeEqual = (a: string, b: string): boolean => {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) return false;
  let result = 0;
  for (let i = 0; i < aBytes.byteLength; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
};

export const createTwilioValidator = (
  authToken: string,
  skipValidation = false,
): TwilioValidator => ({
  validate: async (
    signature: string,
    url: string,
    params: Record<string, string>,
  ): Promise<boolean> => {
    if (skipValidation) return true;
    const dataToSign = url + sortedEntries(params);
    const expected = await hmacSha1(authToken, dataToSign);
    return timingSafeEqual(signature, expected);
  },
});
