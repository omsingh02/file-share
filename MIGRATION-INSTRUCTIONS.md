# Database Migration Instructions

## Critical Security & Feature Updates

This migration adds essential security features and download tracking.

### What's New:
1. **Audit Logging** - Track all file access attempts with IP addresses and timestamps
2. **Download Limits** - Prevent bandwidth abuse with per-user download caps
3. **Cryptographically Secure Passwords** - Fixed weak password generation
4. **Enhanced Tracking** - Download count separate from access count

### Migration Steps:

1. **Run the audit log migration**:
   - Go to your Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase-migration-audit-log.sql`
   - Click "Run"
   - Verify tables were created successfully

2. **Deploy the updated code**:
   ```bash
   git add .
   git commit -m "Add audit logging and download limits"
   git push origin main
   ```

3. **Verify in production**:
   - Upload a test file
   - Grant access with a download limit (e.g., 3 downloads)
   - Test that limits are enforced
   - Check the `access_log` table for entries

### Database Schema Changes:

**New Table: `access_log`**
- Tracks every access attempt (successful or failed)
- Records IP address, user agent, timestamp
- Helps identify abuse patterns

**Updated Table: `file_access`**
- `download_count` - How many times file was downloaded
- `max_downloads` - Optional limit on downloads
- `expires_at` index added for faster cleanup queries

### Breaking Changes:
None - This is a backward-compatible migration.

### Rollback Plan:
If you need to rollback:
```sql
DROP TABLE IF EXISTS access_log CASCADE;
ALTER TABLE file_access DROP COLUMN IF EXISTS download_count;
ALTER TABLE file_access DROP COLUMN IF EXISTS max_downloads;
DROP INDEX IF EXISTS idx_file_access_expires_at;
```

### Security Impact:
- **High Priority**: Passwords are now cryptographically secure
- **Audit Trail**: You can now prove who accessed what and when
- **Abuse Prevention**: Download limits prevent bandwidth theft

### Next Steps:
After migration, consider:
- Setting up Upstash Redis for persistent rate limiting
- Adding email notifications for access events
- Creating an analytics dashboard
