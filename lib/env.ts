/**
 * Environment variable validation and configuration
 * Validates required environment variables at build/runtime
 */

function getEnvVar(key: string, required: boolean = true): string {
    const value = process.env[key];
    
    if (!value && required) {
        // Only throw during build time (server-side), not in browser
        if (typeof window === 'undefined') {
            throw new Error(
                `Missing required environment variable: ${key}\n` +
                `Please add it to your Vercel environment variables or .env.local file.`
            );
        } else {
            console.error(`Missing required environment variable: ${key}`);
        }
    }
    
    return value || '';
}

// Client-side environment variables (NEXT_PUBLIC_*)
// These are safe to access anywhere
export const env = {
    // Supabase public config
    supabase: {
        url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
        anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    },
    
    // Application
    app: {
        url: getEnvVar('NEXT_PUBLIC_APP_URL'),
    },
} as const;

// Server-side only environment variables
// These should only be accessed in server components, API routes, or server actions
export const serverEnv = {
    supabase: {
        serviceRoleKey: typeof window === 'undefined' 
            ? getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
            : '',
    },
} as const;

// Type-safe environment variables
export type Env = typeof env;
export type ServerEnv = typeof serverEnv;
