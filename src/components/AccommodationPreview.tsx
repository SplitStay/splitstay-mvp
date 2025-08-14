import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import type { AccommodationPreview as AccommodationPreviewType } from '../lib/iframely';

interface Props {
  preview: AccommodationPreviewType;
  className?: string;
}

export const AccommodationPreview: React.FC<Props> = ({ preview, className = '' }) => {
  if (preview.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border border-gray-200 rounded-lg p-6 bg-gray-50 ${className}`}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading accommodation preview...</span>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Image Section */}
      {preview.image && (
        <div className="relative h-48 bg-gray-100">
          <img
            src={preview.image}
            alt={preview.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Overlay with site info */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
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
              <span className="text-xs font-medium text-gray-700">
                {preview.site}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1">
            {preview.title}
          </h3>
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
            title="View on booking site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {preview.author && (
          <p className="text-sm text-gray-600 mb-2">
            by {preview.author}
          </p>
        )}

        {preview.description && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {preview.description}
          </p>
        )}

        {/* Bottom section with site info if no image */}
        {!preview.image && preview.site && (
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
