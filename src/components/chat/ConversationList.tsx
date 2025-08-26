import React from 'react'
import { motion } from 'framer-motion'
import { Search, MoreVertical } from 'lucide-react'
import { ConversationWithUser } from '../../lib/chatService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'

interface ConversationListProps {
  conversations: ConversationWithUser[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  onStartNewChat: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  loading?: boolean
  onlineMap?: Record<string, boolean>
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedChatId,
  onSelectChat,
  onStartNewChat,
  searchQuery,
  onSearchChange,
  loading = false,
  onlineMap = {}
}) => {
  const { user } = useAuth()

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.other_user
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex-1 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 mb-2">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <button
            onClick={onStartNewChat}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try searching with different keywords' 
                : 'Start a conversation with a travel partner'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={onStartNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start New Chat
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv) => {
              const otherUser = conv.other_user
              const isSelected = selectedChatId === conv.id
              
              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 border-l-4 ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-200 border-l-blue-500' 
                      : conv.unread_count && conv.unread_count > 0
                        ? 'bg-blue-25 border border-blue-100 border-l-blue-400 shadow-sm'
                        : 'hover:bg-gray-50 border-l-transparent border border-transparent'
                  }`}
                  onClick={() => onSelectChat(conv.id)}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {otherUser?.name?.[0]?.toUpperCase() || otherUser?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Online indicator (realtime) */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${onlineMap[otherUser?.id || ''] ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`truncate ${
                        conv.unread_count && conv.unread_count > 0 
                          ? 'font-semibold text-gray-900' 
                          : 'font-medium text-gray-900'
                      }`}>
                        {otherUser?.name || otherUser?.email || 'Unknown User'}
                      </h3>
                      {conv.last_message && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        conv.unread_count && conv.unread_count > 0 
                          ? 'text-gray-900 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {conv.last_message?.content || 'No messages yet'}
                      </p>
                      {conv.unread_count && conv.unread_count > 0 && (
                        <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
