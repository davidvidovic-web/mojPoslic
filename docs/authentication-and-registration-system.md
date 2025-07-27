# Authentication and Registration System Documentation

## Overview

This document provides a comprehensive overview of the authentication and registration system in the MojPoslic application. The system uses Supabase for authentication with a custom user management layer and complex session synchronization to handle email verification flows.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Authentication Flow](#authentication-flow)
3. [Registration Flow](#registration-flow)
4. [Session Management](#session-management)
5. [User Roles and Guards](#user-roles-and-guards)
6. [API Endpoints](#api-endpoints)
7. [Components](#components)
8. [Circuit Breaker Pattern](#circuit-breaker-pattern)
9. [Email Verification](#email-verification)
10. [Middleware](#middleware)
11. [Troubleshooting](#troubleshooting)

## System Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Authentication**: Supabase Auth with Server-Side Rendering (SSR)
- **Database**: Supabase PostgreSQL 
- **State Management**: Zustand (global state) + React Context API (auth state)
- **Email Service**: Supabase Auth (for verification emails)
- **Styling**: Tailwind CSS with shadcn/ui components

### Core Components
- **Supabase Auth Context**: Central auth state management
- **Registration Flow Guard**: Handles onboarding flow with circuit breaker
- **Session Sync Utilities**: Force client-server session synchronization
- **Auth Guards**: Role-based route protection
- **Middleware**: Request routing and session management

## Authentication Flow

### 1. Sign In Process (`/auth/signin`)

**File**: `src/app/[locale]/auth/signin/page.tsx`

1. User enters email and password
2. Form validation and submission
3. Supabase auth sign-in call
4. Error handling for:
   - Email not confirmed
   - Invalid credentials
   - Account not found
5. Success redirects to returnUrl or dashboard

**Key Features**:
- Password visibility toggle
- Return URL support for post-login redirects
- Automatic redirect for already authenticated users
- Comprehensive error handling with localized messages

### 2. Sign Out Process

Handled through the Supabase Auth context:
```typescript
const { signOut } = useSupabaseAuth()
await signOut()
```

## Registration Flow

### 1. Registration Page (`/auth/register`)

**File**: `src/app/[locale]/auth/register/page.tsx`

1. User fills registration form (email, password)
2. Password strength validation
3. Supabase auth sign-up with email redirect
4. **Supabase automatically sends verification email**
5. Redirect to verification page

**Features**:
- Real-time password strength indicator
- Form validation
- Duplicate user detection
- **Supabase handles email verification automatically**
- Email redirect configuration (`emailRedirectTo: /auth/callback`)

### 2. Email Verification Process

**Handled automatically by Supabase Auth**

The application uses Supabase's built-in email verification system:

1. **Automatic Email Sending**: Supabase sends verification emails immediately after registration
2. **Email Click Handling**: Verification links redirect to `/auth/callback`
3. **Session Establishment**: The callback page handles session sync and user flow
4. **No Manual Verification Page**: The dedicated `/auth/verify-email` page is not used in the current system

**Email Flow**:
- User registers → Supabase sends email → User clicks link → `/auth/callback` → Role selection or dashboard


### 3. Auth Callback (`/auth/callback`)

**File**: `src/app/[locale]/auth/callback/page.tsx`

Handles email verification links and auth redirects:

1. **Post-reload handling**: Manages auth state after page reload
2. **Session confirmation**: Validates and establishes sessions
3. **Session synchronization**: Forces client-server sync
4. **Error handling**: Comprehensive error states with fallbacks

**Critical Features**:
- Circuit breaker integration
- Session sync after email verification
- Proper error handling for failed callbacks
- Reload state management

### 4. Role Selection (`/role-selection`)

**File**: `src/app/[locale]/role-selection/page.tsx`

1. Present role options (Tasker, Client, Company)
2. Role selection and submission
3. Profile setup redirect
4. React-compliant navigation (useEffect-based)

**Role Options**:
- **Tasker**: Individual service provider
- **Client**: Individual seeking services
- **Company**: Business entity

## Session Management

### Authentication State Management

The application uses a **hybrid approach** for state management:

- **Zustand Stores**: Used for general application state (forms, filters, UI preferences, notifications, navigation, dialogs)
- **React Context**: Used specifically for authentication state due to its integration requirements with Supabase SSR

### Zustand Stores

**Files in `src/stores/`**:
- `form-state-store.ts` - Multi-step form state and validation
- `notification-store.ts` - Toast notifications and alerts
- `filter-store.ts` - Job filtering and search state (with persistence)
- `ui-preferences-store.ts` - User interface preferences (with persistence)
- `navigation-store.ts` - Navigation state and breadcrumbs (with persistence)
- `dialog-store.ts` - Modal and dialog state management

### Supabase Auth Context

**File**: `src/contexts/supabase-auth-context.tsx`

Central authentication state management:

```typescript
interface SupabaseAuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: boolean
  isClient: boolean
  isTasker: boolean
  isCompany: boolean
  signOut: () => Promise<void>
}
```

**Key Features**:
- Extended user interface with role and profile data
- Automatic session refresh
- Role-based helper methods
- Authorization header management
- Graceful fallbacks for incomplete user data

**Why React Context for Auth?**:
- Deep integration with Supabase SSR package
- Provider pattern required for auth state across component tree
- Session management requires React lifecycle integration
- Authentication is foundational state that rarely changes

### Zustand vs Context Usage

```typescript
// Zustand - General app state
import { useFormStateStore } from '@/stores/form-state-store'
import { useNotificationStore } from '@/stores/notification-store'
import { useFilterStore } from '@/stores/filter-store'

// React Context - Auth state only
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
```

### Session Synchronization

**File**: `src/components/auth/session-sync.tsx`

Force client-server session sync:

```typescript
const useSessionSync = () => {
  return useCallback(async (session?: Session) => {
    // Sync session with server via API call
  }, [])
}
```

**Purpose**: Resolves session desync issues between client auth context and server-side validation.

### Session Establishment API

**File**: `src/app/api/auth/establish-session/route.ts`

Server endpoint to force session establishment:
- Accepts access_token and refresh_token
- Creates server-side session with explicit tokens
- Sets proper authentication cookies

## User Roles and Guards

### User Roles
```typescript
type UserRole = 'admin' | 'client' | 'tasker' | 'company'
```

### Auth Guards

1. **Basic Auth Guard** (`src/components/auth/auth-guard.tsx`)
   - Requires authentication
   - Redirects to signin if unauthenticated

2. **Role Guard** (`src/components/auth/role-guard.tsx`)
   - Requires specific role
   - Configurable fallback paths

3. **Registration Flow Guard** (`src/components/auth/registration-flow-guard.tsx`)
   - Manages complete onboarding flow
   - Circuit breaker for infinite redirects
   - Database-driven flow state

4. **Supabase Auth Guard** (`src/components/auth/supabase-auth-guard.tsx`)
   - Supabase-specific authentication logic
   - Session validation

## API Endpoints

### Authentication Endpoints

1. **`/api/auth/register`** - User registration (Legacy Prisma with custom email service)
2. **`/api/auth/supabase/register`** - **Primary Supabase registration** (uses Supabase auth emails)
3. **`/api/auth/establish-session`** - Force session establishment
4. **`/api/auth/session`** - Session management
5. **`/api/auth/verify-email`** - Email verification (Legacy)
6. **`/api/auth/resend-verification`** - Resend verification email (Legacy)
7. **`/api/auth/setup-profile`** - Profile setup after registration
8. **`/api/auth/check-username`** - Username availability
9. **`/api/auth/auto-login`** - Automatic login utilities
10. **`/api/auth/transfer`** - Account transfer utilities
11. **`/api/auth/create-transfer-token`** - Transfer token creation

### Current Registration Flow
The app **primarily uses Supabase's built-in email verification**:
- Frontend calls `supabase.auth.signUp()` directly
- Alternative: `/api/auth/supabase/register` endpoint
- Supabase handles email sending and verification
- Email redirects to `/auth/callback` for processing

### Key API Features
- Comprehensive error handling
- **Supabase handles email verification automatically**
- Development and production email support via Supabase
- Session token management
- Legacy Prisma endpoints still available for migration

## Circuit Breaker Pattern

### Purpose
Prevents infinite redirect loops during authentication flows.

### Implementation
**File**: `src/components/auth/registration-flow-guard.tsx`

```typescript
const [redirectCount, setRedirectCount] = useState(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-redirect-count');
    return stored ? parseInt(stored, 10) : 0;
  }
  return 0;
});
```

### Features
- Persistent across page reloads
- 3-redirect limit before activation
- 30-second auto-reset
- Manual reset capability
- Comprehensive logging

### Manual Reset
```javascript
localStorage.removeItem('auth-redirect-count');
location.reload();
```

## Email Verification

### Flow
1. User registers with email/password via `supabase.auth.signUp()`
2. **Supabase automatically sends verification email**
3. User clicks email link → `/auth/callback`
4. Session establishment and sync
5. Flow guard determines next step (role selection/dashboard)

### Email Configuration
- **Supabase Auth handles all email sending**
- Email template customizable in Supabase dashboard
- Redirect URL: `${origin}/auth/callback`
- No custom SMTP required (Supabase provides email service)

### Key Challenges Solved
- Session desync between client and server
- React render phase navigation violations
- Circuit breaker for redirect loops
- Proper error handling for failed verifications

## Middleware

**File**: `middleware.ts`

### Responsibilities
1. **Internationalization**: Route handling for multiple locales
2. **Session Management**: Updates sessions for authenticated API routes
3. **Auth Callback Handling**: Skips session updates for auth callbacks
4. **Static File Optimization**: Early returns for static assets

### Key Features
- Selective session updates (avoids auth endpoint conflicts)
- Auth callback detection and bypass
- Error handling for session update failures
- Performance optimization for static files

## Components

### Form Components

1. **`auth-form.tsx`** - Generic auth form wrapper
2. **`SupabaseAuthForm.tsx`** - Supabase-specific auth form
3. **`password-strength-indicator.tsx`** - Real-time password validation
4. **`change-password-form.tsx`** - Password change functionality

### UI Components

1. **`conditional-header.tsx`** - Header visibility based on route
2. **`conditional-footer.tsx`** - Footer visibility based on route

### Legacy Components

1. **`prisma-auth-form.tsx`** - Legacy Prisma-based authentication

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**
   - **Cause**: Session desync between client and server
   - **Solution**: Session sync via establish-session API

2. **Infinite Redirect Loops**
   - **Cause**: Registration flow logic errors
   - **Solution**: Circuit breaker pattern automatically prevents

3. **React Render Phase Errors**
   - **Cause**: router.push() calls during component render
   - **Solution**: Move navigation to useEffect hooks

4. **Email Verification Failures**
   - **Cause**: Session not properly established after email click
   - **Solution**: Comprehensive callback handling with session sync

### Debug Tools

1. **Circuit Breaker Status**
   ```javascript
   console.log('Redirect count:', localStorage.getItem('auth-redirect-count'));
   ```

2. **Session State**
   ```javascript
   const { user, session, loading } = useSupabaseAuth();
   console.log({ user, session, loading });
   ```

3. **Manual Session Sync**
   ```javascript
   const syncSession = useSessionSync();
   await syncSession();
   ```

### Reset Procedures

1. **Clear Circuit Breaker**
   ```javascript
   localStorage.removeItem('auth-redirect-count');
   location.reload();
   ```

2. **Clear All Auth State**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   document.cookie.split(";").forEach(cookie => {
     const eqPos = cookie.indexOf("=");
     const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
     document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
   });
   location.reload();
   ```

## Environment Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase Configuration
- Email confirmation required
- Email redirect to `/auth/callback`
- **Supabase provides built-in email service**
- Custom SMTP can be configured in Supabase dashboard (optional)
- Email templates customizable in Supabase Auth settings

## Security Considerations

1. **Session Security**: Server-side session validation
2. **CSRF Protection**: Built-in with Supabase SSR
3. **Input Validation**: Zod schemas for API endpoints
4. **Password Security**: bcrypt hashing (legacy), Supabase auth (current)
5. **Role-based Access**: Multiple guard layers

## Performance Optimizations

1. **Zustand for Performance**: Most app state uses Zustand for better performance and smaller bundle size
2. **Context Only for Auth**: React Context limited to authentication to avoid unnecessary re-renders
3. **Circuit Breaker**: Prevents excessive redirects
4. **Session Caching**: Reduces database calls
5. **Static File Handling**: Early middleware returns
6. **Selective Session Updates**: Only for authenticated routes
7. **Persistent Stores**: Zustand persistence for user preferences and filters

## Migration Notes

### From Prisma to Supabase
- Legacy Prisma auth endpoints still exist
- New Supabase endpoints preferred
- Gradual migration in progress
- Both systems can coexist

### Future Improvements
1. Complete Prisma removal
2. Enhanced error boundaries
3. Better loading states
4. More granular role permissions
5. OAuth provider integration

---

**Last Updated**: July 25, 2025
**Version**: 1.0
**Maintainer**: Development Team
