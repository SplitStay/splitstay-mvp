import { describe, expect, it } from 'vitest';
import { createFakeApi } from '../createFakeApi';

describe('Fake API exports accommodation types', () => {
  it('should include ACCOMMODATION_TYPES in the returned object', () => {
    const fake = createFakeApi();

    expect(fake.ACCOMMODATION_TYPES).toBeDefined();
    expect(Array.isArray(fake.ACCOMMODATION_TYPES)).toBe(true);
    expect(fake.ACCOMMODATION_TYPES.length).toBeGreaterThan(0);
  });

  it('should export the same accommodation types as the generator module', async () => {
    const fake = createFakeApi();
    const { ACCOMMODATION_TYPES } = await import(
      '../generators/accommodationType'
    );

    expect(fake.ACCOMMODATION_TYPES).toEqual(ACCOMMODATION_TYPES);
  });
});
