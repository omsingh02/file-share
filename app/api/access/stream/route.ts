import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shortCode = searchParams.get('shortCode');
    const userIdentifier = searchParams.get('userIdentifier');

    if (!shortCode || !userIdentifier) {
        return new Response('Missing parameters', { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const adminClient = createAdminClient();

            // Get file and access info
            const { data: file } = await adminClient
                .from('files')
                .select('id')
                .eq('short_code', shortCode)
                .single();

            if (!file) {
                controller.close();
                return;
            }

            // Subscribe to changes in file_access table
            const channel = adminClient
                .channel(`access_${shortCode}_${userIdentifier}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'file_access',
                        filter: `file_id=eq.${(file as any).id}`,
                    },
                    async (payload) => {
                        // Check if this user's access was affected
                        if (payload.eventType === 'DELETE') {
                            const deleted = payload.old as any;
                            if (deleted.user_identifier === userIdentifier) {
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({ revoked: true })}\n\n`)
                                );
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            const updated = payload.new as any;
                            if (updated.user_identifier === userIdentifier) {
                                // Check if expired
                                if (updated.expires_at && new Date(updated.expires_at) < new Date()) {
                                    controller.enqueue(
                                        encoder.encode(`data: ${JSON.stringify({ expired: true })}\n\n`)
                                    );
                                }
                            }
                        }
                    }
                )
                .subscribe();

            // Keep connection alive with heartbeat
            const heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode(`: heartbeat\n\n`));
            }, 30000); // 30 seconds

            // Cleanup on disconnect
            request.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                channel.unsubscribe();
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
