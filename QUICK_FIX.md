# Quick Fix Checklist

Run these commands in order:

## 1. Apply Database Migration
```sql
-- Copy and paste this into Supabase SQL Editor
ALTER TABLE file_access REPLICA IDENTITY FULL;
```

## 2. Verify It Worked
```sql
-- Should return: relreplident = 'f' (meaning FULL)
SELECT relname, relreplident 
FROM pg_class 
WHERE relname = 'file_access';
```

## 3. Enable Realtime in Supabase Dashboard
1. Go to: Database > Replication
2. Click on `supabase_realtime` publication
3. Make sure `file_access` table is checked/enabled
4. If not, toggle it on

## 4. Rebuild and Restart Your App
```powershell
# Stop current dev server (Ctrl+C)
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Reinstall dependencies if needed
npm install

# Start dev server
npm run dev
```

## 5. Test in Browser

### Tab 1 (File Viewer):
1. Open browser DevTools (F12) > Console
2. Access a file with valid credentials
3. Look for these console logs:
   ```
   Setting up SSE connection for access monitoring...
   SSE connection opened
   ```

### Tab 2 (Admin Dashboard):
1. Go to dashboard
2. Click "Manage Access" on the file
3. Revoke the access you just used

### Back to Tab 1:
You should immediately see:
```
SSE message received: {"revoked":true}
Access revoked/expired, locking out user
```
And the file should disappear showing "Access has been revoked" error.

## If Still Not Working

Check these in order:

1. **Browser Console Errors?**
   - F12 > Console tab
   - Look for red errors

2. **Network Tab Shows SSE Connection?**
   - F12 > Network tab
   - Filter by "stream"
   - Should see `/api/access/stream` with status "pending" (stays open)
   - Click on it, go to "EventStream" tab to see messages

3. **Server Logs Show Subscription?**
   - Check your terminal running `npm run dev`
   - Should see: `Realtime subscription status: SUBSCRIBED`

4. **Try a Different Browser**
   - Some browser extensions block SSE
   - Try incognito/private mode

5. **Check Supabase Project Status**
   - Go to Supabase Dashboard
   - Look for any warnings or issues
   - Verify project is not paused

## Expected Timeline

- **0-1 seconds:** Realtime triggers (if working)
- **1-5 seconds:** Polling fallback triggers (if Realtime not working)
- **5+ seconds:** Something is wrong, see DEBUG_REALTIME.md
