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

---

## 🛡️ **Security Considerations - CRITICAL**

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

---

## 🚨 **Known Critical Issues**

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

---

## 📞 **Emergency Contacts & Procedures**

### Production Issues
1. **Check Vercel Dashboard** for deployment status
2. **Monitor Database** connection pool and query performance
3. **Check Authentication Logs** for JWT errors
4. **Verify Domain Configuration** for routing issues

### Rollback Procedures
1. **Vercel**: Use previous deployment from dashboard
2. **Database**: Have migration rollback scripts ready
3. **Environment Variables**: Keep previous configurations backed up
4. **DNS**: Verify domain configurations are correct

---

## 📝 **Change Log References**
- See `changelog-2025-07-20.md` for latest system changes
- See `production-cleanup-2025-07-19.md` for deployment preparation
- See individual feature changelogs for specific system modifications

---

**⚠️ FINAL WARNING**: This system uses bleeding-edge technology (NextAuth v5 beta, Next.js 15) with complex domain-based routing and JWT authentication. Any changes should be thoroughly tested in development environment first.

**Last Updated**: July 20, 2025  
**Document Version**: 1.0  
**System Version**: v0.1.1
