import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types';
import { env } from '../env';

export function createClient() {
    return createBrowserClient<Database>(
        env.supabase.url,
        env.supabase.anonKey
    );
}
