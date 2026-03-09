import { describe, expect, it } from 'vitest';
import {
  EventLandingPageConfigSchema,
  eventLandingPages,
  getEventBySlug,
} from './eventLandingPages';

describe('Event landing page config validation', () => {
  it('should validate all registered event configs against the schema', () => {
    for (const config of eventLandingPages) {
      const result = EventLandingPageConfigSchema.safeParse(config);
      expect(
        result.success,
        `Config for "${config.name}" failed validation: ${
          !result.success ? JSON.stringify(result.error.issues) : ''
        }`,
      ).toBe(true);
    }
  });

  it('should reject a config with missing required fields', () => {
    const invalid = { name: 'Bad Event' };
    const result = EventLandingPageConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('Event config registry', () => {
  it('should not contain duplicate slugs', () => {
    const slugs = eventLandingPages.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('Event config lookup by slug', () => {
  it('should return the config for a valid slug', () => {
    const config = getEventBySlug('all-things-go');
    expect(config).toBeDefined();
    expect(config?.name).toBe('All Things Go Festival');
  });

  it('should return undefined for an unknown slug', () => {
    const config = getEventBySlug('nonexistent-event');
    expect(config).toBeUndefined();
  });
});
