import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConversationMessage } from './schemas';
import { ConversationMessageSchema } from './schemas';
import type { DbClient } from './types';

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
});
