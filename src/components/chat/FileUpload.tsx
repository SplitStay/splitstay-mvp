import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react'
import { StorageService, UploadResult } from '../../lib/storageService'

interface FileUploadProps {
  onFileSelect: (uploadResult: UploadResult) => void
  conversationId: string
  userId: string
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
  result?: UploadResult
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  conversationId,
  userId,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    
    const newUploads: UploadingFile[] = fileArray.map(file => ({
      file,
      progress: 0
    }))

    setUploadingFiles(prev => [...prev, ...newUploads])

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const uploadIndex = uploadingFiles.length + i

      try {
        const validation = StorageService.validateFile(file)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        setUploadingFiles(prev => 
          prev.map((upload, idx) => 
            idx === uploadIndex ? { ...upload, progress: 50 } : upload
          )
        )

        const result = await StorageService.uploadFile(file, conversationId)

        setUploadingFiles(prev => 
          prev.map((upload, idx) => 
            idx === uploadIndex ? { ...upload, progress: 100, result } : upload
          )
        )

        onFileSelect(result)

        setTimeout(() => {
          setUploadingFiles(prev => prev.filter((_, idx) => idx !== uploadIndex))
        }, 2000)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        setUploadingFiles(prev => 
          prev.map((upload, idx) => 
            idx === uploadIndex ? { ...upload, error: errorMessage } : upload
          )
        )
      }
    }
  }, [conversationId, userId, onFileSelect, uploadingFiles.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }, [handleFiles])

  const removeUpload = useCallback((index: number) => {
    setUploadingFiles(prev => prev.filter((_, idx) => idx !== index))
  }, [])

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }
        `}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className={`text-sm font-medium ${isDragOver ? 'text-blue-700' : 'text-gray-700'}`}>
          {isDragOver ? 'Drop files here' : 'Click to upload or drag files here'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Images (10MB), Videos (50MB), Documents (25MB)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        />
      </div>

      <AnimatePresence>
        {uploadingFiles.map((upload, index) => (
          <motion.div
            key={`${upload.file.name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 p-3 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">
                  {StorageService.getFileIcon(upload.file.type)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {StorageService.formatFileSize(upload.file.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {upload.error ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : upload.progress === 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                
                <button
                  onClick={() => removeUpload(index)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
            
            {upload.error ? (
              <p className="text-xs text-red-600">{upload.error}</p>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
