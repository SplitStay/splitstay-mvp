import { z } from 'zod/v4-mini';

/**
 * Schema for parsing trip data from the database.
 */

// Database row shape (matches PostgreSQL column names)
const TripRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  locationId: z.nullable(z.string()),
  hostId: z.nullable(z.string()),
  joineeId: z.nullable(z.string()),
  accommodationTypeId: z.nullable(z.string()),
  personalNote: z.nullable(z.string()),
  vibe: z.nullable(z.string()),
  tripLink: z.nullable(z.string()),
  estimatedMonth: z.nullable(z.string()),
  estimatedYear: z.nullable(z.string()),
  numberOfRooms: z.nullable(z.number()),
  matchWith: z.nullable(z.string()),
  isPublic: z.nullable(z.boolean()),
  rooms: z.nullable(z.unknown()),
  startDate: z.nullable(z.string()),
  endDate: z.nullable(z.string()),
  bookingUrl: z.nullable(z.string()),
  thumbnailUrl: z.nullable(z.string()),
  flexible: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ParsedTrip = z.infer<typeof TripRowSchema> & {
  isPublic: boolean;
};

// Schema for trip with relations (host, joinee, accommodation_type)
const TripWithRelationsRowSchema = z.extend(TripRowSchema, {
  host: z.nullable(
    z.object({
      name: z.nullable(z.string()),
      imageUrl: z.nullable(z.string()),
    }),
  ),
  joinee: z.nullable(
    z.object({
      name: z.nullable(z.string()),
      imageUrl: z.nullable(z.string()),
    }),
  ),
  accommodation_type: z.nullable(
    z.object({
      name: z.string(),
    }),
  ),
});

export type ParsedTripWithRelations = z.infer<
  typeof TripWithRelationsRowSchema
> & {
  isPublic: boolean;
};

export interface ParsedTripWithHiddenStatus extends ParsedTripWithRelations {
  isHiddenByAdmin: boolean;
}

/**
 * Parse a single trip row from the database
 */
export function parseTrip(row: unknown): ParsedTrip {
  const validated = z.parse(TripRowSchema, row);
  return {
    ...validated,
    isPublic: validated.isPublic ?? true,
  };
}

/**
 * Parse a trip with relations from the database
 */
export function parseTripWithRelations(row: unknown): ParsedTripWithRelations {
  const validated = z.parse(TripWithRelationsRowSchema, row);
  return {
    ...validated,
    isPublic: validated.isPublic ?? true,
  };
}

/**
 * Parse multiple trips with relations from the database
 */
export function parseTripsWithRelations(
  rows: unknown[],
): ParsedTripWithRelations[] {
  return rows.map((row) => parseTripWithRelations(row));
}
