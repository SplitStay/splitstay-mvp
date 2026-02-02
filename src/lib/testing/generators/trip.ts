import { faker } from '@faker-js/faker';
import type { z } from 'zod';
import { publicTripRowSchema } from '@/lib/schemas/database.schemas';

export type Trip = z.infer<typeof publicTripRowSchema>;

/**
 * Creates a mock trip with all required fields.
 *
 * Uses lowercase field names to match database column names
 * (PostgreSQL lowercases unquoted identifiers).
 *
 * Note: The TripSchema transform will convert these to camelCase
 * when the data flows through the application layer.
 */
export const createTrip = (overrides: Partial<Trip> = {}): Trip => {
  const now = new Date().toISOString();
  const startDate = faker.date.future();
  const endDate = faker.date.future({ refDate: startDate });

  const trip: Trip = {
    id: faker.string.uuid(),
    hostId: overrides.hostId ?? faker.string.uuid(),
    joineeId: null,
    name: `${faker.location.city()} Getaway`,
    description: faker.lorem.paragraph(),
    location: faker.location.city(),
    locationId: null,
    accommodationTypeId: null,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    flexible: faker.datatype.boolean(),
    // Lowercase fields (as stored in PostgreSQL)
    ispublic: true,
    estimatedmonth: null,
    estimatedyear: null,
    numberofrooms: faker.number.int({ min: 1, max: 6 }),
    matchwith: null,
    personalNote: null,
    vibe: faker.helpers.arrayElement([
      'adventure',
      'relaxation',
      'culture',
      'party',
      null,
    ]),
    tripLink: null,
    bookingUrl: null,
    thumbnailUrl: null,
    rooms: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };

  return publicTripRowSchema.parse(trip);
};

/**
 * Creates a mock trip with host relation data.
 *
 * Useful for tests that need the joined host information
 * as returned by Supabase queries with relations.
 */
export const createTripWithHost = (
  overrides: Partial<Trip> & {
    host?: { name: string | null; imageUrl: string | null } | null;
  } = {},
) => {
  const { host, ...tripOverrides } = overrides;
  const trip = createTrip(tripOverrides);

  return {
    ...trip,
    host: host ?? { name: faker.person.fullName(), imageUrl: null },
    joinee: null,
    accommodation_type: null,
  };
};
