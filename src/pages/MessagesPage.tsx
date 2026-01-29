import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, MessageCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ConversationList } from '../components/chat/ConversationList';
import { useAuth } from '../contexts/AuthContext';
import {
  ChatService,
  type Conversation,
  type ConversationWithUser,
  type Message,
} from '../lib/chatService';
import { supabase } from '../lib/supabase';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationWithUser[]>(
    [],
  );
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});

  // Get initial chat ID from URL params
  const initialChatId = searchParams.get('chat');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (initialChatId) {
      setSelectedChatId(initialChatId);
    }
  }, [initialChatId]);

  useEffect(() => {
    if (user?.id) {
      loadConversations();

      // Subscribe to conversation updates for real-time list
      const conversationsSub = ChatService.subscribeToUserConversations(
        user.id,
        (conv: Conversation) => {
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === conv.id);
            const mapped: ConversationWithUser =
              idx !== -1
                ? { ...prev[idx] }
                : {
                    // biome-ignore lint/suspicious/noExplicitAny: Supabase realtime payload
                    ...(conv as any),
                    other_user:
                      prev[idx]?.other_user ||
                      (prev[0]?.other_user ?? { id: '', name: '', email: '' }),
                    last_message: prev[idx]?.last_message,
                    unread_count: prev[idx]?.unread_count ?? 0,
                  };
            mapped.last_message_at = conv.last_message_at;
            mapped.updated_at = conv.updated_at;
            const next =
              idx !== -1
                ? [...prev.slice(0, idx), mapped, ...prev.slice(idx + 1)]
                : [mapped, ...prev];
            return next
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.last_message_at || b.updated_at).getTime() -
                  new Date(a.last_message_at || a.updated_at).getTime(),
              );
          });
        },
      );

      // Also subscribe to any new messages (update previews/ordering)
      // Presence: load current presence for all conversation partners
      const loadPresenceForConversations = async (partnerIds: string[]) => {
        if (!partnerIds.length) return;
        const { data } = await supabase
          .from('user_presence')
          .select('user_id, is_online, last_active_at')
          .in('user_id', partnerIds);
        if (data) {
          const next: Record<string, boolean> = {};
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          // biome-ignore lint/suspicious/noExplicitAny: Supabase query result
          for (const row of data as any[]) {
            const last = row.last_active_at
              ? new Date(row.last_active_at)
              : new Date(0);
            next[row.user_id] = !!row.is_online && last > fiveMinutesAgo;
          }
          setOnlineMap((prev) => ({ ...prev, ...next }));
        }
      };

      // Listen for messages being read to update unread counts
      const handleMessagesRead = async (event: CustomEvent) => {
        const { conversationId } = event.detail;
        if (user?.id) {
          // Refresh unread count for this conversation
          const { data: unreadCount } = await supabase.rpc(
            'get_unread_message_count',
            {
              p_conversation_id: conversationId,
              p_user_id: user.id,
            },
          );

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId
                ? { ...conv, unread_count: unreadCount || 0 }
                : conv,
            ),
          );
        }
      };

      window.addEventListener(
        'messagesRead',
        handleMessagesRead as EventListener,
      );

      // When conversations list changes, refresh presence info
      const partnerIds = Array.from(
        new Set(
          conversations
            .map((c) => c.other_user?.id)
            .filter(Boolean) as string[],
        ),
      );
      loadPresenceForConversations(partnerIds);

      // Realtime presence updates
      const presenceSub = supabase
        .channel('user-presence:list')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_presence' },
          (payload) => {
            // biome-ignore lint/suspicious/noExplicitAny: Supabase realtime payload
            const row = payload.new as any;
            if (!row?.user_id) return;
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const last = row.last_active_at
              ? new Date(row.last_active_at)
              : new Date(0);
            const isOnline = !!row.is_online && last > fiveMinutesAgo;
            setOnlineMap((prev) => ({ ...prev, [row.user_id]: isOnline }));
          },
        )
        .subscribe();
      const messagesSub = ChatService.subscribeToAllMessages((msg: Message) => {
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === msg.conversation_id);
          if (idx === -1) return prev;
          const updated = [...prev];
          const target = { ...updated[idx] };
          target.last_message = {
            ...msg,
            // biome-ignore lint/suspicious/noExplicitAny: MessageWithSender partial
          } as any;
          target.last_message_at = msg.created_at;
          // move to top by last_message_at
          updated[idx] = target;
          return updated
            .slice()
            .sort(
              (a, b) =>
                new Date(b.last_message_at || b.updated_at).getTime() -
                new Date(a.last_message_at || a.updated_at).getTime(),
            );
        });
      });

      return () => {
        conversationsSub.unsubscribe();
        messagesSub.unsubscribe();
        presenceSub.unsubscribe();
        window.removeEventListener(
          'messagesRead',
          handleMessagesRead as EventListener,
        );
      };
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: loadConversations defined after useEffect
    // biome-ignore lint/correctness/noInvalidUseBeforeDeclaration: Function hoisted logically
  }, [user?.id, conversations.map, loadConversations]);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userChats = await ChatService.getUserConversations(user.id);
      setConversations(userChats);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setSearchParams({ chat: chatId });
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setSearchParams({});
  };

  const handleStartNewChat = () => {
    // For now, redirect to find partners page
    navigate('/find-partners');
  };

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedChatId,
  );

  // Mobile view - show either list or chat
  if (isMobile) {
    if (selectedChatId && selectedConversation) {
      return (
        <div className="h-screen bg-gray-50">
          <div className="bg-orange-100 border-b border-orange-300 px-4 py-2">
            <div className="flex items-center justify-center gap-2 text-orange-900">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-semibold">Work in Progress</span>
              <span className="text-sm">
                - Not all features may work properly
              </span>
            </div>
          </div>

          <ChatWindow
            conversation={selectedConversation}
            onBack={handleBackToList}
            className="h-[calc(100vh-48px)]"
          />
        </div>
      );
    }

    return (
      <div className="h-screen bg-gray-50">
        <div className="bg-orange-100 border-b border-orange-300 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-orange-900">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-semibold">Work in Progress</span>
            <span className="text-sm">
              - Not all features may work properly
            </span>
          </div>
        </div>

        {/* Mobile Header */}
        <header className="px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            </div>
          </div>
        </header>

        <ConversationList
          conversations={conversations}
          selectedChatId={selectedChatId || undefined}
          onSelectChat={handleSelectChat}
          onStartNewChat={handleStartNewChat}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
          onlineMap={onlineMap}
        />
      </div>
    );
  }

  // Desktop view - show both list and chat
  return (
    <div className="h-screen bg-gray-50">
      <div className="bg-orange-100 border-b border-orange-300 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-orange-900">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-semibold">Work in Progress</span>
          <span className="text-sm">- Not all features may work properly</span>
        </div>
      </div>

      {/* Desktop Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          </div>

          <div className="text-sm text-gray-500">
            {conversations.length} conversation
            {conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto h-[calc(100vh-128px)] flex">
        {/* Conversation List */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <ConversationList
            conversations={conversations}
            selectedChatId={selectedChatId || undefined}
            onSelectChat={handleSelectChat}
            onStartNewChat={handleStartNewChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={loading}
            onlineMap={onlineMap}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onBack={handleBackToList}
              className="h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6"
              >
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Select a conversation
              </h2>
              <p className="text-gray-500 max-w-md mb-6">
                Choose a conversation from the sidebar to start messaging, or
                find new travel partners to chat with.
              </p>
              <button
                type="button"
                onClick={handleStartNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Find Travel Partners
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
