import { describe, expect, it } from 'vitest';
import { ACCOMMODATION_TYPES } from '../accommodationType';
import { escapeSQL, generateSeedSQL } from '../seedSqlGenerator';

describe('Generator script produces valid seed SQL', () => {
  it('should generate SQL content', () => {
    const sql = generateSeedSQL(ACCOMMODATION_TYPES);
    expect(sql).toBeDefined();
    expect(sql.length).toBeGreaterThan(0);
  });

  it('should have a header marking it as generated', () => {
    const sql = generateSeedSQL(ACCOMMODATION_TYPES);
    expect(sql).toContain('-- GENERATED FILE');
    expect(sql).toContain('DO NOT EDIT MANUALLY');
  });

  it('should use ON CONFLICT for idempotency', () => {
    const sql = generateSeedSQL(ACCOMMODATION_TYPES);
    expect(sql).toContain('ON CONFLICT');
    expect(sql).toContain('DO UPDATE');
  });

  it('should properly escape single quotes in string values', () => {
    const escaped = escapeSQL("Test's Value");
    expect(escaped).toBe("Test''s Value");
  });

  it('should include all accommodation types', () => {
    const sql = generateSeedSQL(ACCOMMODATION_TYPES);
    for (const type of ACCOMMODATION_TYPES) {
      expect(sql).toContain(type.id);
      expect(sql).toContain(type.name);
    }
  });
});
