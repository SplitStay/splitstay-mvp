import { motion } from 'framer-motion';
import { AlertCircle, ExternalLink } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { type AccommodationPreview, iframelyService } from '../../lib/iframely';

interface LinkPreviewCardProps {
  url: string;
  className?: string;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
  url,
  className = '',
}) => {
  const [preview, setPreview] = useState<AccommodationPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPreview = async () => {
      try {
        setLoading(true);
        const result = await iframelyService.getAccommodationPreview(url);
        if (isMounted) {
          setPreview(result);
        }
      } catch (_error) {
        if (isMounted) {
          setPreview({
            title: 'Link Preview',
            description: 'Unable to load preview for this link',
            image: '',
            site: '',
            author: '',
            url,
            favicon: '',
            isLoading: false,
            error: 'Failed to load preview',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div
        className={`border border-gray-200 rounded-lg p-3 bg-gray-50 animate-pulse ${className}`}
      >
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!preview || preview.error) {
    return (
      <div
        className={`border border-gray-200 rounded-lg p-3 bg-gray-50 ${className}`}
      >
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Unable to load link preview</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 ml-auto flex items-center gap-1"
          >
            Visit <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors ${className}`}
    >
      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-gray-50 transition-colors"
      >
        <div className="p-3">
          <div className="flex gap-3">
            {preview.image && (
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={preview.image}
                  alt={preview.title}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {preview.title && (
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                  {preview.title}
                </h3>
              )}
              {preview.description && (
                <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                  {preview.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {preview.favicon && (
                  <img
                    src={preview.favicon}
                    alt=""
                    className="w-4 h-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <span className="truncate">
                  {preview.site || new URL(preview.url).hostname}
                </span>
                <ExternalLink className="w-3 h-3 ml-auto flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
};
