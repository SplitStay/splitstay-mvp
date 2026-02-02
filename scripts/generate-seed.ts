/**
 * Script to generate supabase/seed.sql from TypeScript source of truth.
 *
 * Run with: npm run db:seed:gen
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ACCOMMODATION_TYPES } from '../src/lib/testing/generators/accommodationType';
import { generateSeedSQL } from '../src/lib/testing/generators/seedSqlGenerator';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '..', 'supabase', 'seed.sql');

try {
  const sql = generateSeedSQL(ACCOMMODATION_TYPES);
  writeFileSync(outputPath, sql, 'utf-8');
  console.log(`✓ Generated ${outputPath}`);
  process.exit(0);
} catch (error) {
  console.error('✗ Failed to generate seed.sql:', error);
  process.exit(1);
}
