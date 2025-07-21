# Critical Systems Information - mojPoslić v0.1.1

## ⚠️ **CRITICAL WARNING - DO NOT MODIFY PRODUCTION SYSTEMS**
This document provides essential information about critical system components. **DO NOT** make changes to production systems without thorough testing and proper backup procedures.

---

## 🏗️ **Core Architecture Overview**

### Technology Stack
- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5.8.3
- **Database**: PostgreSQL with Prisma ORM 6.12.0
- **Authentication**: NextAuth v5 (beta.29) with JWT strategy
- **Styling**: Tailwind CSS 3.4.1 + shadcn/ui components
- **Internationalization**: next-intl 4.3.4 with domain-based routing
- **State Management**: Zustand 5.0.6 + TanStack Query 5.81.5
- **Deployment**: Vercel with Edge Runtime

### Critical System Dependencies
```json
{
  "next": "15.3.4",
  "next-auth": "5.0.0-beta.29",
  "@prisma/client": "6.12.0",
  "next-intl": "4.3.4",
  "@tanstack/react-query": "5.81.5",
  "zustand": "5.0.6"
}
```

---

## 🔐 **Authentication System - CRITICAL**

### NextAuth v5 Configuration
- **Strategy**: JWT (30-minute sessions)
- **Providers**: Credentials, Google, Facebook, Apple
- **Domain Support**: Cross-subdomain cookie sharing
- **Security**: CSRF protection, secure cookies in production

### Cookie Configuration
```javascript
// Production Cookies
'__Secure-next-auth.session-token' // Main session
'__Secure-next-auth.csrf-token'    // CSRF protection
'__Host-next-auth.csrf-token'      // Additional CSRF

// Domain: .mojposlic.com (allows subdomain sharing)
```

### Critical Auth Endpoints
- `/api/auth/[...nextauth]` - Main NextAuth handler
- `/api/auth/verify-email` - Email verification
- `/api/auth/create-transfer-token` - Cross-domain auth
- `/api/auth/transfer` - Domain transfer handler
- `/api/user/fresh-state` - Edge Runtime user data

### Critical Messaging & Application Endpoints ⚠️ **NEW (July 20, 2025)**
- `/api/user/privacy-settings` - Privacy controls management
- `/api/applications/[id]/status` - Application status updates (triggers messaging)
- `/api/jobs/[id]/applications` - Application management with messaging integration
- `/api/conversations` - Real-time conversation management
- `/api/messages` - Message sending and retrieval
- `/api/notifications` - Email and in-app notification delivery

### ⚠️ **CRITICAL AUTH ISSUES TO MONITOR**
1. **JWT Token Refresh**: Aggressive refresh strategy implemented
2. **Edge Runtime Compatibility**: API endpoints required for database access
3. **Cross-Domain Cookies**: Must work between mojposlic.com ↔ en.mojposlic.com
4. **Role Selection Flow**: Users without roles are redirected to onboarding

---

## 🌐 **Domain & Routing System - CRITICAL**

### Domain Configuration
```
PRODUCTION:
- mojposlic.com       → Bosnian (bs) locale
- en.mojposlic.com    → English (en) locale

DEVELOPMENT:
- localhost:3000      → Bosnian (bs) locale  
- en.localhost:3000   → English (en) locale
```

### Routing Strategy
- **Type**: Domain-based (NO URL prefixes)
- **Implementation**: next-intl with `localePrefix: 'never'`
- **Middleware**: Custom authentication + language detection

### ⚠️ **CRITICAL ROUTING WARNINGS**
1. **No Locale Prefixes**: URLs are `/dashboard`, not `/bs/dashboard`
2. **Middleware Dependency**: Authentication relies on domain detection
3. **Cookie Sharing**: Authentication cookies must work cross-domain
4. **Language Transfer**: JWT tokens used for cross-domain authentication

---

## 📊 **Database System - CRITICAL**

### Prisma Configuration
- **Client**: @prisma/client 6.12.0
- **Provider**: PostgreSQL
- **Migration Strategy**: Prisma migrations
- **Extensions**: @prisma/extension-accelerate for caching

### Critical Database Tables
```sql
-- Core Tables
users                 -- User accounts with roles
pending_registrations -- Email verification queue
verification_tokens   -- Email verification codes
jobs                  -- Job postings
applications          -- Job applications
conversations         -- Real-time messaging system
messages              -- Message content and attachments
user_privacy_settings -- Privacy controls and messaging permissions
connections           -- User connection system

-- Static Data (Cached)
categories            -- Job categories (30min cache)
cities                -- Location data (30min cache)
```

### ⚠️ **CRITICAL DATABASE WARNINGS**
1. **Edge Runtime**: Prisma doesn't work in Edge - use API endpoints
2. **Role Field**: Optional in schema - enforced through application logic
3. **Migrations**: Production requires manual migration review
4. **Connection Pool**: Monitor connection limits in production
5. **Privacy Settings**: UserPrivacySettings model controls messaging permissions
6. **Real-time Messaging**: Requires Supabase connection for live updates
7. **Application Workflow**: Automatic conversation creation for shortlisted applications

---

## � **Job Application & Messaging System - CRITICAL**

### Enhanced Job Application Workflow ✅ **IMPLEMENTED (July 20, 2025)**
- **WYSIWYG Editor**: TipTap-based rich text editor with character limits
- **Privacy-Aware Messaging**: Automatic conversation creation for shortlisted applications
- **Real-time Communication**: Supabase integration for live messaging
- **Email Notifications**: Localized notifications (English/Bosnian)
- **Application Management**: Enhanced dashboard with messaging integration

### Critical Messaging Components
```typescript
// Core Services
MessagingIntegrationService  // Privacy-aware job application messaging
PrivacyService              // Profile visibility and messaging permissions
ConversationService         // Supabase real-time messaging
MessageService              // Message broadcasting and persistence
EmailService                // Localized notification delivery

// Key React Components
SimpleRichTextEditor        // WYSIWYG editor for applications
PrivacySettingsCard        // Comprehensive privacy controls
DashboardApplicationManager // Enhanced application management
UnifiedJobsSection         // Integrated jobs and messaging dashboard
```

### Privacy & Messaging Features
- **Profile Visibility**: public, verified_only, private levels
- **Messaging Permissions**: User consent required for conversations
- **Automatic Workflow**: Shortlisted applications → conversation creation
- **Real-time Updates**: Live message delivery and read receipts
- **Email Integration**: Status change notifications with localization

### ⚠️ **CRITICAL MESSAGING SYSTEM WARNINGS**
1. **Supabase Dependency**: Real-time messaging requires external service
2. **Privacy Controls**: Database-enforced messaging permissions
3. **Conversation Workflow**: Automatic creation tied to application status
4. **Email Notifications**: Requires proper SMTP configuration
5. **Character Limits**: WYSIWYG editor enforces content validation
6. **User Consent**: Privacy settings must be respected for messaging access

---

## �🛡️ **Security Considerations - CRITICAL**

### Authentication Security
- **JWT Secrets**: Stored in NEXTAUTH_SECRET environment variable
- **Password Hashing**: bcrypt with 12 rounds
- **Session Expiry**: 30 minutes for faster token refresh
- **CSRF Protection**: Built into NextAuth

### API Security
- **Authentication**: All protected routes check JWT tokens
- **Role-Based Access**: Client-side UX only, server-side validation required
- **Rate Limiting**: Not implemented - should be added for production
- **Input Validation**: Zod schemas for request validation

### ⚠️ **CRITICAL SECURITY GAPS**
1. **Rate Limiting**: Missing on authentication endpoints
2. **API Validation**: Some endpoints lack comprehensive validation
3. **Audit Logging**: No audit trail for role changes or connections
4. **Admin Access**: Admin endpoints exist but need additional security
5. **Messaging Security**: Privacy controls prevent unauthorized conversation access
6. **Application Workflow**: Status changes trigger automatic messaging permissions
7. **Real-time Security**: Supabase RLS policies must match application privacy settings

---

## 🚀 **Performance & Caching - CRITICAL**

### Caching Strategy
- **Static Data**: 30-minute TTL for categories/cities
- **User Sessions**: JWT with 30-minute refresh cycle
- **API Responses**: No caching implemented
- **Build Cache**: Next.js automatic optimization

### Performance Optimizations
- **Component Memoization**: React.memo on expensive components
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Available via build tools

### ⚠️ **CRITICAL PERFORMANCE ISSUES**
1. **Database Queries**: No query optimization implemented
2. **API Caching**: Missing cache headers on most endpoints
3. **Connection Pooling**: May hit limits under load
4. **Memory Usage**: JWT refresh creates temporary Prisma clients

---

## 📱 **Mobile & Responsive - CRITICAL**

### Responsive Design
- **Framework**: Tailwind CSS responsive utilities
- **Breakpoints**: Standard Tailwind breakpoints
- **Components**: shadcn/ui components are mobile-first
- **Touch Optimization**: Not specifically optimized

### ⚠️ **CRITICAL MOBILE ISSUES**
1. **Touch Targets**: Some UI elements may be too small
2. **Performance**: Heavy JavaScript bundle for mobile
3. **Offline Support**: No offline functionality
4. **PWA Features**: Not implemented

---

## 🔧 **Development & Deployment - CRITICAL**

### Environment Configuration
```bash
# Required Environment Variables
NEXTAUTH_SECRET=          # JWT signing secret
NEXTAUTH_URL=            # Auth URL for callbacks
DATABASE_URL=            # PostgreSQL connection string
GOOGLE_CLIENT_ID=        # OAuth provider
GOOGLE_CLIENT_SECRET=    # OAuth provider

# Required for Messaging System (July 20, 2025)
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anonymous key
# ... additional OAuth providers
```

### Build Process
```bash
npm run build    # Production build
npm run dev      # Development with Turbopack
npm run lint     # ESLint checking
npm run db:push  # Database schema push
```

### ⚠️ **CRITICAL DEPLOYMENT WARNINGS**
1. **Environment Variables**: Must be set correctly in production
2. **Database Migrations**: Require manual review before deployment
3. **Domain Configuration**: Must match production domain setup
4. **Build Process**: Prisma generation must complete successfully
5. **Supabase Setup**: Messaging system requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## � **Messaging Infrastructure & NextAuth Integration - CRITICAL**

### Current Architecture (July 21, 2025)
- **Authentication**: NextAuth v5 (JWT) for user management
- **Real-time Messaging**: Supabase for conversations and messages  
- **Integration Pattern**: Hybrid architecture with custom JWT bridge
- **Database**: Prisma (users, jobs, applications) + Supabase (messaging tables)

### Authentication Integration Strategy
```typescript
// Custom JWT creation for Supabase compatibility
function createSupabaseJWT(userId: string, role: string) {
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    sub: userId,
    role: role,
    user_metadata: { user_id: userId, role: role }
  }
  return jwt.sign(payload, NEXTAUTH_SECRET)
}
```

### Supabase RLS Policies
```sql
-- Updated policies work with custom NextAuth JWTs
CREATE POLICY "jwt_users_can_send_messages" ON messages
FOR INSERT WITH CHECK (
  sender_id = get_current_user_id() AND
  user_participates_in_conversation(conversation_id, get_current_user_id())
);

-- Helper function reads from JWT claims
CREATE FUNCTION get_current_user_id() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(auth.uid()::text, current_setting('request.jwt.claims', true)::json->>'sub');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Critical Infrastructure Components
```typescript
// Core Integration Files
src/lib/supabase-nextauth-integration.ts  // JWT bridge between NextAuth & Supabase
src/lib/messaging/message-service.ts      // Authenticated message operations
src/contexts/messaging-context.tsx        // React state management
src/app/api/test-authenticated-message/   // Testing endpoint for auth
supabase/migrations/007_jwt_nextauth_integration.sql // RLS policies
```

### Environment Variables Required
```bash
# NextAuth (existing)
NEXTAUTH_SECRET=                    # JWT signing secret (shared with Supabase)
NEXTAUTH_URL=                      # Auth callback URL

# Supabase Messaging
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public key for client connections  
SUPABASE_SERVICE_ROLE_KEY=         # Admin key for server operations (use sparingly)

# Required Dependencies
npm install jsonwebtoken @types/jsonwebtoken  # JWT creation for Supabase
```

### Security Architecture
- **User Authentication**: NextAuth handles login, sessions, providers
- **Message Authorization**: Supabase RLS policies with custom JWT claims
- **Admin Operations**: Service role key only for conversation creation
- **User Context**: JWT includes userId and role for proper permissions

### ⚠️ **CRITICAL MESSAGING WARNINGS**
1. **JWT Secret Sharing**: NEXTAUTH_SECRET must be used for both NextAuth and Supabase JWTs
2. **RLS Policy Dependency**: Message operations fail if JWT doesn't include proper claims
3. **Service Key Usage**: Admin client only for conversation creation, not regular operations
4. **Migration Required**: RLS policies must be updated via `/api/migrate-jwt-nextauth`
5. **Testing Endpoint**: Use `/api/test-authenticated-message` to verify integration
6. **Token Expiry**: Custom JWTs expire in 1 hour, renewed on each operation

### Integration Benefits
- **Security**: Proper RLS policies instead of admin bypass for all operations
- **Performance**: No admin client overhead for message reads/writes
- **Maintainability**: Keep battle-tested NextAuth for user management
- **Scalability**: Supabase real-time messaging with proper user context
- **Zero Migration Risk**: No changes to existing auth or user data

### Troubleshooting Commands
```bash
# Test Supabase connection
curl http://localhost:3000/api/test-supabase

# Test authenticated messaging
curl -X POST http://localhost:3000/api/test-authenticated-message \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"uuid","content":"test message"}'

# Apply RLS migration
curl -X POST http://localhost:3000/api/migrate-jwt-nextauth

# Verify JWT integration
curl http://localhost:3000/api/test-authenticated-message
```

### Alternative Considered: Full Supabase Auth Migration
**Decision: NOT RECOMMENDED** for current system due to:
- **High Migration Risk**: 32+ database tables with complex relationships
- **Production Stability**: Current NextAuth system is battle-tested
- **Feature Completeness**: Advanced role management, cross-domain auth already working
- **Development Time**: Would require weeks/months of careful migration work

**Future Consideration**: Only migrate to full Supabase Auth if:
- Need Supabase-specific auth features (social auth improvements)
- Want to consolidate tech stack for simpler maintenance
- Have dedicated migration time (3-6 months)
- Need real-time auth state across multiple applications

---

### 1. JWT Token Refresh Loops
- **Issue**: Users stuck in redirect loops between pages
- **Cause**: Stale JWT tokens not updating role/profile status
- **Solution**: Aggressive refresh strategy implemented
- **Monitoring**: Watch for infinite redirects in logs

### 2. Edge Runtime Database Access
- **Issue**: Prisma doesn't work in Edge Runtime (middleware)
- **Cause**: Edge Runtime limitations
- **Solution**: API endpoints for database queries in middleware
- **Impact**: Additional API calls for authentication checks

### 3. Cross-Domain Authentication
- **Issue**: Authentication failing between subdomains
- **Cause**: Cookie domain configuration
- **Solution**: JWT transfer tokens for cross-domain auth
- **Risk**: Transfer tokens are temporary (60 seconds)

### 4. Role Selection Enforcement
- **Issue**: Users bypassing role selection
- **Cause**: Client-side role checks only
- **Solution**: Server-side middleware enforcement
- **Limitation**: Performance impact on every request

### 5. Real-time Messaging Dependencies ⚠️ **NEW (July 20, 2025)**
- **Issue**: Messaging system requires external Supabase service
- **Cause**: Real-time features need WebSocket connections
- **Solution**: Fallback to polling if WebSocket fails
- **Risk**: Service outage affects messaging but not core app functionality

### 6. Privacy Settings Synchronization ⚠️ **NEW (July 20, 2025)**
- **Issue**: Privacy changes may not immediately reflect in active conversations
- **Cause**: Cached privacy settings in messaging service
- **Solution**: Cache invalidation on privacy setting updates
- **Monitoring**: Check for delayed privacy enforcement in conversation access

### 7. Messaging Integration API Endpoint Mismatch ⚠️ **CRITICAL (July 20, 2025)**
- **Issue**: Shortlisting not creating conversations between taskers and clients
- **Cause**: Frontend calls `/api/applications/[id]` but messaging integration was only in `/api/jobs/[id]/applications/[applicationId]`
- **Solution**: Added messaging integration to `/api/applications/[id]` route
- **Risk**: Messaging may fail if Supabase environment variables are not configured
- **Required**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables
- **Setup Guide**: See `docs/messaging-system-setup.md` for complete setup instructions

### 8. NextAuth + Supabase Integration Authentication Errors ⚠️ **RESOLVED (July 21, 2025)**
- **Issue**: Messages failing with "new row violates row-level security policy" (42501 error)
- **Root Cause**: Supabase RLS policies expecting `auth.uid()` but NextAuth using different JWT format
- **Previous Solution**: Admin client bypass (security risk)
- **Current Solution**: Custom JWT creation with Supabase-compatible claims structure
- **Implementation**: `src/lib/supabase-nextauth-integration.ts` + updated RLS policies
- **Risk Level**: LOW - Proper security model now implemented
- **Monitoring**: Watch for JWT expiry errors (1-hour token lifetime)

### 9. RLS Policy Migration for Messaging System ⚠️ **ACTION REQUIRED (July 21, 2025)**
- **Issue**: New JWT-compatible RLS policies need to be applied to production
- **Required Action**: Run `/api/migrate-jwt-nextauth` endpoint to update database policies
- **Risk**: Messaging system will continue using admin bypass until migration applied
- **Impact**: Security improvement - moves from admin bypass to proper user permissions
- **Verification**: Test using `/api/test-authenticated-message` endpoint after migration
- **Rollback**: Admin client integration remains as fallback if migration fails

---

## 📞 **Emergency Contacts & Procedures**

### Production Issues
1. **Check Vercel Dashboard** for deployment status
2. **Monitor Database** connection pool and query performance
3. **Check Authentication Logs** for JWT errors
4. **Verify Domain Configuration** for routing issues
5. **Monitor Supabase Service** for real-time messaging status
6. **Check Email Notification Delivery** for application status updates
7. **Verify Privacy Settings API** for user permission issues
8. **Test Supabase Connection** using `node test-supabase-connection.js` to verify messaging system setup

### Rollback Procedures
1. **Vercel**: Use previous deployment from dashboard
2. **Database**: Have migration rollback scripts ready
3. **Environment Variables**: Keep previous configurations backed up
4. **DNS**: Verify domain configurations are correct

---

## 📝 **Change Log References**
- See `job-application-system-enhancement.md` for messaging system implementation
- See `changelog-2025-07-20.md` for latest system changes
- See `production-cleanup-2025-07-19.md` for deployment preparation
- See individual feature changelogs for specific system modifications

---

**⚠️ FINAL WARNING**: This system uses bleeding-edge technology (NextAuth v5 beta, Next.js 15) with complex domain-based routing, JWT authentication, and hybrid messaging architecture (NextAuth + Supabase). Any changes should be thoroughly tested in development environment first.

**Last Updated**: July 21, 2025  
**Document Version**: 1.1  
**System Version**: v0.1.1  
**Infrastructure Update**: Added NextAuth + Supabase messaging integration documentation
