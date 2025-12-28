# Real-time Access Revocation Fix

## Problem
When you revoke access credentials from the dashboard, users who are currently viewing a file don't get immediately locked out without refreshing the page.

## Root Cause
The issue was caused by PostgreSQL's default `REPLICA IDENTITY` setting. By default, tables use `REPLICA IDENTITY DEFAULT`, which only includes the primary key in DELETE event payloads sent through Supabase Realtime. This meant the SSE (Server-Sent Events) stream couldn't verify if the deleted access record matched the current user's `user_identifier`.

## Solution
The fix involves three improvements:

### 1. Database Configuration (Critical)
Set `REPLICA IDENTITY FULL` on the `file_access` table so DELETE events include all column data:

```sql
ALTER TABLE file_access REPLICA IDENTITY FULL;
```

**To apply this fix:**
1. Open your Supabase SQL Editor
2. Run the migration file: `supabase-migration-realtime-fix.sql`

### 2. Improved Realtime Subscription
Changed the subscription filter from monitoring all access records for a file to monitoring the specific access record by its ID:

**Before:**
```typescript
filter: `file_id=eq.${file.id}`
```

**After:**
```typescript
filter: `id=eq.${accessRecord.id}`
```

This ensures we only receive events for the specific user's access record.

### 3. Fallback Polling Mechanism
Added a periodic check (every 5 seconds) that queries the database to verify access is still valid. This provides a safety net in case:
- The Realtime connection fails
- Network issues prevent SSE messages from being received
- The Realtime subscription doesn't trigger for any reason

## How It Works Now

1. **User views file:** SSE connection established, monitoring their specific access record
2. **Admin revokes access:** DELETE event is triggered in database
3. **Realtime notification:** SSE receives DELETE event with full record data
4. **Immediate lockout:** Client receives revocation message, clears session, shows error
5. **Fallback check:** If Realtime fails, polling detects the missing record within 5 seconds

## Testing
To verify the fix works:

1. Grant access to a user and have them open a file
2. From the admin dashboard, revoke that user's access
3. The user should be immediately locked out (within 1-5 seconds) without refreshing

## Performance Impact
- **Realtime subscription:** Minimal overhead, filters to single record
- **Polling fallback:** 1 database query every 5 seconds per active viewer (negligible)
- **Database:** `REPLICA IDENTITY FULL` increases replication log size slightly but is necessary for this feature

## Future Improvements
Consider adding:
- WebSocket connection status indicator to user
- Retry logic for Realtime connection failures
- Configurable polling interval
