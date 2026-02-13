import { z } from 'zod';
import type { SavePropertyListingInput } from './types';

const SupplierRoomSchema = z
  .object({
    room_number: z.number().int().min(1),
    available_from: z.string().date(),
    available_to: z.string().date(),
  })
  .refine((data) => data.available_to >= data.available_from, {
    message: 'available_to must be on or after available_from',
  });

export const SupplierListingSchema = z
  .object({
    supplier_name: z.string().min(1).max(200),
    location: z.string().min(1).max(500),
    accommodation_type_id: z.string().min(1),
    num_bedrooms: z.number().int().min(1).max(20),
    price_per_night: z.number().positive(),
    house_rules: z.string().max(2000).default(''),
    rooms: z.array(SupplierRoomSchema).min(1),
  })
  .refine((data) => data.rooms.length === data.num_bedrooms, {
    message: 'Number of rooms must equal num_bedrooms',
  });

export type SupplierListing = z.infer<typeof SupplierListingSchema>;

/**
 * Expands the rooms array when the LLM indicates all rooms share the same
 * dates. Handles two cases:
 * 1. LLM sets "all_rooms_same_dates": true and omits/shortens the rooms array
 * 2. LLM output was truncated and only a partial rooms array exists, but all
 *    entries share the same dates
 *
 * Must be called BEFORE Zod validation since the schema requires
 * rooms.length === num_bedrooms.
 */
export const expandUniformRooms = (
  raw: Record<string, unknown>,
  eventStartDate: string,
  eventEndDate: string,
): Record<string, unknown> => {
  const numBedrooms = raw.num_bedrooms;
  if (typeof numBedrooms !== 'number' || numBedrooms < 1) return raw;

  const rooms = Array.isArray(raw.rooms) ? raw.rooms : [];

  // Already has the right number of rooms — nothing to expand
  if (rooms.length === numBedrooms) return raw;

  // Determine the dates to use for generated rooms
  let fromDate = eventStartDate;
  let toDate = eventEndDate;

  if (rooms.length > 0) {
    // Check if all existing rooms share the same dates
    const firstFrom = (rooms[0] as Record<string, unknown>)?.available_from;
    const firstTo = (rooms[0] as Record<string, unknown>)?.available_to;
    const allSameDates = rooms.every((r: unknown) => {
      const room = r as Record<string, unknown>;
      return room.available_from === firstFrom && room.available_to === firstTo;
    });

    if (!allSameDates) {
      // Rooms have mixed dates — can't safely expand, let Zod catch it
      return raw;
    }

    if (typeof firstFrom === 'string' && typeof firstTo === 'string') {
      fromDate = firstFrom;
      toDate = firstTo;
    }
  }

  // Generate the full rooms array
  const expandedRooms = Array.from({ length: numBedrooms }, (_, i) => ({
    room_number: i + 1,
    available_from: fromDate,
    available_to: toDate,
  }));

  const { all_rooms_same_dates: _, ...rest } = raw;
  return { ...rest, rooms: expandedRooms };
};

export const toSavePropertyListingInput = (
  listing: SupplierListing,
  phoneNumber: string,
  eventId: string,
): SavePropertyListingInput => ({
  phoneNumber,
  supplierName: listing.supplier_name,
  eventId,
  location: listing.location,
  accommodationTypeId: listing.accommodation_type_id,
  numBedrooms: listing.num_bedrooms,
  pricePerNight: listing.price_per_night,
  houseRules: listing.house_rules,
  rooms: listing.rooms.map((r) => ({
    roomNumber: r.room_number,
    availableFrom: r.available_from,
    availableTo: r.available_to,
  })),
});

type RoomDateValidation = { valid: true } | { valid: false; error: string };

export const validateRoomDatesWithinEvent = (
  rooms: Array<{ available_from: string; available_to: string }>,
  eventStartDate: string,
  eventEndDate: string,
): RoomDateValidation => {
  for (const room of rooms) {
    if (room.available_from < eventStartDate) {
      return {
        valid: false,
        error: `Room available_from (${room.available_from}) is before event start date (${eventStartDate})`,
      };
    }
    if (room.available_to > eventEndDate) {
      return {
        valid: false,
        error: `Room available_to (${room.available_to}) is after event end date (${eventEndDate})`,
      };
    }
  }
  return { valid: true };
};

const EVENT_YEAR_PATTERN = /\b20[2-3]\d\b/;

export const looksLikeEventReference = (content: string): boolean =>
  EVENT_YEAR_PATTERN.test(content);

const JSON_BLOCK_REGEX = /```json\s*([\s\S]*?)\s*```/;

export const extractJsonBlock = (
  content: string,
): { found: true; json: string } | { found: false } => {
  const match = content.match(JSON_BLOCK_REGEX);
  if (!match?.[1]) return { found: false };
  return { found: true, json: match[1] };
};

export const stripJsonBlock = (content: string): string =>
  content.replace(JSON_BLOCK_REGEX, '').trim();

const INCOMPLETE_JSON_BLOCK_REGEX = /```json\s*[\s\S]*$/;

export const hasIncompleteJsonBlock = (content: string): boolean =>
  !JSON_BLOCK_REGEX.test(content) && INCOMPLETE_JSON_BLOCK_REGEX.test(content);

const CONFIRMATION_PATTERNS = [
  /\blisting\b.*\b(?:saved|confirmed|created|submitted)\b/i,
  /\b(?:saved|confirmed|created|submitted)\b.*\blisting\b/i,
  /\bpreferences have been saved\b/i,
  /\bteam will (?:be in touch|review|follow up)\b/i,
];

export const looksLikeConfirmation = (content: string): boolean =>
  CONFIRMATION_PATTERNS.some((pattern) => pattern.test(content));

const USER_AFFIRMATIVE_PATTERN =
  /\b(yes|yeah|yep|yup|confirm|correct|right|approve|go ahead|looks? good|that'?s (?:right|correct)|save it|ok|okay|sure|absolutely|definitely)\b/i;

export const looksLikeUserAffirmative = (message: string): boolean =>
  USER_AFFIRMATIVE_PATTERN.test(message);
