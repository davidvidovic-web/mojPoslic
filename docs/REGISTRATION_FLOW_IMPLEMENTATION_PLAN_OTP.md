# Registration Flow Implementation Plan - OTP Version

## Overview
This document outlines the complete implementation plan for the registration and email verification flow using OTP (One-Time Password) verification codes instead of magic links, based on Supabase documentation and best practices.

## Why OTP Instead of Magic Links?
- **Email Prefetching Protection**: Magic links can be consumed by email security scanners before users click them
- **Better User Experience**: 6-digit codes are simple and reliable
- **No URL Issues**: Eliminates redirect problems and complex URL handling
- **Mobile Friendly**: Easier to handle on mobile devices

## Target Flow
1. User fills registration form
2. User receives email with 6-digit OTP code
3. User enters OTP code in verification form
4. System verifies code and redirects to role selection
5. User selects role and proceeds to profile setup
6. User completes profile and reaches dashboard

## Core Architecture Principles

### 1. OTP-Based Authentication
- Use `signInWithOtp()` to send 6-digit codes via email
- Use `verifyOtp()` with `type: 'email'` to verify codes
- Codes valid for 1 hour, verification window 60 seconds
- Email templates use `{{ .Token }}` instead of `{{ .ConfirmationURL }}`

### 2. Database Schema
- Users start with `role: null` in `public.users`
- Role gets set only during role selection step
- No default role assignment in triggers

### 3. Simplified Auth Context
- Initialize directly from `supabase.auth.getUser()`
- Use `onAuthStateChange` for real-time updates
- Handle null roles gracefully throughout app

## Detailed Implementation

### Step 1: User Registration with OTP
**Current State**: ❌ Uses signUp with email verification links
**New Implementation**: ✅ Use signInWithOtp for registration

```typescript
// /app/[locale]/auth/register/page.tsx
'use client'

import { useState } from 'react'
import { useSupabase } from '@/contexts/supabase-auth-context'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const { supabase } = useSupabase()
  const router = useRouter()

  // Step 1: Send OTP code
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Send OTP to email (will create user if they don't exist)
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Allow user creation
          data: {
            // Include password for user creation (optional)
            password: password
          }
        }
      })

      if (error) throw error

      setOtpSent(true)
      // Show OTP input form
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP code
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) throw error

      // User is now logged in
      // Redirect to role selection (auth context will handle this)
      router.push('/role-selection')
    } catch (error) {
      console.error('OTP verification error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (otpSent) {
    return (
      <div>
        <h1>Check Your Email</h1>
        <p>We sent a 6-digit code to {email}</p>
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
        <button onClick={() => handleRegister()} disabled={loading}>
          Resend Code
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending Code...' : 'Send Verification Code'}
        </button>
      </form>
    </div>
  )
}
```

### Step 2: Email Template Configuration
**Current State**: ❌ Uses magic link template with `{{ .ConfirmationURL }}`
**New Implementation**: ✅ Use OTP template with `{{ .Token }}`

Update email templates in Supabase Dashboard > Auth > Email Templates:

**Magic Link Template (convert to OTP)**:
```html
<h2>Welcome! Verify Your Email</h2>
<p>Your verification code is:</p>
<h1 style="font-size: 32px; text-align: center; background: #f0f0f0; padding: 20px; margin: 20px 0;">{{ .Token }}</h1>
<p>This code will expire in 60 seconds. If you didn't request this code, please ignore this email.</p>
<p>Welcome to our platform!</p>
```

**Signup Confirmation Template**:
```html
<h2>Complete Your Registration</h2>
<p>Your verification code is:</p>
<h1 style="font-size: 32px; text-align: center; background: #f0f0f0; padding: 20px; margin: 20px 0;">{{ .Token }}</h1>
<p>Enter this code to complete your registration. Code expires in 60 seconds.</p>
```

### Step 3: Simplified Auth Context
**Current State**: ❌ Complex session detection and retry logic
**New Implementation**: ✅ Simple initialization with null role handling

```typescript
// /src/contexts/supabase-auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface SupabaseAuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  loading: boolean
  supabase: typeof supabase
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  supabase
})

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserRole(session.user.id)
        } else {
          setUserRole(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      setUserRole(userData?.role || null)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SupabaseAuthContext.Provider value={{
      user,
      session,
      userRole,
      loading,
      supabase
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}
```

### Step 4: Role Selection Page
**Current State**: ❌ Complex session detection logic
**New Implementation**: ✅ Simple auth state handling

```typescript
// /app/[locale]/role-selection/page.tsx
'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useRouter } from 'next/navigation'

export default function RoleSelectionPage() {
  const { user, userRole, loading, supabase } = useSupabaseAuth()
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Redirect if user already has a role
  if (!loading && userRole) {
    router.push('/profile-setup')
    return null
  }

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/auth/signin')
    return null
  }

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: selectedRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Role updated, proceed to profile setup
      router.push('/profile-setup')
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Select Your Role</h1>
      <div>
        <label>
          <input
            type="radio"
            value="jobseeker"
            checked={selectedRole === 'jobseeker'}
            onChange={(e) => setSelectedRole(e.target.value)}
          />
          Job Seeker
        </label>
        <label>
          <input
            type="radio"
            value="employer"
            checked={selectedRole === 'employer'}
            onChange={(e) => setSelectedRole(e.target.value)}
          />
          Employer
        </label>
      </div>
      <button 
        onClick={handleRoleSelection}
        disabled={!selectedRole || submitting}
      >
        {submitting ? 'Saving...' : 'Continue'}
      </button>
    </div>
  )
}
```

### Step 5: Login Page with OTP Support
**Current State**: ❌ Only password-based login
**New Implementation**: ✅ Support both password and OTP login

```typescript
// /app/[locale]/auth/signin/page.tsx
'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [useOtp, setUseOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const { supabase } = useSupabaseAuth()
  const router = useRouter()

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Success - auth context will handle redirect
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false // Don't create new users on login
        }
      })

      if (error) throw error

      setOtpSent(true)
    } catch (error) {
      console.error('OTP send error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) throw error

      // Success - auth context will handle redirect
      router.push('/dashboard')
    } catch (error) {
      console.error('OTP verification error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (otpSent) {
    return (
      <div>
        <h1>Check Your Email</h1>
        <p>We sent a 6-digit code to {email}</p>
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
        <button onClick={() => setOtpSent(false)}>
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Sign In</h1>
      
      <div>
        <label>
          <input
            type="radio"
            checked={!useOtp}
            onChange={() => setUseOtp(false)}
          />
          Sign in with password
        </label>
        <label>
          <input
            type="radio"
            checked={useOtp}
            onChange={() => setUseOtp(true)}
          />
          Sign in with email code
        </label>
      </div>

      <form onSubmit={useOtp ? handleOtpLogin : handlePasswordLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        
        {!useOtp && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        )}
        
        <button type="submit" disabled={loading}>
          {loading 
            ? (useOtp ? 'Sending Code...' : 'Signing In...') 
            : (useOtp ? 'Send Code' : 'Sign In')
          }
        </button>
      </form>
    </div>
  )
}
```

### Step 6: Database Migration (Already Complete)
**Current State**: ✅ Complete - trigger updated to not set default roles

The database migration `20250727100000_remove_default_role.sql` has been applied successfully:

```sql
-- Users start with role: null
-- Role gets set only during role selection step
-- No default role assignment in triggers
```

### Step 7: Middleware Update
**Current State**: ❌ May need updates for OTP flow
**New Implementation**: ✅ Handle null roles in middleware

```typescript
// /src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const hostname = request.nextUrl.hostname
  const locale = hostname.startsWith('en.') ? 'en' : 'bs'

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // If no user, redirect to signin (except for auth pages)
  if (!user && !request.nextUrl.pathname.includes('/auth/')) {
    return NextResponse.redirect(new URL(`/${locale}/auth/signin`, request.url))
  }

  // If user exists, check their role and profile completion
  if (user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, profile_setup_completed')
      .eq('id', user.id)
      .single()

    const currentPath = request.nextUrl.pathname

    // Role selection required
    if (!userProfile?.role && !currentPath.includes('/role-selection')) {
      return NextResponse.redirect(new URL(`/${locale}/role-selection`, request.url))
    }

    // Profile setup required
    if (userProfile?.role && !userProfile?.profile_setup_completed && !currentPath.includes('/profile-setup')) {
      return NextResponse.redirect(new URL(`/${locale}/profile-setup`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Testing Checklist

### 1. Registration Flow
- [ ] User can enter email and password
- [ ] OTP code is sent to email (check spam folder)
- [ ] User can enter 6-digit code and get verified
- [ ] User is redirected to role selection after verification
- [ ] Database shows user with `role: null` initially

### 2. Role Selection
- [ ] User can select role (jobseeker/employer)
- [ ] Role is saved to database
- [ ] User is redirected to profile setup

### 3. Profile Setup
- [ ] User can complete profile
- [ ] `profile_setup_completed` flag is set to true
- [ ] User is redirected to dashboard

### 4. Login Flow
- [ ] Users can login with password
- [ ] Users can login with OTP code
- [ ] Both methods redirect appropriately based on user state

### 5. Email Templates
- [ ] Registration emails contain 6-digit OTP codes
- [ ] Login emails contain 6-digit OTP codes
- [ ] Codes are properly formatted and readable

### 6. Error Handling
- [ ] Expired OTP codes show appropriate error
- [ ] Invalid OTP codes show appropriate error
- [ ] Network errors are handled gracefully
- [ ] User can resend codes when needed

## Benefits of OTP Implementation

1. **Security**: No URL-based attacks, codes expire quickly
2. **Reliability**: No email prefetching issues
3. **User Experience**: Simple 6-digit codes are easy to use
4. **Mobile Friendly**: No complex URL handling on mobile
5. **Reduced Support**: Fewer redirect and URL-related issues

## Future Enhancements

1. **SMS Support**: Add phone number OTP as alternative
2. **Rate Limiting**: Implement proper rate limiting for OTP requests
3. **Brute Force Protection**: Add protection against OTP guessing
4. **Resend Logic**: Smart resend timing and limits
5. **UI/UX**: Better OTP input components and feedback
