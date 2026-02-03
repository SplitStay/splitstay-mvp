import { z } from 'zod';

/**
 * Permissive schema for analytics event properties.
 * Amplitude SDK accepts arbitrary key-value pairs where values can be
 * strings, numbers, booleans, or arrays of these types.
 */
export const AnalyticsPropertyValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number(), z.boolean()])),
  z.null(),
]);

/**
 * Schema for analytics event properties object.
 */
export const AnalyticsPropertiesSchema = z.record(
  z.string(),
  AnalyticsPropertyValueSchema,
);
