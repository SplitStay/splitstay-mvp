import {
  publicAccommodationTypeRowSchema,
  publicTripRowSchema,
  publicUserRowSchema,
} from './database.schemas';

/**
 * Transform database lowercase field names to camelCase for the app.
 *
 * PostgreSQL lowercases unquoted identifiers, so some columns are stored
 * as lowercase (e.g., `ispublic` instead of `isPublic`). This transform
 * normalizes them to camelCase for consistent app usage.
 */
const transformTripFields = <
  T extends {
    ispublic: boolean | null;
    estimatedmonth: string | null;
    estimatedyear: string | null;
    matchwith: string | null;
    numberofrooms: number | null;
  },
>(
  trip: T,
) => {
  const {
    ispublic,
    estimatedmonth,
    estimatedyear,
    matchwith,
    numberofrooms,
    ...rest
  } = trip;
  return {
    ...rest,
    isPublic: ispublic ?? true,
    estimatedMonth: estimatedmonth,
    estimatedYear: estimatedyear,
    matchWith: matchwith,
    numberOfRooms: numberofrooms,
  };
};

/**
 * Trip schema with application-level defaults.
 *
 * Extends the generated schema to handle null-to-default transformations
 * and normalizes lowercase database fields to camelCase.
 */
export const TripSchema = publicTripRowSchema.transform(transformTripFields);

/**
 * Schema for related user data (host/joinee) returned by Supabase joins.
 */
const RelatedUserSchema = publicUserRowSchema
  .pick({ name: true, imageUrl: true })
  .nullable();

/**
 * Schema for related accommodation type returned by Supabase joins.
 */
const RelatedAccommodationTypeSchema = publicAccommodationTypeRowSchema
  .pick({ name: true })
  .nullable();

/**
 * Trip schema with relations (host, joinee, accommodation_type).
 */
export const TripWithRelationsSchema = publicTripRowSchema
  .extend({
    host: RelatedUserSchema,
    joinee: RelatedUserSchema,
    accommodation_type: RelatedAccommodationTypeSchema,
  })
  .transform(transformTripFields);
