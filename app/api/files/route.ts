import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get files from database
        const adminClient = createAdminClient();
        const { data: files, error } = await adminClient
            .from('files')
            .select('*')
            .eq('uploaded_by', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
        }

        // Transform to camelCase
        const transformedFiles = files.map(file => ({
            id: file.id,
            filename: file.filename,
            originalFilename: file.original_filename,
            filePath: file.file_path,
            fileSize: file.file_size,
            mimeType: file.mime_type,
            shortCode: file.short_code,
            uploadedBy: file.uploaded_by,
            createdAt: file.created_at,
            updatedAt: file.updated_at,
            shortUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${file.short_code}`,
        }));

        return NextResponse.json({ files: transformedFiles });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
