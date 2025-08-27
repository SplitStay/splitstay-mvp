import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { ConversationWithUser, MessageWithSender, ChatService } from '../../lib/chatService'
import { useAuth } from '../../contexts/AuthContext'
import { MessageInput } from './MessageInput'
import { EmojiReactionPicker } from './EmojiReactionPicker'
import { LinkPreviewCard } from './LinkPreviewCard'
import { FilePreview } from './FilePreview'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { extractUrls } from '../../utils/urlUtils'
import { UploadResult } from '../../lib/storageService'

interface ChatWindowProps {
  conversation: ConversationWithUser
  onBack: () => void
  className?: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack, className = '' }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [readByOther, setReadByOther] = useState<Record<string, boolean>>({})
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<{ messageId: string; position: { x: number; y: number } } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const otherUser = conversation.other_user

  useEffect(() => {
    loadMessages()
    loadPresence()
    
    // Subscribe to new messages
    const subscription = ChatService.subscribeToMessages(conversation.id, (newMessage) => {
      // Optimistic append
      setMessages(prev => [
        ...prev,
        {
          ...(newMessage as any),
          sender: newMessage.sender_id === user?.id
            ? { id: user?.id || '', name: 'You', email: '' }
            : (otherUser || { id: newMessage.sender_id, name: '', email: '' })
        } as any
      ])

      // Authoritative re-sync to guarantee consistency under RLS/ordering
      ChatService.getConversationMessages(conversation.id)
        .then(fresh => setMessages(fresh))
        .catch(() => {})
    })

    const updatesSub = ChatService.subscribeToMessageUpdates(conversation.id, (updated) => {
      setMessages(prev => prev.map(m => m.id === updated.id ? { ...(m as any), metadata: (updated as any).metadata } : m))
    })

    const readSub = ChatService.subscribeToReadReceipts((row) => {
      if (row && row.message_id && row.user_id === otherUser?.id) {
        setReadByOther(prev => ({ ...prev, [row.message_id]: true }))
      }
    })

    const presenceSub = supabase
      .channel('user-presence')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_presence', filter: `user_id=eq.${otherUser?.id}` },
        (payload) => {
          const presence = payload.new as any
          setIsOtherUserOnline(presence?.is_online || false)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      updatesSub.unsubscribe()
      readSub.unsubscribe()
      presenceSub.unsubscribe()
    }
  }, [conversation.id, otherUser?.id])

  useLayoutEffect(() => {
    // Use setTimeout to ensure DOM is fully rendered before scrolling
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 10)
    
    return () => clearTimeout(timeoutId)
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const conversationMessages = await ChatService.getConversationMessages(conversation.id)
      setMessages(conversationMessages)
      const ids = conversationMessages.map(m => m.id)
      if (user?.id && otherUser?.id) {
        const receipts = await ChatService.fetchReadReceiptsForMessages(ids, otherUser.id)
        setReadByOther(receipts)
      }
      if (user?.id) {
        await ChatService.markMessagesAsRead(conversation.id)
        // Notify parent component that messages were read
        window.dispatchEvent(new CustomEvent('messagesRead', { 
          detail: { conversationId: conversation.id } 
        }))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
      // Ensure scroll to bottom after loading is complete
      setTimeout(() => scrollToBottom(), 50)
    }
  }

  const loadPresence = async () => {
    if (!otherUser?.id) return
    try {
      const { data } = await supabase
        .from('user_presence')
        .select('is_online, last_active_at')
        .eq('user_id', otherUser.id)
        .single()
      if (data) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const lastActive = new Date(data.last_active_at || 0)
        setIsOtherUserOnline(data.is_online && lastActive > fiveMinutesAgo)
      }
    } catch (error) {
      setIsOtherUserOnline(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!user?.id || !content.trim()) return

    try {
      setSending(true)
      await ChatService.sendMessage(conversation.id, user.id, content.trim())
      // Message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (uploadResult: UploadResult) => {
    if (!user?.id) return

    try {
      setSending(true)
      // Respect DB check constraint: only use 'image' for images; fallback to 'text' for other files
      const messageType = uploadResult.mimeType.startsWith('image/') ? 'image' : 'text'
      
      const metadata = {
        file: {
          name: uploadResult.fileName,
          size: uploadResult.fileSize,
          type: uploadResult.mimeType,
          url: uploadResult.publicUrl,
          path: uploadResult.path
        }
      }

      await ChatService.sendMessage(
        conversation.id, 
        user.id, 
        uploadResult.fileName, 
        messageType, 
        metadata
      )
    } catch (error) {
      console.error('Error sending file:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use instant scroll for initial load, smooth for new messages
      const behavior = loading ? 'instant' : 'smooth'
      messagesEndRef.current.scrollIntoView({ 
        behavior: behavior as ScrollBehavior,
        block: 'end'
      })
    }
  }

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date)
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm')
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'HH:mm')}`
    } else {
      return format(messageDate, 'MMM d, HH:mm')
    }
  }

  const groupMessagesByDate = (messages: MessageWithSender[]) => {
    const groups: { [key: string]: MessageWithSender[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.created_at)
      let key: string
      
      if (isToday(date)) {
        key = 'Today'
      } else if (isYesterday(date)) {
        key = 'Yesterday'
      } else {
        key = format(date, 'MMMM d, yyyy')
      }
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(message)
    })
    
    return groups
  }

  if (loading) {
    return (
      <div className={`flex flex-col h-full bg-white ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {otherUser?.name?.[0]?.toUpperCase() || otherUser?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isOtherUserOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">
                  {otherUser?.name || otherUser?.email || 'Unknown User'}
                </h3>
                <p className={`text-sm ${isOtherUserOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {isOtherUserOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          {/* Call and options icons are currently disabled */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {otherUser?.name?.[0]?.toUpperCase() || otherUser?.email?.[0]?.toUpperCase() || '?'}
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-500 mb-4">
              Send a message to {otherUser?.name || otherUser?.email || 'this user'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(messageGroups).map(([dateKey, groupMessages]) => (
              <div key={dateKey}>
                {/* Date separator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm text-gray-500">
                    {dateKey}
                  </div>
                </div>

                {/* Messages for this date */}
                <AnimatePresence>
                  {groupMessages.map((message, index) => {
                    const isCurrentUser = message.sender.id === user?.id
                    const showAvatar = index === 0 || 
                      groupMessages[index - 1].sender_id !== message.sender_id

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex gap-3 mb-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {showAvatar && !isCurrentUser ? (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {message.sender.name?.[0]?.toUpperCase() || message.sender.email?.[0]?.toUpperCase() || '?'}
                            </div>
                          ) : (
                            <div className="w-8 h-8"></div>
                          )}
                        </div>

                        {/* Message bubble */}
                        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}>
                          {(() => {
                            const hasFile = (message as any).metadata?.file
                            if (hasFile) {
                              return (
                                <FilePreview
                                  fileName={(message as any).metadata.file.name}
                                  fileSize={(message as any).metadata.file.size}
                                  mimeType={(message as any).metadata.file.type}
                                  publicUrl={(message as any).metadata.file.url}
                                />
                              )
                            }
                            return (
                              <>
                                <div
                                  className={`px-4 py-2 rounded-2xl ${
                                    isCurrentUser
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white border border-gray-200 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {(() => {
                                  const urls = extractUrls(message.content)
                                  return urls.length > 0 ? (
                                    <div className="mt-2 space-y-2">
                                      {urls.map((url, index) => (
                                        <LinkPreviewCard key={`${message.id}-${index}`} url={url} />
                                      ))}
                                    </div>
                                  ) : null
                                })()}
                              </>
                            )
                          })()}
                          <div className={`flex items-center gap-2 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <p className={`text-xs text-gray-500`}>{formatMessageTime(message.created_at)}</p>
                            {isCurrentUser && (
                              <span className="text-[10px] text-gray-400">{readByOther[message.id] ? 'Read' : 'Sent'}</span>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {(() => {
                              const rx = ((message as any).metadata && (message as any).metadata.reactions) || {}
                              const reactionEntries = Object.entries(rx).filter(([emoji, users]) => Array.isArray(users) && users.length > 0)
                              return (
                                <>
                                  {reactionEntries.map(([emoji, users]) => {
                                    const userArray = users as string[]
                                    const active = user?.id ? userArray.includes(user.id) : false
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => user?.id && ChatService.toggleReaction(message.id, emoji, user.id)}
                                        className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                                          active 
                                            ? 'bg-blue-100 border-blue-300 text-blue-700' 
                                            : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {emoji} {userArray.length}
                                      </button>
                                    )
                                  })}
                                  <button
                                    className="px-2 py-1 rounded-full text-xs border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const rect = e.currentTarget.getBoundingClientRect()
                                      setEmojiPickerOpen({
                                        messageId: message.id,
                                        // anchor near the plus button (use right + bottom edges)
                                        position: { x: rect.right, y: rect.bottom }
                                      })
                                    }}
                                  >
                                    +
                                  </button>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput 
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          conversationId={conversation.id}
          userId={user?.id}
          disabled={sending}
          placeholder={`Message ${otherUser?.name || 'user'}...`}
        />
      </div>

      {/* Emoji Picker */}
      <EmojiReactionPicker
        isOpen={!!emojiPickerOpen}
        position={emojiPickerOpen?.position}
        onEmojiSelect={(emoji) => {
          if (emojiPickerOpen?.messageId && user?.id) {
            ChatService.toggleReaction(emojiPickerOpen.messageId, emoji, user.id)
          }
        }}
        onClose={() => setEmojiPickerOpen(null)}
      />
    </div>
  )
}