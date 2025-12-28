import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeShortCode, sanitizeUserIdentifier } from '@/lib/utils/sanitization';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shortCode = searchParams.get('shortCode');
    const userIdentifier = searchParams.get('userIdentifier');

    if (!shortCode || !userIdentifier) {
        return new Response('Missing parameters', { status: 400 });
    }

    // Sanitize inputs
    const sanitizedShortCode = sanitizeShortCode(shortCode);
    const sanitizedUserIdentifier = sanitizeUserIdentifier(userIdentifier);

    if (!sanitizedShortCode || !sanitizedUserIdentifier) {
        return new Response('Invalid parameters', { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const adminClient = createAdminClient();
            let heartbeat: NodeJS.Timeout | null = null;
            let checkInterval: NodeJS.Timeout | null = null;
            let channel: any = null;

            try {
                // Get file and access info
                const { data: file } = await adminClient
                    .from('files')
                    .select('id')
                    .eq('short_code', sanitizedShortCode)
                    .single();

                if (!file) {
                    controller.close();
                    return;
                }

                // Get the specific access record to monitor
                const { data: accessRecord } = await adminClient
                    .from('file_access')
                    .select('id')
                    .eq('file_id', (file as any).id)
                    .eq('user_identifier', sanitizedUserIdentifier)
                    .single();

                if (!accessRecord) {
                    controller.close();
                    return;
                }

                // Helper function to cleanup and close
                const cleanup = () => {
                    if (heartbeat) clearInterval(heartbeat);
                    if (checkInterval) clearInterval(checkInterval);
                    if (channel) channel.unsubscribe();
                };

                // Subscribe to changes in file_access table for this specific user
                channel = adminClient
                    .channel(`access_${shortCode}_${userIdentifier}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'file_access',
                            filter: `id=eq.${(accessRecord as any).id}`,
                        },
                        async (payload) => {
                            // Check if this user's access was affected
                            if (payload.eventType === 'DELETE') {
                                // Access was deleted - revoke immediately
                                controller.enqueue(
                                    encoder.encode(`data: ${JSON.stringify({ revoked: true })}\n\n`)
                                );
                                cleanup();
                                controller.close();
                            } else if (payload.eventType === 'UPDATE') {
                                const updated = payload.new as any;
                                // Check if expired
                                if (updated.expires_at && new Date(updated.expires_at) < new Date()) {
                                    controller.enqueue(
                                        encoder.encode(`data: ${JSON.stringify({ expired: true })}\n\n`)
                                    );
                                    cleanup();
                                    controller.close();
                                }
                            }
                        }
                )
                .subscribe();                // Periodically check access status (fallback in case realtime fails)
                checkInterval = setInterval(async () => {
                    try {
                        const { data: currentAccess, error } = await adminClient
                            .from('file_access')
                            .select('expires_at')
                            .eq('id', (accessRecord as any).id)
                            .maybeSingle();

                        if (error || !currentAccess) {
                            // Access was deleted
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ revoked: true })}\n\n`)
                            );
                            cleanup();
                            controller.close();
                        } else if ((currentAccess as any).expires_at && new Date((currentAccess as any).expires_at) < new Date()) {
                            // Access expired
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ expired: true })}\n\n`)
                            );
                            cleanup();
                            controller.close();
                        }
                    } catch (err) {
                        // Silently handle polling errors
                    }
                }, 5000); // Check every 5 seconds

                // Keep connection alive with heartbeat
                heartbeat = setInterval(() => {
                    controller.enqueue(encoder.encode(`: heartbeat\n\n`));
                }, 30000); // 30 seconds

                // Cleanup on disconnect
                request.signal.addEventListener('abort', () => {
                    cleanup();
                    controller.close();
                });
            } catch (error) {
                controller.close();
            }
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
