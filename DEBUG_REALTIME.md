# Debugging Real-time Access Revocation

## Quick Test Steps

1. **Apply the database migration first:**
   ```sql
   -- Run in Supabase SQL Editor
   ALTER TABLE file_access REPLICA IDENTITY FULL;
   ```

2. **Restart your Next.js dev server:**
   ```powershell
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Test the feature:**
   - Open file with valid credentials in Browser Tab 1
   - Open browser DevTools Console (F12)
   - In Browser Tab 2, open admin dashboard and revoke the access
   - Watch Tab 1 console for logs and verify user gets locked out

## What to Check in Browser Console

You should see these logs when accessing a file:

```
Setting up SSE connection for access monitoring...
SSE connection opened
SSE heartbeat or non-JSON message (every 30 seconds)
```

When access is revoked, you should see:

```
SSE message received: {"revoked":true}
Access revoked/expired, locking out user
```

## Common Issues and Fixes

### Issue 1: SSE Connection Not Opening
**Symptoms:** No "SSE connection opened" log

**Check:**
- Open DevTools > Network tab
- Look for request to `/api/access/stream`
- Status should be "pending" or "200"
- If 400/500 error, check server logs

**Fix:** Ensure `shortCode` and `userIdentifier` are valid

### Issue 2: Realtime Not Triggering
**Symptoms:** Polling works but no immediate revocation

**Check Supabase Dashboard:**
1. Go to Database > Replication
2. Verify `file_access` table is published
3. Check Tables > file_access > "Enable Realtime" is ON

**Run in SQL Editor:**
```sql
-- Verify REPLICA IDENTITY is FULL
SELECT relname, relreplident 
FROM pg_class 
WHERE relname = 'file_access';
-- Should show relreplident = 'f' (FULL)

-- Verify table is in realtime publication
SELECT * FROM pg_publication_tables 
WHERE tablename = 'file_access';
```

### Issue 3: Polling Works (5 second delay)
**Symptoms:** User gets locked out but after ~5 seconds

**This means:**
- Polling fallback is working ✓
- Supabase Realtime is NOT triggering
- Database migration may not be applied

**Solution:**
1. Run the migration: `ALTER TABLE file_access REPLICA IDENTITY FULL;`
2. Verify in Supabase Dashboard: Database > Tables > file_access
3. Click on the table, go to Settings
4. Ensure "Enable Realtime" toggle is ON
5. Restart your Next.js dev server

### Issue 4: Nothing Happens
**Symptoms:** No lockout at all, even after 5+ seconds

**Debug Steps:**

1. **Check server logs (terminal running Next.js):**
   - Should see "SSE Realtime event: DELETE" when access revoked
   - Should see "Polling detected access deleted" every 5 seconds after revocation

2. **Check if SSE endpoint is being called:**
   ```powershell
   # In your Next.js terminal, you should see:
   # GET /api/access/stream?shortCode=...&userIdentifier=...
   ```

3. **Verify access is actually being deleted:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM file_access WHERE user_identifier = 'YOUR_IDENTIFIER';
   -- Should return no rows after revocation
   ```

## Environment Check

Verify your environment variables are set:

```bash
# .env.local should have:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing Realtime Manually

You can test if Supabase Realtime is working at all:

```javascript
// Run in Browser Console while on your app
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

const channel = supabase
  .channel('test')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'file_access' },
    (payload) => console.log('Realtime event:', payload)
  )
  .subscribe((status) => console.log('Status:', status));

// Now revoke access in admin panel
// You should see the event logged
```

## Expected Behavior Timeline

**Immediate (< 1 second):**
- Realtime DELETE event triggers
- SSE sends revocation message
- User sees "Access has been revoked" error

**Fallback (within 5 seconds):**
- If Realtime fails, polling detects deletion
- SSE sends revocation message
- User sees error

## Still Not Working?

1. **Check browser console for errors** (F12)
2. **Check Next.js server terminal for errors**
3. **Verify migration was applied** (`REPLICA IDENTITY FULL`)
4. **Restart Next.js dev server** after code changes
5. **Clear browser cache and sessionStorage**
6. **Try in incognito/private browsing mode**

If none of this works, share:
- Browser console logs
- Server terminal logs  
- Result of `SELECT relreplident FROM pg_class WHERE relname = 'file_access';`
