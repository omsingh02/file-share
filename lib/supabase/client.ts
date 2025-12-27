import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing Supabase environment variables!\n' +
            'Please create a .env.local file in the root directory with:\n' +
            'NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n' +
            'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key'
        );
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
