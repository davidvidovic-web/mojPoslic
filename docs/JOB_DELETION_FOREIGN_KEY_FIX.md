# Job Deletion Foreign Key Fix

## Issue
When attempting to delete a job, the following error occurred:
```
update or delete on table "job_listings" violates foreign key constraint "conversations_job_id_fkey" on table "conversations"
```

## Root Cause
The `conversations` table had a foreign key to `job_listings` without any CASCADE or SET NULL option, preventing job deletion when conversations existed.

## Solution

### 1. Database Migration
Created migration: `20241012000000_fix_conversations_job_fkey_cascade.sql`

**Conversations Foreign Key:**
- **Before**: `FOREIGN KEY (job_id) REFERENCES job_listings(id)` (blocks deletion)
- **After**: `FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE SET NULL`

**Connection History Foreign Key:**
- **Before**: `FOREIGN KEY (job_id) REFERENCES job_listings(id)` (blocks deletion)
- **After**: `FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE SET NULL`
- **Impact**: Connection history preserved as permanent audit trail

### 2. Code Cleanup
Updated `useDeleteJobMutation` in `useJobs.ts`:

**Removed:**
- Manual connection_history deletion (not needed - history is preserved)
- Extra error handling code for connection_history
- Unnecessary console logs

**Simplified to:**
```typescript
// Delete the job itself
// CASCADE deletes: applications, saved_jobs, job_assignments, reviews
// Conversations: job_id set to NULL (preserving message history)
// Connection history: job_id set to NULL (preserving audit trail)
const { error } = await supabase
  .from('job_listings')
  .delete()
  .eq('id', jobId)
```

## Behavior After Fix

### What Gets Deleted:
✅ Job listing
✅ Applications (CASCADE)
✅ Saved jobs (CASCADE)
✅ Job assignments (CASCADE)
✅ Reviews (CASCADE)
✅ Job search vectors (CASCADE)

### What Gets Preserved (job_id set to NULL):
✅ Conversations (maintains message history)
✅ Messages (fully intact)
✅ Connection history (permanent audit trail)

## Migration Instructions

Run this migration in your Supabase SQL editor or via CLI:

```bash
# Using Supabase CLI
supabase db push

# Or run the SQL file directly in Supabase Dashboard > SQL Editor
```

## Verification

After running the migration, you can verify the constraints:

```sql
-- Check conversations constraint
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  confupdtype AS on_update,
  confdeltype AS on_delete
FROM pg_constraint
WHERE conname = 'conversations_job_id_fkey';

-- Should show: on_delete = 'n' (SET NULL)

-- Check connection_history constraint
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  confupdtype AS on_update,
  confdeltype AS on_delete
FROM pg_constraint
WHERE conname = 'connection_history_job_id_fkey';

-- Should show: on_delete = 'c' (CASCADE)
```

## Testing

1. Create a job
2. Have someone apply to it
3. Start a conversation
4. Delete the job
5. Verify:
   - ✅ Job deleted successfully
   - ✅ Applications removed
   - ✅ Conversation still exists
   - ✅ Messages still visible
   - ✅ Conversation shows `job_id: null`

## Benefits

1. **No Data Loss**: Conversations and messages preserved
2. **Cleaner Code**: No manual deletion needed
3. **Database Integrity**: Proper constraint handling
4. **Better UX**: Jobs can be deleted without errors
5. **Historical Record**: Message history maintained for accountability

## Related Changes

- Job deletion dialog updated to inform users messages are preserved
- Removed conversation invalidation from delete mutation
- Simplified deletion logic in backend hook

## Files Modified

- ✅ `/supabase/migrations/20241012000000_fix_conversations_job_fkey_cascade.sql` (created)
- ✅ `/src/hooks/queries/useJobs.ts` (simplified)
- ✅ `/src/components/dashboard/client/delete-job-dialog.tsx` (text updated previously)
