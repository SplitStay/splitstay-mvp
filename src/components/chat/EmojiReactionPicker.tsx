import React, { useState, useRef, useEffect } from 'react'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EmojiReactionPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
  isOpen: boolean
  position?: { x: number; y: number }
}

export const EmojiReactionPicker: React.FC<EmojiReactionPickerProps> = ({
  onEmojiSelect,
  onClose,
  isOpen,
  position
}) => {
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, scale: 0.96, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 4 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 shadow-2xl rounded-lg overflow-hidden"
        style={{
          // Position anchored near the trigger button with viewport clamping
          left: position?.x !== undefined ? `${Math.min(Math.max(position.x - 320, 10), window.innerWidth - 320)}px` : '50%',
          top: position?.y !== undefined ? `${Math.min(Math.max(position.y + 8, 10), window.innerHeight - 420)}px` : '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={Theme.LIGHT}
          width={320}
          height={400}
          searchDisabled={false}
          previewConfig={{
            showPreview: false
          }}
          reactionsDefaultOpen={true}
          reactions={[
            '1f44d', // 👍
            '2764-fe0f', // ❤️
            '1f602', // 😂
            '1f62e', // 😮
            '1f622', // 😢
            '1f621' // 😡
          ]}
        />
      </motion.div>
    </AnimatePresence>
  )
}
