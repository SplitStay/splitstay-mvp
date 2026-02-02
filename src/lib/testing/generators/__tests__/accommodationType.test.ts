import { describe, expect, it } from 'vitest';
import {
  ACCOMMODATION_TYPES,
  accommodationTypesSchema,
} from '../accommodationType';

describe('Accommodation types are defined with strict validation', () => {
  it('should include id, name, and display order for each type', () => {
    expect(ACCOMMODATION_TYPES.length).toBeGreaterThan(0);

    for (const type of ACCOMMODATION_TYPES) {
      expect(type).toHaveProperty('id');
      expect(type).toHaveProperty('name');
      expect(type).toHaveProperty('displayOrder');
      expect(typeof type.id).toBe('string');
      expect(typeof type.name).toBe('string');
      expect(typeof type.displayOrder).toBe('number');
    }
  });

  it('should validate successfully with the schema', () => {
    expect(() =>
      accommodationTypesSchema.parse(ACCOMMODATION_TYPES),
    ).not.toThrow();
  });

  it('should fail validation if data is empty', () => {
    expect(() => accommodationTypesSchema.parse([])).toThrow();
  });

  it('should fail validation if data does not match expected literal values', () => {
    const invalidData = [
      { id: 'invalid-id', name: 'Invalid Type', displayOrder: 1 },
    ];
    expect(() => accommodationTypesSchema.parse(invalidData)).toThrow();
  });

  it('should contain the expected accommodation types', () => {
    const ids = ACCOMMODATION_TYPES.map((t) => t.id);
    expect(ids).toContain('hostel-room');
    expect(ids).toContain('hotel-room');
    expect(ids).toContain('apartment');
    expect(ids).toContain('house');
  });
});
