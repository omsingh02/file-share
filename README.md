# File Share - Secure File Sharing Platform

A modern, secure file-sharing web application with admin panel, multi-user access control, time-based permissions, and comprehensive file preview/streaming capabilities.

## Features

✨ **Admin Panel**
- Secure authentication with Supabase Auth
- Drag-and-drop file upload
- File management (view, delete)
- Access control management
- Dashboard with statistics

🔐 **Access Control**
- Individual passwords for each user
- Time-based access expiration
- Access analytics (view count, last accessed)
- Revoke access anytime

🔗 **Short URLs**
- Auto-generated 6-character short codes
- Clean, shareable links (e.g., `omsingh.me/abc123`)

📁 **File Preview**
- Images: Direct preview with zoom
- Videos: HTML5 player with controls
- Audio: HTML5 audio player
- PDFs: Embedded viewer
- Documents: Download with file info

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Custom CSS (Glassmorphism)
- **Backend**: Supabase (Database, Storage, Auth)
- **Deployment**: Cloudflare Pages
- **Security**: bcrypt password hashing, Row Level Security (RLS)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cloudflare account (for deployment)

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the SQL from `supabase-schema.sql`
3. Go to **Storage** and create a new bucket named `files` (make it private)
4. Go to **Authentication** > **Providers** and enable Email provider
5. Create an admin user:
   - Go to **Authentication** > **Users**
   - Click "Add user" > "Create new user"
   - Enter your email and password
6. Get your credentials from **Project Settings** > **API**:
   - **Project URL**
   - **Publishable API Key** (this is the new name for the public/anon key)
   - **Secret Key** (keep this secret! Only use in server-side code)

### 3. Local Development

1. Clone the repository:
```bash
cd file-share
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (see `ENV_SETUP.md` for details):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: Use the **Publishable API Key** for `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the variable name is kept for compatibility)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

6. Login with your admin credentials at `/login`

### 4. Cloudflare Pages Deployment

1. Push your code to GitHub

2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)

3. Create a new project:
   - Connect your GitHub repository
   - Framework preset: **Next.js**
   - Build command: `npm run build`
   - Build output directory: `.next`

4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your custom domain, e.g., `https://omsingh.me`)

5. Deploy!

6. Set up custom domain:
   - Go to your project > **Custom domains**
   - Add `omsingh.me`
   - Update your DNS records as instructed

## Usage

### Admin Workflow

1. **Login**: Go to `/login` and sign in with your admin credentials
2. **Upload Files**: Drag and drop files or click to browse
3. **Manage Access**:
   - Click "🔐 Access" on any file
   - Add user identifier (email/username)
   - Set a password (or generate one)
   - Optionally set expiry date/time
4. **Share**: Copy the short link and share it with the user along with their credentials

### User Workflow

1. **Access File**: Open the short link (e.g., `omsingh.me/abc123`)
2. **Verify**: Enter your email/username and password
3. **View/Download**: Preview the file or download it

## Project Structure

```
file-share/
├── app/
│   ├── (admin)/          # Protected admin routes
│   │   ├── dashboard/    # Admin dashboard
│   │   ├── login/        # Admin login
│   │   └── layout.tsx    # Admin layout with auth
│   ├── [shortCode]/      # Public file access
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── files/        # File operations
│   │   ├── access/       # Access management
│   │   └── verify/       # Access verification
│   └── globals.css       # Global styles
├── components/
│   ├── admin/            # Admin components
│   ├── public/           # Public components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── utils/            # Utility functions
│   └── types.ts          # TypeScript types
└── supabase-schema.sql   # Database schema
```

## Security Features

- 🔒 Admin authentication with Supabase Auth
- 🔑 bcrypt password hashing for file access
- ⏰ Time-based access expiration
- 🛡️ Row Level Security (RLS) policies
- 🔐 Signed URLs for file access (1-hour expiry)
- 📊 Access analytics and logging

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
