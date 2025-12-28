import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';
import { env, serverEnv } from '../env';

export function createAdminClient() {
    return createClient<Database>(
        env.supabase.url,
        serverEnv.supabase.serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        }
    );
}
