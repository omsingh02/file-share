import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateShortCode } from '@/lib/utils/shortCode';

export async function POST(request: NextRequest) {
    try {
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

        // Generate unique filename and short code
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const shortCode = generateShortCode();

        // Upload to Supabase Storage
        const adminClient = createAdminClient();
        const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('files')
            .upload(uniqueFilename, file, {
                contentType: file.type,
                cacheControl: '3600',
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
        }

        // Save file metadata to database
        const { data: fileData, error: dbError } = await adminClient
            .from('files')
            .insert({
                filename: uniqueFilename,
                original_filename: file.name,
                file_path: uploadData.path,
                file_size: file.size,
                mime_type: file.type,
                short_code: shortCode,
                uploaded_by: user.id,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // Clean up uploaded file
            await adminClient.storage.from('files').remove([uniqueFilename]);
            return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            file: {
                id: fileData.id,
                filename: fileData.filename,
                originalFilename: fileData.original_filename,
                shortCode: fileData.short_code,
                shortUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${fileData.short_code}`,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
