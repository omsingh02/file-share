import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';
import { env } from '../env';

export function createAdminClient() {
    return createClient<Database>(
        env.supabase.url,
        env.supabase.serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
