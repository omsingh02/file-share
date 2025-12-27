# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dapcvedqziqhuwpkcvpy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_jTgvyZhl7uDEpbtau8vAxQ_lMgmWlMg
SUPABASE_SERVICE_ROLE_KEY=sb_secret_PJSPteFMMsOz4wXMF1GnGg_Wwhx1OwC
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: The variable is still named `NEXT_PUBLIC_SUPABASE_ANON_KEY` for compatibility with Supabase client libraries, but you should use the **Publishable API Key** from Supabase.

## Getting Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Navigate to **Project Settings** > **API**
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable API Key** (under "Publishable key" section) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Secret Key** (click "Reveal" to see it, under "Secret keys" section) → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Important**: The Secret Key (service role key) should NEVER be exposed in client-side code or committed to version control. Only use it in server-side API routes.

## For Production (Cloudflare Pages)

Set these environment variables in your Cloudflare Pages project settings, and update:
```env
NEXT_PUBLIC_APP_URL=https://files.omsingh.me
```
