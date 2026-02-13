import { describe, expect, it } from 'vitest';
import {
  expandUniformRooms,
  looksLikeUserAffirmative,
} from '../supplierSchema';

describe('expandUniformRooms', () => {
  const eventStart = '2026-06-24';
  const eventEnd = '2026-06-28';

  it('generates rooms from event dates when rooms array is empty', () => {
    const raw = {
      supplier_name: 'Test',
      num_bedrooms: 3,
      rooms: [],
      all_rooms_same_dates: true,
    };

    const result = expandUniformRooms(raw, eventStart, eventEnd);

    expect(result.rooms).toEqual([
      { room_number: 1, available_from: eventStart, available_to: eventEnd },
      { room_number: 2, available_from: eventStart, available_to: eventEnd },
      { room_number: 3, available_from: eventStart, available_to: eventEnd },
    ]);
  });

  it('generates rooms from a single room entry when all_rooms_same_dates is set', () => {
    const raw = {
      supplier_name: 'Test',
      num_bedrooms: 5,
      rooms: [
        {
          room_number: 1,
          available_from: '2026-06-25',
          available_to: '2026-06-27',
        },
      ],
      all_rooms_same_dates: true,
    };

    const result = expandUniformRooms(raw, eventStart, eventEnd);

    expect(result.rooms).toHaveLength(5);
    for (const room of result.rooms as Array<Record<string, unknown>>) {
      expect(room.available_from).toBe('2026-06-25');
      expect(room.available_to).toBe('2026-06-27');
    }
  });

  it('returns unchanged when rooms array already matches num_bedrooms', () => {
    const raw = {
      supplier_name: 'Test',
      num_bedrooms: 2,
      rooms: [
        {
          room_number: 1,
          available_from: eventStart,
          available_to: eventEnd,
        },
        {
          room_number: 2,
          available_from: eventStart,
          available_to: eventEnd,
        },
      ],
    };

    const result = expandUniformRooms(raw, eventStart, eventEnd);

    expect(result.rooms).toEqual(raw.rooms);
  });

  it('does not expand when existing rooms have different dates', () => {
    const raw = {
      supplier_name: 'Test',
      num_bedrooms: 3,
      rooms: [
        {
          room_number: 1,
          available_from: '2026-06-24',
          available_to: '2026-06-26',
        },
        {
          room_number: 2,
          available_from: '2026-06-25',
          available_to: '2026-06-28',
        },
      ],
    };

    const result = expandUniformRooms(raw, eventStart, eventEnd);

    // Should not expand — rooms have mixed dates
    expect(result.rooms).toEqual(raw.rooms);
  });

  it('expands truncated rooms when all existing rooms share dates', () => {
    const raw = {
      supplier_name: 'Test',
      num_bedrooms: 20,
      rooms: Array.from({ length: 11 }, (_, i) => ({
        room_number: i + 1,
        available_from: eventStart,
        available_to: eventEnd,
      })),
    };

    const result = expandUniformRooms(raw, eventStart, eventEnd);

    expect(result.rooms).toHaveLength(20);
    const rooms = result.rooms as Array<Record<string, unknown>>;
    expect(rooms[19]).toEqual({
      room_number: 20,
      available_from: eventStart,
      available_to: eventEnd,
    });
  });

  it('generates rooms from event dates when rooms array is missing', () => {
    const raw = {
      supplier_name: 'Test',
      num_bedrooms: 2,
      all_rooms_same_dates: true,
    };

    const result = expandUniformRooms(raw, eventStart, eventEnd);

    expect(result.rooms).toHaveLength(2);
  });

  it('strips all_rooms_same_dates from the output', () => {
    const raw = {
      supplier_name: 'Test',
      num_bedrooms: 2,
      rooms: [],
      all_rooms_same_dates: true,
    };

    const result = expandUniformRooms(raw, eventStart, eventEnd);

    expect(result).not.toHaveProperty('all_rooms_same_dates');
  });

  it('returns unchanged when num_bedrooms is missing', () => {
    const raw = { supplier_name: 'Test', rooms: [] };

    const result = expandUniformRooms(raw, eventStart, eventEnd);

    expect(result).toEqual(raw);
  });
});

describe('looksLikeUserAffirmative', () => {
  it.each([
    'YES',
    'yes',
    'yeah',
    'yep',
    'confirm',
    'correct',
    'looks good',
    "that's right",
    'go ahead',
    'sure',
    'ok',
    'absolutely',
  ])('recognizes "%s" as affirmative', (input) => {
    expect(looksLikeUserAffirmative(input)).toBe(true);
  });

  it.each([
    'What happens if the JSON is invalid?',
    'Tell me about your validation rules',
    'How many retries do you have?',
    'Change the price to 200',
    'I want to list my property',
  ])('does not treat "%s" as affirmative', (input) => {
    expect(looksLikeUserAffirmative(input)).toBe(false);
  });
});
