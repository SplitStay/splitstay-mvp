import type { AccommodationType } from './accommodationType';

/**
 * Escapes single quotes in SQL strings by doubling them.
 *
 * @example
 * escapeSQL("Test's Value") // returns "Test''s Value"
 */
export const escapeSQL = (value: string): string => {
  return value.replace(/'/g, "''");
};

/**
 * Generates seed SQL for accommodation types.
 *
 * Uses ON CONFLICT for idempotent execution - safe to run multiple times.
 */
export const generateSeedSQL = (types: AccommodationType[]): string => {
  const header = `-- GENERATED FILE - DO NOT EDIT MANUALLY
-- Generated from src/lib/testing/generators/accommodationType.ts
-- Run 'npm run db:seed:gen' to regenerate

`;

  const insertStatement = `INSERT INTO public.accommodation_type (id, name, "displayOrder", "createdAt", "updatedAt")
VALUES`;

  const values = types
    .map(
      (type) =>
        `  ('${escapeSQL(type.id)}', '${escapeSQL(type.name)}', ${type.displayOrder}, NOW(), NOW())`,
    )
    .join(',\n');

  const onConflict = `ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "displayOrder" = EXCLUDED."displayOrder",
  "updatedAt" = NOW();`;

  return `${header}${insertStatement}\n${values}\n${onConflict}\n`;
};
