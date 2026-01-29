import { motion } from 'framer-motion';
import { AlertCircle, ExternalLink, Loader2, Shield } from 'lucide-react';
import type React from 'react';
import type { AccommodationPreview as AccommodationPreviewType } from '../lib/iframely';

interface Props {
  preview: AccommodationPreviewType;
  className?: string;
  imageAspectRatio?: 'square' | 'landscape' | 'wide' | 'auto';
}

export const AccommodationPreview: React.FC<Props> = ({
  preview,
  className = '',
  imageAspectRatio = 'landscape',
}) => {
  // Get aspect ratio classes based on prop
  const getAspectRatioClass = () => {
    switch (imageAspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'landscape':
        return 'aspect-[4/3]';
      case 'wide':
        return 'aspect-[16/9]';
      case 'auto':
        return 'aspect-[16/10] sm:aspect-[4/3] md:aspect-[16/10]';
      default:
        return 'aspect-[4/3]';
    }
  };
  if (preview.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border border-gray-200 rounded-lg p-6 bg-gray-50 ${className}`}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">
            Loading accommodation preview...
          </span>
        </div>
      </motion.div>
    );
  }

  if (preview.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border border-red-200 rounded-lg p-6 bg-red-50 ${className}`}
      >
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{preview.error}</span>
        </div>
      </motion.div>
    );
  }

  if (!preview.title && !preview.image) {
    return null;
  }

  // Check if this is a blocked booking site
  const isBlockedBookingSite =
    !preview.image && preview.description.includes('security measures');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Image Section or Blocked Site Header */}
      {preview.image ? (
        <div
          className={`relative ${getAspectRatioClass()} bg-gray-100 overflow-hidden`}
        >
          <img
            src={preview.image}
            alt={preview.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Overlay with site info */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-white/20">
              {preview.favicon && (
                <img
                  src={preview.favicon}
                  alt={preview.site}
                  className="w-4 h-4 mr-2 rounded-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span className="text-xs font-semibold text-gray-800">
                {preview.site}
              </span>
            </div>
          </div>

          {/* External link indicator */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg border border-white/20">
              <ExternalLink className="w-3.5 h-3.5 text-gray-700" />
            </div>
          </div>
        </div>
      ) : isBlockedBookingSite ? (
        <div className="relative h-32 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <div className="flex items-center space-x-2">
                {preview.favicon && (
                  <img
                    src={preview.favicon}
                    alt={preview.site}
                    className="w-5 h-5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="font-semibold text-gray-800">
                  {preview.site}
                </span>
              </div>
              <span className="text-sm text-gray-600">Secure Booking Site</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Content Section */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1 line-clamp-2">
            {preview.title}
          </h3>
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
            title="View on booking site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {preview.author && (
          <p className="text-sm text-gray-600 mb-2">by {preview.author}</p>
        )}

        {preview.description && (
          <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
            {preview.description}
          </p>
        )}

        {/* Prominent button for blocked booking sites */}
        {isBlockedBookingSite && (
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on {preview.site}
          </a>
        )}

        {/* Bottom section with site info if no image and not blocked */}
        {!preview.image && preview.site && !isBlockedBookingSite && (
          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
            {preview.favicon && (
              <img
                src={preview.favicon}
                alt={preview.site}
                className="w-4 h-4 mr-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-xs text-gray-500 font-medium">
              {preview.site}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccommodationPreview;
