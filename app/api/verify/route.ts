import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPassword } from '@/lib/utils/crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shortCode, userIdentifier, password } = body;

        if (!shortCode || !userIdentifier || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // Get file by short code
        const { data: file, error: fileError } = await adminClient
            .from('files')
            .select('*')
            .eq('short_code', shortCode)
            .single();

        if (fileError || !file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Get access grant
        const { data: access, error: accessError } = await adminClient
            .from('file_access')
            .select('*')
            .eq('file_id', (file as any).id)
            .eq('user_identifier', userIdentifier)
            .single();

        if (accessError || !access) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Check if expired
        if ((access as any).expires_at && new Date((access as any).expires_at) < new Date()) {
            return NextResponse.json({ error: 'Access expired' }, { status: 403 });
        }

        // Verify password
        const isValid = await verifyPassword(password, (access as any).password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
        }

        // Update access count
        await adminClient
            .from('file_access')
            .update({
                access_count: (access as any).access_count + 1,
                last_accessed: new Date().toISOString(),
            } as any)
            .eq('id', (access as any).id);

        // Get signed URL for file
        const { data: signedUrlData, error: urlError } = await adminClient.storage
            .from('files')
            .createSignedUrl((file as any).filename, 3600); // 1 hour expiry

        if (urlError || !signedUrlData) {
            return NextResponse.json({ error: 'Failed to generate file URL' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            fileUrl: signedUrlData.signedUrl,
            file: {
                id: (file as any).id,
                originalFilename: (file as any).original_filename,
                mimeType: (file as any).mime_type,
                fileSize: (file as any).file_size,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
