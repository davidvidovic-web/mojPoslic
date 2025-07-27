# Registration Flow Implementation Plan

Based on Supabase documentation and best practices for Next.js App Router with Server-Side Authentication.

## Current Issues

1. **Session Establishment Timing**: Server-side email verification establishes session but client-side auth context doesn't immediately recognize it
2. **Multiple Route Handlers**: We have both `/auth/confirm` and `/[locale]/auth/confirm` routes which can cause conflicts
3. **Complex Client-Side Session Detection**: Too many retry mechanisms and complex timing logic
4. **Database Flag Management**: Not properly tracking user progress through the flow

## Planned Implementation

### Step 1: User Registration
**Current State**: ✅ Working correctly
- User fills registration form
- `supabase.auth.signUp()` called with email/password
- User receives verification email
- Database trigger creates user record with:
  - `email_verified: false`
  - `profile_setup_completed: false`
  - `role: null` (no default role - user must select)

### Step 2: Email Verification
**Current State**: ❌ Needs simplification
- User clicks verification link in email
- Link points to `/auth/confirm?token_hash=...&type=email`
- **ISSUE**: We need to consolidate route handlers

**Planned Fix**:
```typescript
// /app/auth/confirm/route.ts (SINGLE ROUTE HANDLER)
export async function GET(request: NextRequest) {
  const { searchParams, hostname } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  
  // Detect locale from domain (en.localhost:3000 vs localhost:3000)
  const locale = hostname.startsWith('en.') ? 'en' : 'bs'
  
  if (token_hash && type) {
    const supabase = createServerClient(...)
    
    // Verify OTP and get user
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error && data.user) {
      // Update user verification status in database
      await supabase
        .from('users')
        .update({ 
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.user.id)

      // Check user profile completion status
      const { data: userProfile } = await supabase
        .from('users')
        .select('profile_setup_completed, role')
        .eq('id', data.user.id)
        .single()

      // Direct redirect based on profile status (NO client-side detection needed)
      if (!userProfile.profile_setup_completed) {
        if (!userProfile.role) {
          // User needs to select role (no default role)
          return NextResponse.redirect(`${getBaseUrl(locale)}/role-selection`)
        } else {
          // User has role but needs profile setup
          return NextResponse.redirect(`${getBaseUrl(locale)}/profile-setup`)
        }
      } else {
        // Profile complete, go to dashboard
        return NextResponse.redirect(`${getBaseUrl(locale)}/dashboard`)
      }
    }
  }
  
  // Error handling
  return NextResponse.redirect(`${getBaseUrl(locale)}/auth/signin?error=verification_failed`)
}
```

### Step 3: Role Selection
**Current State**: ❌ Overly complex client-side session detection
- User lands on `/role-selection` after email verification
- **ISSUE**: Complex client-side session refresh logic

**Planned Fix**:
```typescript
// /app/[locale]/role-selection/page.tsx (SIMPLIFIED)
export default function RoleSelectionPage() {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()

  // Simple redirect logic - no complex session detection needed
  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (user.profileSetupCompleted) {
      router.push('/dashboard')
      return
    }

    // User is here correctly - show role selection
  }, [user, loading, router])

  const handleRoleSubmit = async (role: string) => {
    // Update role in database
    const response = await fetch('/api/user/role', {
      method: 'POST',
      body: JSON.stringify({ role })
    })

    if (response.ok) {
      // Refresh user context to get updated role
      await refreshUser()
      // Redirect to profile setup
      router.push('/profile-setup')
    }
  }

  // Simple render - no complex loading states
  if (loading) return <LoadingSpinner />
  if (!user) return null
  
  return <RoleSelectionForm onSubmit={handleRoleSubmit} />
}
```

### Step 4: Profile Setup
**Current State**: ✅ Logic is mostly correct
- User selects role → redirected to `/profile-setup`
- User fills profile information
- On submit: `profile_setup_completed: true`
- Redirect to dashboard

**Planned Enhancement**:
```typescript
// /app/api/user/profile/route.ts (Enhanced PUT method)
export async function PUT(request: Request) {
  // ... existing code ...
  
  // Mark profile as completed when all required fields are filled
  const profileData = {
    ...updateData,
    profile_setup_completed: true, // Mark as complete
    updated_at: new Date().toISOString()
  }

  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(profileData)
    .eq('id', user.id)
    .select('*')
    .single()

  return NextResponse.json({ 
    user: updatedUser,
    redirect: '/dashboard' // Tell frontend to redirect
  })
}
```

### Step 5: Dashboard Access
**Current State**: ✅ Working
- User with `profile_setup_completed: true` can access dashboard
- Protected by middleware and route guards

## Database Schema Requirements

### Users Table Fields:
```sql
users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  name text,
  role user_role DEFAULT NULL, -- No default role
  email_verified boolean DEFAULT false,
  profile_setup_completed boolean DEFAULT false,
  -- ... other fields
)
```

### Flow Tracking:
1. **Registration**: `email_verified: false, profile_setup_completed: false, role: null`
2. **Email Verified**: `email_verified: true, profile_setup_completed: false, role: null`
3. **Role Selected**: `email_verified: true, profile_setup_completed: false, role: [selected_role]`
4. **Profile Complete**: `email_verified: true, profile_setup_completed: true, role: [selected_role]`

## Authentication Context Simplification

### Remove Complex Session Detection:
```typescript
// /src/contexts/supabase-auth-context.tsx (SIMPLIFIED)
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Simple initialization - no complex retry logic
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session?.user) {
        await fetchUserData(session.user, session)
      }
      
      setLoading(false)
    }

    initializeAuth()

    // Listen for auth changes (this handles email verification automatically)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        setSession(session)
        
        if (session?.user) {
          await fetchUserData(session.user, session)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Simple user refresh - no complex retry logic
  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      await fetchUserData(session.user, session)
    }
  }, [])

  // ... rest of context
}
```

## Route Structure Cleanup

### Remove Duplicate Routes:
- ❌ Remove `/app/[locale]/auth/confirm/route.ts`
- ✅ Keep `/app/auth/confirm/route.ts` (handles all locales)

### Route Handler Responsibilities:
1. `/auth/confirm` - Email verification + redirect to appropriate next step
2. `/api/user/role` - Update user role
3. `/api/user/profile` - Update user profile + mark as complete

## Benefits of This Approach

1. **Server-Side Redirects**: No client-side session detection issues
2. **Simplified Logic**: Clear flow with database-driven state
3. **Better UX**: Immediate redirects after email verification
4. **Maintainable**: Less complex client-side code
5. **Supabase Best Practices**: Follows official documentation patterns

## Migration Steps

1. **Phase 1**: Consolidate route handlers
2. **Phase 2**: Simplify auth context
3. **Phase 3**: Update page components to remove complex session logic
4. **Phase 4**: Test complete flow
5. **Phase 5**: Remove unused code and components

## Testing Checklist

- [ ] User registers → receives email
- [ ] User clicks email link → automatically redirected to role-selection
- [ ] User selects role → automatically redirected to profile-setup
- [ ] User completes profile → automatically redirected to dashboard
- [ ] User tries to access protected pages → proper redirects
- [ ] Browser refresh at any step → maintains correct state

## Key Success Metrics

- **Zero client-side session detection retries**
- **Immediate redirects after email verification**
- **Clear, linear flow progression**
- **Proper state management in database**
- **No "/auth/signin" redirects during normal flow**
