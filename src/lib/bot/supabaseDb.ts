import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { ConversationMessage } from './schemas';
import { ConversationMessageSchema } from './schemas';
import type { DbClient, MatchedEvent, SavePropertyListingInput } from './types';

const MatchedEventRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  start_date: z.string().date(),
  end_date: z.string().date(),
  location: z.string(),
});

export const createSupabaseDbClient = (supabase: SupabaseClient): DbClient => ({
  checkSeenSid: async (messageSid: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('whatsapp_seen_sid')
      .select('message_sid')
      .eq('message_sid', messageSid)
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  },

  markSidSeen: async (messageSid: string): Promise<void> => {
    const { error } = await supabase
      .from('whatsapp_seen_sid')
      .insert({ message_sid: messageSid });

    if (error) throw error;
  },

  checkRateLimit: async (
    phone: string,
    maxMessages: number,
    windowMs: number,
  ): Promise<{ allowed: boolean; retryAfterMinutes: number }> => {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_phone: phone,
      p_max_messages: maxMessages,
      p_window_ms: windowMs,
    });

    if (error) throw error;

    const row = data?.[0];
    if (!row) throw new Error('Rate limit RPC returned no rows');
    return {
      allowed: row.allowed,
      retryAfterMinutes: row.retry_after_minutes,
    };
  },

  getConversationHistory: async (
    phone: string,
    limit: number,
  ): Promise<ConversationMessage[]> => {
    // Fetch most recent N messages (descending) then reverse to chronological
    // order for LLM context. Ascending with limit would return the oldest N.
    const { data, error } = await supabase
      .from('whatsapp_conversation')
      .select('role, content')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? [])
      .reverse()
      .map((row) => ConversationMessageSchema.parse(row));
  },

  saveMessages: async (
    phone: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<void> => {
    const rows = messages.map((m) => ({
      phone_number: phone,
      role: m.role,
      content: m.content,
    }));

    const { error } = await supabase.from('whatsapp_conversation').insert(rows);

    if (error) throw error;
  },

  saveFlaggedContent: async (
    phone: string,
    content: string,
    reason: string,
  ): Promise<void> => {
    const { error } = await supabase
      .from('whatsapp_flagged_content')
      .insert({ phone_number: phone, content, flag_reason: reason });

    if (error) throw error;
  },

  countRecentFlags: async (
    phone: string,
    windowMs: number,
  ): Promise<number> => {
    const since = new Date(Date.now() - windowMs).toISOString();
    const { count, error } = await supabase
      .from('whatsapp_flagged_content')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', phone)
      .gte('created_at', since);

    if (error) throw error;
    return count ?? 0;
  },

  findMatchingEvents: async (messageBody: string): Promise<MatchedEvent[]> => {
    const { data, error } = await supabase.rpc('find_matching_events', {
      p_message_body: messageBody,
    });

    if (error) throw error;
    return (data ?? []).map((row: unknown) => {
      const parsed = MatchedEventRowSchema.parse(row);
      return {
        id: parsed.id,
        name: parsed.name,
        startDate: parsed.start_date,
        endDate: parsed.end_date,
        location: parsed.location,
      };
    });
  },

  findPropertyListing: async (
    phone: string,
    eventId: string,
  ): Promise<boolean> => {
    const { data, error } = await supabase.rpc('find_property_listing_exists', {
      p_phone_number: phone,
      p_event_id: eventId,
    });

    if (error) throw error;
    if (typeof data !== 'boolean') {
      throw new Error(
        `Expected boolean from find_property_listing_exists RPC, got ${typeof data}`,
      );
    }
    return data;
  },

  savePropertyListing: async (
    input: SavePropertyListingInput,
  ): Promise<{ propertyListingId: string }> => {
    const { data, error } = await supabase.rpc('save_property_listing', {
      p_phone_number: input.phoneNumber,
      p_supplier_name: input.supplierName,
      p_event_id: input.eventId,
      p_location: input.location,
      p_accommodation_type_id: input.accommodationTypeId,
      p_num_bedrooms: input.numBedrooms,
      p_price_per_night: input.pricePerNight,
      p_house_rules: input.houseRules,
      p_rooms: input.rooms.map((r) => ({
        room_number: r.roomNumber,
        available_from: r.availableFrom,
        available_to: r.availableTo,
      })),
    });

    if (error) throw error;
    if (typeof data !== 'string') {
      throw new Error(
        `Expected string from save_property_listing RPC, got ${typeof data}`,
      );
    }
    return { propertyListingId: data };
  },
});
