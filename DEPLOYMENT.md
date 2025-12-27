# Deployment Guide for Cloudflare Pages

This guide will help you deploy your File Share application to Cloudflare Pages with your custom domain.

> **⚠️ IMPORTANT**: This application uses **Cloudflare Pages**, NOT Cloudflare Workers. Make sure you're in the Pages section of your Cloudflare dashboard.

## Prerequisites

- GitHub account with your code pushed
- Cloudflare account
- Custom domain (omsingh.me) configured in Cloudflare
- Supabase project set up and running

## Step-by-Step Deployment

### 1. Prepare Your Repository

1. Make sure all your code is committed and pushed to GitHub:
```bash
git add .
git commit -m "Initial commit - File Share application"
git push origin main
```

### 2. Create Cloudflare Pages Project

> **Note**: Go to **Workers & Pages** > **Pages** tab (NOT the Workers tab)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** in the left sidebar
3. Click the **Pages** tab at the top
4. Click **Create a project** > **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select your repository (`file-share`)
6. Configure build settings:
   - **Project name**: `file-share` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: **Next.js**
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`

### 3. Configure Environment Variables

In the Cloudflare Pages project settings, add the following environment variables:

**Production Environment:**
- `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
- `NEXT_PUBLIC_APP_URL` = `https://omsingh.me`

**Preview Environment (Optional):**
Same as above, but with:
- `NEXT_PUBLIC_APP_URL` = Your Cloudflare Pages preview URL

### 4. Deploy

1. Click **Save and Deploy**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be deployed to a Cloudflare Pages URL (e.g., `file-share.pages.dev`)

### 5. Set Up Custom Domain

1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain: `omsingh.me`
4. Cloudflare will automatically configure DNS if your domain is already in Cloudflare
5. If not, add the following DNS records:
   - Type: `CNAME`
   - Name: `@` (or your subdomain)
   - Target: Your Cloudflare Pages URL
   - Proxy status: **Proxied** (orange cloud)

6. Wait for DNS propagation (usually a few minutes)
7. Your app will be available at `https://omsingh.me`

### 6. Enable HTTPS

Cloudflare automatically provides SSL/TLS certificates. Make sure:
1. Go to **SSL/TLS** in your Cloudflare dashboard
2. Set encryption mode to **Full** or **Full (strict)**

### 7. Verify Deployment

1. Visit `https://omsingh.me/login`
2. Log in with your admin credentials
3. Try uploading a file
4. Create an access grant
5. Test the short URL access

## Continuous Deployment

Cloudflare Pages automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

## Troubleshooting

### Build Fails

1. Check build logs in Cloudflare Pages dashboard
2. Verify all environment variables are set correctly
3. Make sure your `package.json` has the correct build script

### Environment Variables Not Working

1. Make sure you've set them in the **Production** environment
2. Redeploy after adding/changing environment variables
3. Check for typos in variable names

### Custom Domain Not Working

1. Wait for DNS propagation (can take up to 24 hours)
2. Check DNS records in Cloudflare DNS settings
3. Make sure SSL/TLS is enabled
4. Try accessing via HTTPS (not HTTP)

### Database Connection Issues

1. Verify Supabase credentials are correct
2. Check that Supabase project is active
3. Ensure database schema is set up (run `supabase-schema.sql`)
4. Check Supabase Storage bucket is created

## Performance Optimization

### Cloudflare Settings

1. **Caching**: Enable caching for static assets
2. **Minification**: Enable Auto Minify for JS, CSS, HTML
3. **Brotli**: Enable Brotli compression
4. **HTTP/3**: Enable HTTP/3 (QUIC)

### Next.js Optimization

The app is already optimized with:
- Server-side rendering (SSR)
- Static generation where possible
- Image optimization
- Code splitting

## Monitoring

1. **Cloudflare Analytics**: View traffic and performance metrics
2. **Supabase Dashboard**: Monitor database usage and storage
3. **Error Tracking**: Check Cloudflare Pages logs for errors

## Updating the Application

To update your deployed application:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

Cloudflare Pages will automatically build and deploy the new version.

## Rollback

If you need to rollback to a previous version:

1. Go to Cloudflare Pages dashboard
2. Navigate to **Deployments**
3. Find the previous successful deployment
4. Click **...** > **Rollback to this deployment**

## Support

For deployment issues:
- Cloudflare Pages: [docs.cloudflare.com/pages](https://docs.cloudflare.com/pages)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
