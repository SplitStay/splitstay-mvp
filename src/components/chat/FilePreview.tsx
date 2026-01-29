import { motion } from 'framer-motion';
import { Download, FileText, Image as ImageIcon, Video } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { StorageService } from '../../lib/storageService';

interface FilePreviewProps {
  fileName: string;
  fileSize: number;
  mimeType: string;
  publicUrl: string;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileName,
  fileSize,
  mimeType,
  publicUrl,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = publicUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const isPdf = mimeType === 'application/pdf' || extension === 'pdf';
  const isDocument = !isImage && !isVideo;

  if (isImage && !imageError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative group max-w-sm ${className}`}
      >
        <img
          src={publicUrl}
          alt={fileName}
          className="rounded-lg max-w-full h-auto max-h-64 object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
          {/* biome-ignore lint/a11y/useButtonType: Download action button */}
          <button
            onClick={handleDownload}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg"
          >
            <Download className="w-4 h-4 text-gray-700" />
          </button>
        </div>
        <div className="mt-1">
          <p className="text-xs text-gray-500 truncate">{fileName}</p>
          <p className="text-xs text-gray-400">
            {StorageService.formatFileSize(fileSize)}
          </p>
        </div>
      </motion.div>
    );
  }

  if (isVideo && !videoError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative group max-w-sm ${className}`}
      >
        {/* biome-ignore lint/a11y/useMediaCaption: User uploaded video */}
        <video
          controls
          className="rounded-lg max-w-full h-auto max-h-64"
          onError={() => setVideoError(true)}
          preload="metadata"
        >
          <source src={publicUrl} type={mimeType} />
          Your browser does not support the video tag.
        </video>
        <div className="mt-1">
          <p className="text-xs text-gray-500 truncate">{fileName}</p>
          <p className="text-xs text-gray-400">
            {StorageService.formatFileSize(fileSize)}
          </p>
        </div>
      </motion.div>
    );
  }

  // PDF: show a lightweight embedded preview when possible
  if (isDocument && isPdf) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border border-gray-200 rounded-lg bg-white max-w-sm overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-red-100 text-red-700 rounded flex items-center justify-center text-xs font-semibold uppercase">
              {extension || 'pdf'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">
                {StorageService.formatFileSize(fileSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-700"
            >
              View
            </a>
            {/* biome-ignore lint/a11y/useButtonType: Download action button */}
            <button
              onClick={handleDownload}
              className="p-1 hover:bg-gray-100 rounded"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="h-56 bg-gray-50">
          <object
            data={publicUrl}
            type="application/pdf"
            width="100%"
            height="100%"
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-xs text-gray-500 p-3 text-center">
                PDF preview unavailable. Click "View" to open in a new tab.
              </div>
            </div>
          </object>
        </div>
      </motion.div>
    );
  }

  // Generic document fallback card
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors max-w-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            {isImage || imageError ? (
              <ImageIcon className="w-5 h-5 text-gray-500" />
            ) : isVideo || videoError ? (
              <Video className="w-5 h-5 text-gray-500" />
            ) : (
              <FileText className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fileName}
          </p>
          <p className="text-xs text-gray-500">
            {StorageService.formatFileSize(fileSize)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-700"
          >
            Open
          </a>
          {/* biome-ignore lint/a11y/useButtonType: Download action button */}
          <button
            onClick={handleDownload}
            className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
