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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md mx-4"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Share Your Profile & Invite Friends
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Invite your friends to join SplitStay! Sharing is optional, but helps us grow.
        </p>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-800 resize-none"
          rows={4}
          value={fullMessage}
          readOnly
        />
        <div className="flex flex-col gap-3 mb-4">
          {typeof navigator.share === 'function' && (
            <button
              onClick={handleShare}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Share via Device...
            </button>
          )}
          <button
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Share on WhatsApp
          </button>
          <button
            onClick={() => window.open(facebookUrl, '_blank')}
            className="w-full bg-blue-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 transition-colors"
          >
            Share on Facebook
          </button>
          <button
            onClick={handleInstagramShare}
            className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-600 transition-colors"
          >
            Share on Instagram (Copy to Clipboard)
          </button>
          <button
            onClick={handleCopy}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Message'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full text-gray-500 hover:text-blue-600 transition-colors text-sm underline"
        >
          Skip
        </button>
      </motion.div>
    </div>
  );
};

export default ShareInviteModal;