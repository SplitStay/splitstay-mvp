import { describe, expect, it } from 'vitest';
import { ACCOMMODATION_TYPES } from '../accommodationType';
import { createTrip } from '../trip';

describe('Trip generator uses valid accommodation type IDs', () => {
  it('should generate a trip with a valid accommodationTypeId from the defined types', () => {
    const validIds = ACCOMMODATION_TYPES.map((t) => t.id);
    const trip = createTrip();

    expect(trip.accommodationTypeId).toBeDefined();
    expect(validIds).toContain(trip.accommodationTypeId);
  });

  it('should allow overriding the accommodationTypeId', () => {
    const trip = createTrip({ accommodationTypeId: 'house' });
    expect(trip.accommodationTypeId).toBe('house');
  });

  it('should allow setting accommodationTypeId to null', () => {
    const trip = createTrip({ accommodationTypeId: null });
    expect(trip.accommodationTypeId).toBeNull();
  });
});
