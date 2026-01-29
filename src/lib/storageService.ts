import { supabase } from './supabase';

export const STORAGE_BUCKET = 'chat-attachments';

export interface UploadResult {
  path: string;
  publicUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface FileValidation {
  maxSize: number;
  allowedTypes: string[];
}

export const FILE_VALIDATIONS: Record<string, FileValidation> = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  },
  document: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ],
  },
};

// biome-ignore lint/complexity/noStaticOnlyClass: Service pattern
export class StorageService {
  static async initializeBucket(): Promise<void> {
    // No-op in client: bucket management requires service role.
    // Ensure the `chat-attachments` bucket is created server-side and policies are applied.
    return;
  }

  static validateFile(file: File): {
    valid: boolean;
    error?: string;
    category?: string;
  } {
    const category = StorageService.getFileCategory(file.type);

    if (!category) {
      return { valid: false, error: 'File type not supported' };
    }

    const validation = FILE_VALIDATIONS[category];

    if (file.size > validation.maxSize) {
      const maxSizeMB = Math.round(validation.maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`,
      };
    }

    if (!validation.allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true, category };
  }

  static getFileCategory(mimeType: string): string | null {
    if (FILE_VALIDATIONS.image.allowedTypes.includes(mimeType)) return 'image';
    if (FILE_VALIDATIONS.video.allowedTypes.includes(mimeType)) return 'video';
    if (FILE_VALIDATIONS.document.allowedTypes.includes(mimeType))
      return 'document';
    return null;
  }

  static async uploadFile(
    file: File,
    conversationId: string,
  ): Promise<UploadResult> {
    // Check authentication first
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to upload files');
    }

    const validation = StorageService.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    await StorageService.initializeBucket();

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${conversationId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  static async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) throw error;
  }

  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
      return '📊';
    if (mimeType.startsWith('text/')) return '📄';
    return '📎';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  }
}
