import { faker } from '@faker-js/faker';
import type { z } from 'zod';
import { publicTripRowSchema } from '@/lib/schemas/database.schemas';
import { ACCOMMODATION_TYPES } from './accommodationType';

export type Trip = z.infer<typeof publicTripRowSchema>;

/**
 * Creates a mock trip with all required fields.
 *
 * Field names match the database column names. Some columns use lowercase
 * (ispublic, estimatedmonth, etc.) while others use camelCase (hostId,
 * startDate, etc.) depending on how they were defined in the database schema.
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
    accommodationTypeId: faker.helpers.arrayElement(
      ACCOMMODATION_TYPES.map((t) => t.id),
    ),
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
