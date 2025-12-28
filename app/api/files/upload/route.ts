import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateShortCode } from '@/lib/utils/shortCode';
import { rateLimit, getClientIdentifier } from '@/lib/utils/ratelimit';
import { validateFile } from '@/lib/utils/fileTypes';
import { sanitizeFilename } from '@/lib/utils/sanitization';
import { env } from '@/lib/env';

// Helper function to detect MIME type from file extension
function getMimeTypeFromExtension(filename: string, browserMimeType: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const mimeTypeMap: Record<string, string> = {
        // Markdown
        'md': 'text/markdown',
        'markdown': 'text/markdown',
        
        // Text files
        'txt': 'text/plain',
        'csv': 'text/csv',
        
        // Code files
        'json': 'application/json',
        'xml': 'application/xml',
        'js': 'text/javascript',
        'ts': 'text/typescript',
        'jsx': 'text/javascript',
        'tsx': 'text/typescript',
        'css': 'text/css',
        'html': 'text/html',
        'htm': 'text/html',
        
        // Documents
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        
        // Video
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogv': 'video/ogg',
        
        // Audio
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'oga': 'audio/ogg',
        
        // Archives
        'zip': 'application/zip',
        'tar': 'application/x-tar',
        'gz': 'application/gzip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
    };
    
    // If we have a mapped MIME type for this extension, use it
    // Otherwise, fall back to browser-provided MIME type
    return ext && mimeTypeMap[ext] ? mimeTypeMap[ext] : browserMimeType || 'application/octet-stream';
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: 10 uploads per 5 minutes per IP
        const identifier = getClientIdentifier(request);
        const { success } = rateLimit(identifier, 10, 5 * 60 * 1000);
        
        if (!success) {
            return NextResponse.json(
                { error: 'Upload limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // Verify admin authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get file from form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file size, type, and extension
        const validation = validateFile(file);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Sanitize the original filename to prevent XSS
        const sanitizedOriginalFilename = sanitizeFilename(file.name);

        // Generate unique filename and short code
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const shortCode = generateShortCode();
        
        // Get correct MIME type (prefer extension-based detection over browser-provided)
        const contentType = getMimeTypeFromExtension(sanitizedOriginalFilename, file.type);

        // Upload to Supabase Storage
        const adminClient = createAdminClient();
        const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('files')
            .upload(uniqueFilename, file, {
                contentType,
                cacheControl: '3600',
            });

        if (uploadError) {
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
        }

        // Save file metadata to database
        const { data: fileData, error: dbError } = await adminClient
            .from('files')
            .insert({
                filename: uniqueFilename,
                original_filename: sanitizedOriginalFilename,
                file_path: uploadData.path,
                file_size: file.size,
                mime_type: contentType,
                short_code: shortCode,
                uploaded_by: user.id,
            } as any)
            .select()
            .single();

        if (dbError) {
            // Clean up uploaded file
            await adminClient.storage.from('files').remove([uniqueFilename]);
            return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            file: {
                id: (fileData as any).id,
                filename: (fileData as any).filename,
                originalFilename: (fileData as any).original_filename,
                shortCode: (fileData as any).short_code,
                shortUrl: `${env.app.url}/${(fileData as any).short_code}`,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
