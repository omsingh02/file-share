import { FileCategory, FileTypeInfo } from '../types';

const MIME_TYPE_CATEGORIES: Record<string, FileCategory> = {
    // Images
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'image/svg+xml': 'image',
    'image/bmp': 'image',
    'image/tiff': 'image',

    // Videos
    'video/mp4': 'video',
    'video/webm': 'video',
    'video/ogg': 'video',
    'video/quicktime': 'video',
    'video/x-msvideo': 'video',
    'video/x-matroska': 'video',

    // Audio
    'audio/mpeg': 'audio',
    'audio/mp3': 'audio',
    'audio/wav': 'audio',
    'audio/ogg': 'audio',
    'audio/webm': 'audio',
    'audio/aac': 'audio',
    'audio/flac': 'audio',

    // PDFs
    'application/pdf': 'pdf',

    // Documents
    'application/msword': 'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
    'application/vnd.ms-excel': 'document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
    'application/vnd.ms-powerpoint': 'document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
    'text/plain': 'document',
    'text/csv': 'document',
};

const PREVIEWABLE_TYPES: Set<FileCategory> = new Set(['image', 'video', 'audio', 'pdf']);

/**
 * Gets file type information from MIME type
 */
export function getFileTypeInfo(mimeType: string): FileTypeInfo {
    const category = MIME_TYPE_CATEGORIES[mimeType] || 'other';
    const canPreview = PREVIEWABLE_TYPES.has(category);

    return {
        category,
        canPreview,
        icon: getIconForCategory(category),
    };
}

/**
 * Gets an icon name for a file category
 */
function getIconForCategory(category: FileCategory): string {
    const icons: Record<FileCategory, string> = {
        image: '🖼️',
        video: '🎥',
        audio: '🎵',
        pdf: '📄',
        document: '📝',
        other: '📎',
    };
    return icons[category];
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
