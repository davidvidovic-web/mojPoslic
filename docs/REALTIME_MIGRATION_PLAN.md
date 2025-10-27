# Realtime Migration Plan - Following Supabase Best Practices

## Executive Summary

Based on Supabase documentation at https://supabase.com/docs/guides/realtime/subscribing-to-database-changes, we should **migrate from Postgres Changes to Broadcast** for better scalability and security.

**Current State**: Using `postgres_changes` for messages, conversations, and notifications
**Recommended State**: Use `broadcast` with database triggers for better scalability

## Key Insights from Supabase Documentation

### Two Options for Realtime Database Changes:

1. **Broadcast** (RECOMMENDED) ✅
   - Better scalability
   - Better security with RLS policies
   - Requires setup of database triggers
   - Uses private channels with authorization

2. **Postgres Changes** (Current approach) ⚠️
   - Simpler, less setup
   - Does NOT scale as well
   - Has limitations as application grows
   - Direct database event streaming

### Why Migrate to Broadcast?

From Supabase docs:
> "Broadcast is the recommended method for scalability and security."
> "Postgres Changes are simple to use, but have some limitations as your application scales."

## Current Implementation Analysis

### Files Using Realtime:

1. **`/src/hooks/use-supabase-realtime-chat-postgres.ts`** ⚠️
   - Uses `postgres_changes` for messages and conversations
   - Listens to INSERT, UPDATE events
   - Has token refresh handling
   - Needs migration to broadcast

2. **`/src/hooks/use-realtime-notifications.ts`** ⚠️
   - Uses `postgres_changes` for notifications
   - Listens to INSERT, UPDATE, DELETE events
   - Needs migration to broadcast

3. **`/src/hooks/use-ai-job-matching.ts`** ⚠️
   - Uses `postgres_changes` for applications
   - Needs migration to broadcast

4. **`/src/hooks/use-optimized-messaging.ts`** ⚠️
   - Uses `postgres_changes`
   - Needs migration to broadcast

## Migration Steps

### Phase 1: Database Setup (Highest Priority)

#### Step 1.1: Enable Broadcast Authorization

Create RLS policy for broadcast messages:

```sql
-- Allow authenticated users to receive broadcasts
create policy "Authenticated users can receive broadcasts"
on "realtime"."messages"
for select
to authenticated
using (true);
```

#### Step 1.2: Create Broadcast Trigger Functions

##### Messages Broadcast Function
```sql
create or replace function public.broadcast_message_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  perform realtime.broadcast_changes(
    'topic:' || coalesce(NEW.conversation_id, OLD.conversation_id)::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  return null;
end;
$$;
```

##### Conversations Broadcast Function
```sql
create or replace function public.broadcast_conversation_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  -- Broadcast to all participants
  perform realtime.broadcast_changes(
    'topic:conversations:user:' || participant_id::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  )
  from unnest(coalesce(NEW.participant_ids, OLD.participant_ids)) as participant_id;
  
  return null;
end;
$$;
```

##### Notifications Broadcast Function
```sql
create or replace function public.broadcast_notification_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  perform realtime.broadcast_changes(
    'topic:notifications:user:' || coalesce(NEW.user_id, OLD.user_id)::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  return null;
end;
$$;
```

##### Applications Broadcast Function
```sql
create or replace function public.broadcast_application_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  -- Broadcast to job owner and applicant
  perform realtime.broadcast_changes(
    'topic:applications:user:' || (select posted_by from job_listings where id = coalesce(NEW.job_id, OLD.job_id))::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  
  perform realtime.broadcast_changes(
    'topic:applications:user:' || coalesce(NEW.user_id, OLD.user_id)::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  
  return null;
end;
$$;
```

#### Step 1.3: Create Database Triggers

```sql
-- Messages trigger
create trigger handle_message_changes
after insert or update or delete
on public.messages
for each row
execute function broadcast_message_changes();

-- Conversations trigger
create trigger handle_conversation_changes
after insert or update or delete
on public.conversations
for each row
execute function broadcast_conversation_changes();

-- Notifications trigger
create trigger handle_notification_changes
after insert or update or delete
on public.notifications
for each row
execute function broadcast_notification_changes();

-- Applications trigger
create trigger handle_application_changes
after insert or update or delete
on public.applications
for each row
execute function broadcast_application_changes();
```

### Phase 2: Client-Side Migration

#### Step 2.1: Update `use-supabase-realtime-chat-postgres.ts`

**BEFORE** (Current - Postgres Changes):
```typescript
const channel = supabase.channel(`messages:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // Handle insert
  })
```

**AFTER** (Recommended - Broadcast):
```typescript
// Set auth for private channel
await supabase.realtime.setAuth()

const channel = supabase.channel(`topic:${conversationId}`, {
  config: { private: true } // Required for broadcast authorization
})
  .on('broadcast', { event: 'INSERT' }, (payload) => {
    // Handle insert - payload structure from trigger
    const newMessage = payload.payload.new
    // Process message...
  })
  .on('broadcast', { event: 'UPDATE' }, (payload) => {
    // Handle update
    const updatedMessage = payload.payload.new
    // Process update...
  })
  .on('broadcast', { event: 'DELETE' }, (payload) => {
    // Handle delete
    const deletedId = payload.payload.old.id
    // Process deletion...
  })
```

#### Step 2.2: Update `use-realtime-notifications.ts`

**BEFORE**:
```typescript
const channel = supabase.channel(`notifications:user:${user.id}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${user.id}`
  }, handler)
```

**AFTER**:
```typescript
await supabase.realtime.setAuth()

const channel = supabase.channel(`topic:notifications:user:${user.id}`, {
  config: { private: true }
})
  .on('broadcast', { event: 'INSERT' }, (payload) => {
    const newNotification = payload.payload.new
    // Process notification...
  })
```

#### Step 2.3: Update Other Realtime Hooks

Apply same pattern to:
- `use-ai-job-matching.ts`
- `use-optimized-messaging.ts`
- Any other files using `postgres_changes`

### Phase 3: Testing & Validation

#### 3.1 Test Checklist

- [ ] **Messages**: Send message, verify received in realtime
- [ ] **Conversations**: Create conversation, verify appears in list
- [ ] **Notifications**: Trigger notification, verify toast appears
- [ ] **Applications**: Submit application, verify client sees it
- [ ] **Job Updates**: Update job status, verify tasker sees change
- [ ] **Read Status**: Mark message as read, verify unread count updates
- [ ] **Deletions**: Delete message/conversation, verify removal
- [ ] **Multiple Tabs**: Test sync across multiple browser tabs
- [ ] **Token Refresh**: Test after JWT token expiration (~1 hour)
- [ ] **Reconnection**: Test after network disconnect/reconnect
- [ ] **Performance**: Verify no performance degradation
- [ ] **Scalability**: Test with multiple concurrent users

#### 3.2 Rollback Plan

If issues occur:
1. Keep old `postgres_changes` code commented out
2. Drop new triggers: `DROP TRIGGER handle_message_changes ON messages;`
3. Revert client code to use `postgres_changes`
4. Investigate and fix issues
5. Re-attempt migration

### Phase 4: Cleanup

#### 4.1 Remove Old Code

After successful migration:
- Remove all `postgres_changes` subscriptions
- Remove old commented code
- Update documentation

#### 4.2 Remove Postgres Changes Publication (Optional)

If not using postgres_changes anywhere:
```sql
-- Remove tables from publication
alter publication supabase_realtime drop table messages;
alter publication supabase_realtime drop table conversations;
alter publication supabase_realtime drop table notifications;
alter publication supabase_realtime drop table applications;
```

## Benefits of Migration

### 1. **Better Scalability** 📈
   - Broadcast handles more concurrent connections
   - Less database load
   - More efficient websocket usage

### 2. **Better Security** 🔒
   - RLS policies control who receives broadcasts
   - Private channels with authentication
   - Fine-grained access control

### 3. **Better Performance** ⚡
   - Reduced database polling
   - More efficient event delivery
   - Lower latency for updates

### 4. **Future-Proof** 🚀
   - Aligned with Supabase recommendations
   - Better support as platform evolves
   - Easier to add new realtime features

## Current Issues This Will Fix

### 1. **Token Expiration Errors**
   - Current implementation has complex token refresh logic
   - Broadcast with `setAuth()` handles this more cleanly
   - Less prone to "InvalidJWTToken" errors

### 2. **Scalability Concerns**
   - As user base grows, postgres_changes may not scale well
   - Broadcast is designed for scale from the start

### 3. **Missing Job Status Updates**
   - Current issue: Job status not appearing in queries
   - Broadcast will ensure all participants get updates reliably
   - Better synchronization across clients

## Implementation Timeline

### Week 1: Database Setup
- [ ] Day 1-2: Create and test trigger functions
- [ ] Day 3-4: Deploy triggers to production
- [ ] Day 5: Monitor for any database performance issues

### Week 2: Client Migration - Messages
- [ ] Day 1-2: Update messaging hooks
- [ ] Day 3: Test messaging functionality
- [ ] Day 4-5: Fix any issues, deploy to production

### Week 3: Client Migration - Notifications & Applications
- [ ] Day 1-2: Update notification hooks
- [ ] Day 3: Update application hooks
- [ ] Day 4-5: Comprehensive testing

### Week 4: Validation & Cleanup
- [ ] Day 1-3: Run full test suite
- [ ] Day 4: Production deployment
- [ ] Day 5: Monitor and cleanup old code

## Immediate Action Items

### Priority 1: Database Setup (Can do now)
1. Create broadcast RLS policy
2. Create trigger functions
3. Create triggers
4. Test triggers manually in database

### Priority 2: Update One Hook (Proof of Concept)
1. Choose notifications as simplest to migrate
2. Update `use-realtime-notifications.ts`
3. Test thoroughly
4. Use as template for other hooks

### Priority 3: Full Migration
1. Apply pattern to all realtime hooks
2. Comprehensive testing
3. Production deployment
4. Monitor for issues

## Questions to Consider

1. **Do we need to support both methods during migration?**
   - Recommend: No, direct migration with feature flag for rollback

2. **How to handle users mid-session during deployment?**
   - Recommend: Deploy during low-traffic hours, force refresh for active users

3. **Should we keep postgres_changes as fallback?**
   - Recommend: Keep code commented for 1-2 weeks, then remove

4. **How to test at scale?**
   - Recommend: Use staging environment with load testing tools

## Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Broadcast Guide](https://supabase.com/docs/guides/realtime/broadcast)
- [Authorization](https://supabase.com/docs/guides/realtime/authorization)
- [Postgres Changes Limitations](https://supabase.com/docs/guides/realtime/postgres-changes#limitations)

## Conclusion

**Recommendation**: Proceed with migration to Broadcast method

**Risk Level**: Medium (well-documented pattern, but affects critical functionality)

**Expected Outcome**: More scalable, secure, and maintainable realtime implementation

**Next Step**: Create database migration file with trigger functions and start testing in development environment
