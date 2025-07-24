# Supabase Real-time Messaging System Analysis
**Date:** January 24, 2025  
**Issue:** Real-time messages not appearing without page refresh  
**Status:** API keys updated, WebSocket connecting, but postgres_changes events not firing  

## Current System Overview

### Architecture
- **Frontend:** Next.js 14 with TypeScript
- **Backend:** Supabase with PostgreSQL
- **Real-time:** Supabase Real-time via WebSocket
- **Authentication:** NextAuth.js with custom JWT integration
- **Database ORM:** Prisma (with Supabase as secondary system)

### Current Implementation

#### Supabase Client Configuration
```typescript
// src/lib/messaging/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
```

#### Real-time Hook Implementation
```typescript
// src/hooks/use-optimized-realtime.ts
const channel = supabase
  .channel(`conversation-${activeConversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${activeConversationId}`
  }, (payload) => {
    // Message processing logic
  })
  .subscribe((status, error) => {
    // Connection status handling
  })
```

## Analysis of Issues

### 1. **Authentication Integration Problem** ⚠️ **CRITICAL**

#### Problem
- Using NextAuth.js for authentication but Supabase real-time expects Supabase auth
- Current implementation uses "anonymous" anon key without proper user context
- Supabase RLS policies rely on `auth.uid()` but we're not properly authenticated

#### Evidence
```typescript
// Current RLS Policy expects Supabase auth
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid() AND left_at IS NULL  -- ❌ auth.uid() is NULL
  )
);
```

#### Root Cause
- `auth.uid()` returns NULL because we're not using Supabase authentication
- Real-time events are filtered by RLS policies that fail authentication checks
- WebSocket connects but postgres_changes events are blocked by RLS

### 2. **Database Schema Mismatch** 🔍 **INVESTIGATION NEEDED**

#### Prisma Schema vs Supabase Tables
```typescript
// Prisma schema.prisma
model Message {
  id             String       @id @default(cuid())
  conversationId String       @map("conversation_id")
  senderId       String       @map("sender_id")
  content        String
  // ... other fields
  @@map("messages")
}
```

**Questions:**
- Are the Supabase tables properly created and synchronized?
- Do the column names match between Prisma and Supabase?
- Are the CUID IDs properly handled in both systems?

### 3. **Real-time Publication Settings** 🔍 **VERIFICATION NEEDED**

#### Required Settings
- Tables must be added to `supabase_realtime` publication
- RLS must be properly configured for real-time events
- User permissions must allow real-time subscriptions

#### Status
```sql
-- Need to verify these are enabled:
-- 1. Publication includes messages table
-- 2. RLS allows real-time events
-- 3. User has proper permissions
```

### 4. **JWT Token Integration** 🔧 **NEEDS IMPLEMENTATION**

#### Current State
- NextAuth.js generates JWT tokens
- Supabase client uses anonymous key
- No custom JWT passed to Supabase real-time

#### Required Implementation
```typescript
// Need to implement:
supabase.realtime.setAuth('custom-jwt-from-nextauth')
```

## Supabase Real-time Best Practices (2024-2025)

### 1. **Authentication Integration**
- **Custom JWT:** Use NextAuth JWT with Supabase by setting custom auth
- **RLS Policies:** Ensure policies work with custom user identification
- **Token Refresh:** Implement proper token refresh for long-lived connections

### 2. **Real-time Configuration**
```typescript
// Recommended configuration
const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Set custom auth token
supabase.realtime.setAuth(customJwtToken)
```

### 3. **Database Policies**
```sql
-- Alternative RLS approach for custom auth
CREATE POLICY "Users can view messages via custom auth" ON messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text
    AND left_at IS NULL
  )
);
```

### 4. **Channel Management**
- Use unique channel names per conversation
- Implement proper subscription cleanup
- Handle connection retries with exponential backoff

## Identified Solutions

### Solution 1: **Custom JWT Integration** (Recommended)
1. Extract NextAuth JWT in the client
2. Pass custom JWT to Supabase real-time
3. Update RLS policies to use custom claims

### Solution 2: **Dual Authentication** (Alternative)
1. Maintain NextAuth for app authentication
2. Create parallel Supabase auth for real-time
3. Sync user sessions between systems

### Solution 3: **Server-Side Real-time** (Complex)
1. Implement real-time on server-side only
2. Use WebSocket/SSE to stream to clients
3. Bypass Supabase RLS limitations

## Recommended Implementation Plan

### Phase 1: **Immediate Fixes** (High Priority)
1. **Verify Database Setup**
   - Check Supabase tables exist and match Prisma schema
   - Verify real-time publication includes messages table
   - Test RLS policies with proper authentication

2. **Custom JWT Integration**
   - Extract NextAuth JWT on client
   - Pass to Supabase real-time via `setAuth()`
   - Update RLS policies for custom auth claims

### Phase 2: **System Validation** (Medium Priority)
1. **Connection Testing**
   - Implement comprehensive real-time diagnostics
   - Test with multiple users and conversations
   - Verify message delivery and ordering

2. **Performance Optimization**
   - Implement connection pooling
   - Add message deduplication
   - Optimize subscription management

### Phase 3: **Production Readiness** (Low Priority)
1. **Error Handling**
   - Implement robust retry logic
   - Add fallback mechanisms
   - Monitor connection health

2. **Scalability**
   - Test with high message volume
   - Implement rate limiting
   - Add monitoring and alerting

## Environment Status

### Current API Keys ✅
- `NEXT_PUBLIC_SUPABASE_URL`: Configured
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Updated with real-time enabled key
- `SUPABASE_SERVICE_ROLE_KEY`: Configured

### WebSocket Connection ✅
- Connection establishing successfully
- SUBSCRIBED status achieved
- No more connection errors

### Missing Components ❌
- Custom JWT integration
- RLS policy validation
- Database schema verification
- Real-time publication confirmation

## Next Steps

1. **Immediate:** Verify Supabase database tables and publications
2. **Critical:** Implement custom JWT authentication
3. **Validation:** Test real-time events with proper authentication
4. **Optimization:** Implement production-ready error handling

## Technical Debt

- **Authentication:** Complex dual-auth system needs simplification
- **Database:** Prisma + Supabase dual setup adds complexity
- **Real-time:** Multiple retry mechanisms and connection management
- **Testing:** Limited real-time integration testing

## References

- [Supabase Real-time Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Supabase Real-time Authorization](https://supabase.com/docs/guides/realtime/authorization)
- [Custom JWT with Supabase](https://supabase.com/docs/guides/realtime/authorization#custom-tokens)
- [NextAuth.js JWT Integration](https://next-auth.js.org/configuration/callbacks#jwt-callback)
