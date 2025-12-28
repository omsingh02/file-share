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

// Validate and export environment variables
export const env = {
    // Supabase
    supabase: {
        url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
        anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    },
    
    // Application
    app: {
        url: getEnvVar('NEXT_PUBLIC_APP_URL'),
    },
} as const;

// Type-safe environment variables
export type Env = typeof env;
