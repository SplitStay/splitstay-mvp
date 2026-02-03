import { motion } from 'framer-motion';
import type React from 'react';
import { useState } from 'react';
import type { z } from 'zod';
import type { PartialTripFormDataSchema } from '../../lib/schemas/tripFormSchema';

type PartialTripFormData = z.infer<typeof PartialTripFormDataSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  trip: PartialTripFormData & { id?: string };
}

const defaultShareMessage =
  'Check out my new trip on SplitStay! Join me or post your own adventure:';

const PostTripSuccessModal: React.FC<Props> = ({ open, onClose, trip }) => {
  const tripUrl = `${window.location.origin}/trip/${trip.id || ''}`;
  const [shareText, setShareText] = useState(
    `${defaultShareMessage}\n${tripUrl}`,
  );
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join my trip on SplitStay!',
          text: shareText,
        });
        onClose();
      } catch {
        // User cancelled or error
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard error - fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Platform-specific share URLs
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tripUrl)}&quote=${encodeURIComponent(shareText)}`;
  // Instagram does not support direct text sharing; we copy to clipboard and instruct the user
  const handleInstagramShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Message copied! Open Instagram and paste it in a DM or Story.');
    } catch {
      // Clipboard error - fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Message copied! Open Instagram and paste it in a DM or Story.');
    }
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
        <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
          🎉 Your trip is live!
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Share your trip with friends and invite them to join.
        </p>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-800 resize-none"
          rows={3}
          value={shareText}
          onChange={(e) => setShareText(e.target.value)}
          placeholder="Enter your message..."
        />
        <div className="flex flex-col gap-3 mb-4">
          {typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleShare}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Share via Device...
            </button>
          )}
          <button
            type="button"
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Share on WhatsApp
          </button>
          <button
            type="button"
            onClick={() => window.open(facebookUrl, '_blank')}
            className="w-full bg-blue-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-900 transition-colors"
          >
            Share on Facebook
          </button>
          <button
            type="button"
            onClick={handleInstagramShare}
            className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-600 transition-colors"
          >
            Share on Instagram (Copy to Clipboard)
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Trip Link & Message'}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-gray-500 hover:text-blue-600 transition-colors text-sm underline"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default PostTripSuccessModal;
