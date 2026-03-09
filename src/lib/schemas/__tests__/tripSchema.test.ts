import { describe, expect, it } from 'vitest';
import { TripWithRelationsSchema } from '../tripSchema';

/**
 * Minimal valid trip row matching what PostgREST returns from the
 * searchable_trips view / trip table in production.
 */
function buildTripRow(overrides: Record<string, unknown> = {}) {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Trip',
    description: 'A test trip',
    location: 'Paris',
    locationId: null,
    hostId: '660e8400-e29b-41d4-a716-446655440001',
    joineeId: null,
    accommodationTypeId: null,
    personalNote: null,
    vibe: null,
    tripLink: null,
    estimatedmonth: null,
    estimatedyear: null,
    numberofrooms: null,
    matchwith: null,
    ispublic: true,
    rooms: null,
    startDate: null,
    endDate: null,
    bookingUrl: null,
    thumbnailUrl: null,
    flexible: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    host: { name: 'Host', imageUrl: null },
    joinee: null,
    accommodation_type: null,
    ...overrides,
  };
}

describe('TripWithRelationsSchema', () => {
  it('renames ispublic to isPublic', () => {
    const result = TripWithRelationsSchema.parse(
      buildTripRow({ ispublic: false }),
    );
    expect(result.isPublic).toBe(false);
    expect(result).not.toHaveProperty('ispublic');
  });

  it('defaults isPublic to true when ispublic is null', () => {
    const result = TripWithRelationsSchema.parse(
      buildTripRow({ ispublic: null }),
    );
    expect(result.isPublic).toBe(true);
  });

  it('renames estimatedmonth to estimatedMonth', () => {
    const result = TripWithRelationsSchema.parse(
      buildTripRow({ estimatedmonth: 'March' }),
    );
    expect(result.estimatedMonth).toBe('March');
    expect(result).not.toHaveProperty('estimatedmonth');
  });

  it('renames estimatedyear to estimatedYear', () => {
    const result = TripWithRelationsSchema.parse(
      buildTripRow({ estimatedyear: '2026' }),
    );
    expect(result.estimatedYear).toBe('2026');
    expect(result).not.toHaveProperty('estimatedyear');
  });

  it('renames matchwith to matchWith', () => {
    const result = TripWithRelationsSchema.parse(
      buildTripRow({ matchwith: 'anyone' }),
    );
    expect(result.matchWith).toBe('anyone');
    expect(result).not.toHaveProperty('matchwith');
  });

  it('renames numberofrooms to numberOfRooms', () => {
    const result = TripWithRelationsSchema.parse(
      buildTripRow({ numberofrooms: 3 }),
    );
    expect(result.numberOfRooms).toBe(3);
    expect(result).not.toHaveProperty('numberofrooms');
  });

  it('rejects a row missing required fields', () => {
    const result = TripWithRelationsSchema.safeParse({ id: 'only-id' });
    expect(result.success).toBe(false);
  });

  it('preserves host and joinee relations', () => {
    const result = TripWithRelationsSchema.parse(
      buildTripRow({
        host: { name: 'Alice', imageUrl: 'https://example.com/a.jpg' },
        joinee: { name: 'Bob', imageUrl: null },
      }),
    );
    expect(result.host).toEqual({
      name: 'Alice',
      imageUrl: 'https://example.com/a.jpg',
    });
    expect(result.joinee).toEqual({ name: 'Bob', imageUrl: null });
  });
});
