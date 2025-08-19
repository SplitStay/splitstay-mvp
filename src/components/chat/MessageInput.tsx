import React, { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUpload } from './FileUpload'
import { UploadResult } from '../../lib/storageService'
import { EmojiReactionPicker } from './EmojiReactionPicker'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onFileUpload?: (uploadResult: UploadResult) => void
  conversationId?: string
  userId?: string
  disabled?: boolean
  placeholder?: string
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onFileUpload,
  conversationId,
  userId,
  disabled = false,
  placeholder = 'Type a message...'
}) => {
  const [message, setMessage] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [emojiPosition, setEmojiPosition] = useState<{ x: number; y: number } | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const openEmojiPicker = () => {
    const rect = emojiBtnRef.current?.getBoundingClientRect()
    if (rect) {
      setEmojiPosition({ x: rect.right, y: rect.bottom })
    } else {
      setEmojiPosition(undefined)
    }
    setEmojiOpen(true)
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-center gap-3">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => setShowFileUpload(!showFileUpload)}
          className={`flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors ${
            showFileUpload ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
          }`}
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            rows={1}
          />
          
          {/* Emoji button */}
          <button
            ref={emojiBtnRef}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={disabled}
            onClick={openEmojiPicker}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={disabled || !message.trim()}
          className={`flex-shrink-0 p-3 rounded-full transition-colors ${
            message.trim() && !disabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={message.trim() && !disabled ? { scale: 1.05 } : {}}
          whileTap={message.trim() && !disabled ? { scale: 0.95 } : {}}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      {/* File Upload */}
      <AnimatePresence>
        {showFileUpload && conversationId && userId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <FileUpload
              conversationId={conversationId}
              userId={userId}
              onFileSelect={(result) => {
                onFileUpload?.(result)
                setShowFileUpload(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker for composing */}
      <EmojiReactionPicker
        isOpen={emojiOpen}
        position={emojiPosition}
        onEmojiSelect={(e) => handleEmojiSelect(e)}
        onClose={() => setEmojiOpen(false)}
      />
    </form>
  )
}

