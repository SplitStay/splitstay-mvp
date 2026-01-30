import {
  publicAccommodationTypeRowSchema,
  publicTripRowSchema,
  publicUserRowSchema,
} from './database.schemas';

/**
 * Trip schema with application-level defaults.
 *
 * Extends the generated schema to handle null-to-default transformations.
 */
export const TripSchema = publicTripRowSchema.transform((trip) => ({
  ...trip,
  isPublic: trip.isPublic ?? true,
}));

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
  .transform((trip) => ({
    ...trip,
    isPublic: trip.isPublic ?? true,
  }));
