# Database Migration Instructions

## Critical Security & Feature Updates (v2.0)

This migration adds essential security features, download tracking, and analytics dashboard.

### What's New:
1. **Audit Logging** - Track all file access attempts with IP addresses and timestamps
2. **Download Limits** - Prevent bandwidth abuse with per-user download caps
3. **Cryptographically Secure Passwords** - Fixed weak password generation
4. **Enhanced Tracking** - Download count separate from access count
5. **Analytics Dashboard** - Real-time activity monitoring and statistics
6. **File Expiration Infrastructure** - Database support for automatic cleanup

### Migration Steps:

1. **Run the audit log migration**:
   - Go to your Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase-migration-audit-log.sql`
   - Click "Run"
   - Verify tables were created successfully

2. **Run the file expiration migration**:
   - Still in Supabase SQL Editor
   - Copy and paste the contents of `supabase-migration-file-expiration.sql`
   - Click "Run"
   - Verify the `expires_at` column and function were created

3. **Deploy the updated code**:
   ```bash
   git add .
   git commit -m "feat: add audit logging, download limits, and analytics dashboard"
   git push origin main
   ```

4. **Verify in production**:
   - Log in to your dashboard
   - Upload a test file
   - Grant access with a download limit (e.g., 3 downloads)
   - Test that limits are enforced
   - Check the **Analytics tab** in your dashboard
   - Verify the `access_log` table has entries

### Database Schema Changes:

**New Table: `access_log`**
- Tracks every access attempt (successful or failed)
- Records IP address, user agent, timestamp
- Helps identify abuse patterns

**Updated Table: `file_access`**
- `download_count` - How many times file was downloaded
- `max_downloads` - Optional limit on downloads
- `expires_at` index added for faster cleanup queries

**Updated Table: `files`**
- `expires_at` - When the file should expire (optional)
- Index for faster expiration queries

**New Function: `cleanup_expired_data()`**
- Removes expired access grants
- Cleans up expired session tokens
- Can be scheduled via cron job

### Breaking Changes:
None - This is a backward-compatible migration.

### Rollback Plan:
If you need to rollback:
```sql
-- Rollback audit logging
DROP TABLE IF EXISTS access_log CASCADE;
ALTER TABLE file_access DROP COLUMN IF EXISTS download_count;
ALTER TABLE file_access DROP COLUMN IF EXISTS max_downloads;
DROP INDEX IF EXISTS idx_file_access_expires_at;

-- Rollback file expiration
ALTER TABLE files DROP COLUMN IF EXISTS expires_at;
DROP INDEX IF EXISTS idx_files_expires_at;
DROP FUNCTION IF EXISTS cleanup_expired_data();
```

### Security Impact:
- **High Priority**: Passwords are now cryptographically secure
- **Audit Trail**: You can now prove who accessed what and when
- **Abuse Prevention**: Download limits prevent bandwidth theft
- **Analytics**: Full visibility into file access patterns

### Next Steps:
After migration, explore:
- **Analytics Dashboard** - Click the "Analytics" tab to see access patterns
- Setting up Upstash Redis for persistent rate limiting
- Adding email notifications for access events
- Configuring automated cleanup jobs
