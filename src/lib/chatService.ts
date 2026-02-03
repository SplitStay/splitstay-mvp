import type { z } from 'zod';
import {
  getReactions,
  type MessageMetadataSchema,
  parseMessageMetadata,
} from './schemas/messageSchema';
import { supabase } from './supabase';

// Conversations/messages schema
export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  is_archived_by_user1: boolean;
  is_archived_by_user2: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  deleted_at?: string | null;
  edited_at?: string | null;
  message_type: 'text' | 'image' | 'system';
  metadata: z.infer<typeof MessageMetadataSchema>;
}

export interface ConversationWithUser extends Conversation {
  other_user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl?: string | null;
  };
  last_message?: Message;
  unread_count?: number;
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    name: string | null;
    email: string;
    imageUrl?: string | null;
  };
}

// biome-ignore lint/complexity/noStaticOnlyClass: Service pattern
export class ChatService {
  // Get all conversations for current user
  static async getUserConversations(
    userId: string,
  ): Promise<ConversationWithUser[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:user1_id(id, name, email, imageUrl),
        user2:user2_id(id, name, email, imageUrl)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Type for conversation with joined user data
    type ConversationWithJoins = {
      id: string;
      user1_id: string;
      user2_id: string;
      created_at: string;
      updated_at: string;
      last_message_at: string | null;
      is_archived_by_user1: boolean;
      is_archived_by_user2: boolean;
      user1: {
        id: string;
        name: string | null;
        email: string;
        imageUrl: string | null;
      } | null;
      user2: {
        id: string;
        name: string | null;
        email: string;
        imageUrl: string | null;
      } | null;
    };

    const conversationsWithUsers = await Promise.all(
      ((data as ConversationWithJoins[]) || []).map(async (conv) => {
        const other_user = conv.user1_id === userId ? conv.user2 : conv.user1;

        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count using the database function
        const { data: unreadCount } = await supabase.rpc(
          'get_unread_message_count',
          {
            p_conversation_id: conv.id,
            p_user_id: userId,
          },
        );

        return {
          ...conv,
          other_user,
          last_message: lastMessage || undefined,
          unread_count: unreadCount || 0,
        } as ConversationWithUser;
      }),
    );

    return conversationsWithUsers;
  }

  // Get or create a direct conversation between two users
  static async getOrCreateDirectConversation(
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation> {
    // Enforce ordering required by DB constraint (e.g., user1_id < user2_id)
    const [a, b] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    // Try to find an existing conversation with ordered pair
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .eq('user1_id', a)
      .eq('user2_id', b)
      .limit(1)
      .maybeSingle();

    if (existingConv) return existingConv as Conversation;

    // Create new conversation with ordered user ids
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({ user1_id: a, user2_id: b })
      .select()
      .single();

    if (createError) throw createError;
    return newConv as Conversation;
  }

  // Get messages for a conversation
  static async getConversationMessages(
    conversationId: string,
    limit = 50,
  ): Promise<MessageWithSender[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, name, email, imageUrl)
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as MessageWithSender[];
  }

  // Send a message
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'video' | 'document' = 'text',
    metadata?: z.infer<typeof MessageMetadataSchema>,
  ): Promise<Message> {
    // Use direct table insert for now (more reliable than RPC)
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    // Email notifications are now handled by database triggers
    // No need for frontend email calls since DB triggers handle offline notifications

    return data as Message;
  }

  static async markMessagesAsRead(conversationId: string): Promise<void> {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversationId,
    });
    if (error) throw error;
  }

  static async fetchReadReceiptsForMessages(
    messageIds: string[],
    readerUserId: string,
  ): Promise<Record<string, boolean>> {
    if (!messageIds.length) return {};
    const { data, error } = await supabase
      .from('message_read_status')
      .select('message_id, user_id, read_at')
      .in('message_id', messageIds)
      .eq('user_id', readerUserId);
    if (error) throw error;
    const map: Record<string, boolean> = {};
    for (const row of data || []) map[row.message_id] = true;
    return map;
  }

  static async toggleReaction(
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    const { data: msg, error: fetchError } = await supabase
      .from('messages')
      .select('metadata')
      .eq('id', messageId)
      .single();
    if (fetchError) throw fetchError;
    const metadata = parseMessageMetadata(msg?.metadata) ?? {};
    const reactions = getReactions(metadata);
    const current: string[] = Array.isArray(reactions[emoji])
      ? reactions[emoji]
      : [];
    const has = current.includes(userId);
    const next = has
      ? current.filter((x) => x !== userId)
      : [...current, userId];
    const nextMetadata = {
      ...metadata,
      reactions: { ...reactions, [emoji]: next },
    };
    const { error: updateError } = await supabase
      .from('messages')
      .update({ metadata: nextMetadata })
      .eq('id', messageId);
    if (updateError) throw updateError;
  }

  static subscribeToReadReceipts(
    callback: (payload: {
      message_id: string;
      user_id: string;
      read_at: string;
    }) => void,
  ) {
    return supabase
      .channel('message-read-status')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message_read_status' },
        (payload) => {
          const row = payload.new as {
            message_id: string;
            user_id: string;
            read_at: string;
          };
          callback(row);
        },
      )
      .subscribe();
  }

  static subscribeToMessageUpdates(
    conversationId: string,
    callback: (message: Message) => void,
  ) {
    return supabase
      .channel(`messages:update:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        },
      )
      .subscribe();
  }

  static async updateUserPresence(isOnline: boolean): Promise<void> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { error } = await supabase.from('user_presence').upsert(
        {
          user_id: userId,
          is_online: isOnline,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        },
      );

      if (error) {
        console.warn('Error updating presence:', error);
      }
    } catch (error) {
      console.warn('Failed to update user presence:', error);
    }
  }
  // Subscribe to new messages in a conversation
  static subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void,
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        },
      )
      .subscribe();
  }

  // Subscribe to all message inserts visible to the current session (RLS-safe)
  static subscribeToAllMessages(callback: (message: Message) => void) {
    return supabase
      .channel('messages:all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          callback(payload.new as Message);
        },
      )
      .subscribe();
  }

  // Subscribe to conversation updates
  static subscribeToUserConversations(
    userId: string,
    callback: (conversation: Conversation) => void,
  ) {
    return supabase
      .channel(`user-conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          callback(payload.new as Conversation);
        },
      )
      .subscribe();
  }
}
