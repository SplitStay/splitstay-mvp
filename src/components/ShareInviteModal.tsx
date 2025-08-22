import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import type { Tables } from '@/types/database.types';

interface ShareInviteModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  shareUrl?: string;
}

const generatePersonalizedMessage = (user: Tables<'user'> | undefined): string => {
  if (!user) {
    return "Hey! I just created my profile on SplitStay — maybe we should try it sometime. Why don't you create yours as well?";
  }

  
  // Use Vite environment variable for the base URL
  const baseUrl = import.meta.env.VITE_APP_URL;
  
  // Use customized URL if available, otherwise use ID
  const profileIdentifier = user?.personalizedLink || user?.id;
  const message = `Just joined SplitStay — it helps you connect with like-minded travelers to share accommodations and save on costs. Here’s my profile — feel free to create yours too! \n${baseUrl}/profile/${profileIdentifier}`;

  return message;
};

const ShareInviteModal: React.FC<ShareInviteModalProps> = ({
  open,
  onClose,
  message,
  shareUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const { data: user } = useUser();

  if (!open) return null;

  const personalizedMessage = message || generatePersonalizedMessage(user);
  const fullMessage = personalizedMessage;

  const handleShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join me on SplitStay!',
          text: fullMessage,
        });
        onClose();
      } catch {
        // User cancelled or error
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard error
    }
  };

  // Platform-specific share URLs
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || window.location.origin)}&quote=${encodeURIComponent(personalizedMessage)}`;
  const handleInstagramShare = async () => {
    await navigator.clipboard.writeText(fullMessage);
    alert('Message copied! Open Instagram and paste it in a DM or Story.');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl w-full max-w-sm sm:max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 mb-3 sm:mb-4 text-center">
          Share Your Profile & Invite Friends
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 text-center">
          Invite your friends to join SplitStay! Sharing is optional, but helps us grow.
        </p>
        <textarea
          className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg mb-3 sm:mb-4 text-gray-800 resize-none text-xs sm:text-sm"
          rows={3}
          value={fullMessage}
          readOnly
        />
        <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
          {typeof navigator.share === 'function' && (
            <button
              onClick={handleShare}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Share via Device...
            </button>
          )}
          <button
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="w-full bg-green-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm sm:text-base"
          >
            Share on WhatsApp
          </button>
          <button
            onClick={() => window.open(facebookUrl, '_blank')}
            className="w-full bg-blue-800 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-blue-900 transition-colors text-sm sm:text-base"
          >
            Share on Facebook
          </button>
          <button
            onClick={handleInstagramShare}
            className="w-full bg-pink-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-pink-600 transition-colors text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Share on Instagram (Copy to Clipboard)</span>
            <span className="sm:hidden">Instagram</span>
          </button>
          <button
            onClick={handleCopy}
            className="w-full bg-gray-100 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base"
          >
            {copied ? 'Copied!' : 'Copy Message'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full text-gray-500 hover:text-blue-600 transition-colors text-xs sm:text-sm underline"
        >
          Skip
        </button>
      </motion.div>
    </div>
  );
};

export default ShareInviteModal;