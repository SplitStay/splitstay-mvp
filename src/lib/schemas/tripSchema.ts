import { z } from 'zod/v4-mini';

/**
 * Schema for parsing trip data from the database.
 *
 * The database has some columns with lowercase names (ispublic, numberofrooms, etc.)
 * but the frontend expects camelCase (isPublic, numberOfRooms, etc.).
 * This module validates the database row and transforms to the frontend format.
 */

// Raw database row shape (matches actual PostgreSQL column names)
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
  // Lowercase columns from database
  estimatedmonth: z.nullable(z.string()),
  estimatedyear: z.nullable(z.string()),
  numberofrooms: z.nullable(z.number()),
  matchwith: z.nullable(z.string()),
  ispublic: z.nullable(z.boolean()),
  // CamelCase columns (were quoted in migration)
  rooms: z.nullable(z.unknown()),
  startDate: z.nullable(z.string()),
  endDate: z.nullable(z.string()),
  bookingUrl: z.nullable(z.string()),
  thumbnailUrl: z.nullable(z.string()),
  flexible: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type TripRow = z.infer<typeof TripRowSchema>;

// Parsed trip with camelCase field names
export interface ParsedTrip {
  id: string;
  name: string;
  description: string;
  location: string;
  locationId: string | null;
  hostId: string | null;
  joineeId: string | null;
  accommodationTypeId: string | null;
  personalNote: string | null;
  vibe: string | null;
  tripLink: string | null;
  estimatedMonth: string | null;
  estimatedYear: string | null;
  numberOfRooms: number | null;
  matchWith: string | null;
  isPublic: boolean;
  rooms: unknown;
  startDate: string | null;
  endDate: string | null;
  bookingUrl: string | null;
  thumbnailUrl: string | null;
  flexible: boolean;
  createdAt: string;
  updatedAt: string;
}

function transformTripRow(row: TripRow): ParsedTrip {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    location: row.location,
    locationId: row.locationId,
    hostId: row.hostId,
    joineeId: row.joineeId,
    accommodationTypeId: row.accommodationTypeId,
    personalNote: row.personalNote,
    vibe: row.vibe,
    tripLink: row.tripLink,
    // Transform lowercase to camelCase
    estimatedMonth: row.estimatedmonth,
    estimatedYear: row.estimatedyear,
    numberOfRooms: row.numberofrooms,
    matchWith: row.matchwith,
    isPublic: row.ispublic ?? true,
    // Pass through unchanged
    rooms: row.rooms,
    startDate: row.startDate,
    endDate: row.endDate,
    bookingUrl: row.bookingUrl,
    thumbnailUrl: row.thumbnailUrl,
    flexible: row.flexible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

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

type TripWithRelationsRow = z.infer<typeof TripWithRelationsRowSchema>;

export interface ParsedTripWithRelations extends ParsedTrip {
  host: { name: string | null; imageUrl: string | null } | null;
  joinee: { name: string | null; imageUrl: string | null } | null;
  accommodation_type: { name: string } | null;
}

function transformTripWithRelationsRow(
  row: TripWithRelationsRow,
): ParsedTripWithRelations {
  return {
    ...transformTripRow(row),
    host: row.host,
    joinee: row.joinee,
    accommodation_type: row.accommodation_type,
  };
}

export interface ParsedTripWithHiddenStatus extends ParsedTripWithRelations {
  isHiddenByAdmin: boolean;
}

/**
 * Parse a single trip row from the database
 */
export function parseTrip(row: unknown): ParsedTrip {
  const validated = z.parse(TripRowSchema, row);
  return transformTripRow(validated);
}

/**
 * Parse a trip with relations from the database
 */
export function parseTripWithRelations(row: unknown): ParsedTripWithRelations {
  const validated = z.parse(TripWithRelationsRowSchema, row);
  return transformTripWithRelationsRow(validated);
}

/**
 * Parse multiple trips with relations from the database
 */
export function parseTripsWithRelations(
  rows: unknown[],
): ParsedTripWithRelations[] {
  return rows.map((row) => {
    const validated = z.parse(TripWithRelationsRowSchema, row);
    return transformTripWithRelationsRow(validated);
  });
}
