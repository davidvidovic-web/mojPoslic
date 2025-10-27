import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

// Helper function to get domain-based URLs
function getLocalizedUrl(path: string, locale: string): string {
  const baseDomain = process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'mojposlic.com'
  const protocol = process.env.NODE_ENV === 'development' ? 'http:' : 'https:'
  
  if (locale === 'en') {
    return `${protocol}//en.${baseDomain}${path}`
  } else {
    return `${protocol}//${baseDomain}${path}`
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, hostname } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  
  // Detect locale from domain
  const locale = hostname.startsWith('en.') ? 'en' : 'bs'
  const next = searchParams.get('next') ?? getLocalizedUrl('/dashboard', locale)

  // Create response object first for cookie handling
  const verifyToken = Math.random().toString(36).substring(2, 15)
  const response = NextResponse.redirect(getLocalizedUrl(`/role-selection?verified=true&token=${verifyToken}`, locale))

  try {
    if (token_hash && type) {
      const cookieStore = await cookies()
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
              response.cookies.set(name, value, options)
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: '', ...options })
              response.cookies.set(name, '', options)
            },
          },
        }
      )
      
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (!error && data.user) {
        
        // Set the session properly for the user
        if (data.session) {
        }
        
        // Mark user as email verified in our database
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)
        
        if (updateError) {
          // Don't fail the whole process for this
        } else {
        }
        
        // Check user profile setup status - try both ID and email lookup
        let userProfile = null
        let profileError = null
        
        // First try by user ID
        const { data: profileById, error: errorById } = await supabase
          .from('users')
          .select('profile_setup_completed, role, email, name')
          .eq('id', data.user.id)
          .single()
        
        if (!errorById && profileById) {
          userProfile = profileById
        } else {
          
          // Try by email as fallback
          const { data: profileByEmail, error: errorByEmail } = await supabase
            .from('users')
            .select('profile_setup_completed, role, email, name')
            .eq('email', data.user.email!)
            .single()
          
          if (!errorByEmail && profileByEmail) {
            userProfile = profileByEmail
          } else {
            profileError = errorById // Use the original ID error for handling
          }
        }

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          
          // If user profile doesn't exist, create it manually
          if (profileError.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                name: data.user.email!.split('@')[0],
                profile_setup_completed: false
                // No default role - user will select during onboarding
              })
            
            if (createError) {
              console.error('Failed to create user profile:', createError)
              
              // If it's a duplicate error, the profile might exist with different lookup
              if (createError.code === '23505') {
                return NextResponse.redirect(getLocalizedUrl('/dashboard', locale))
              }
            } else {
              // Return the response we prepared with proper cookie handling
              return response
            }
          }
          
          // For other errors, redirect to dashboard
          return NextResponse.redirect(getLocalizedUrl('/dashboard', locale))
        }

        // Handle profile setup flow (no locale prefix needed with domain-based routing)
        if (userProfile && !userProfile.profile_setup_completed) {
          // Always redirect to role selection first for new users to let them choose their role
          return response // This already points to role-selection with verified=true&token
        }

        // Profile is complete, redirect to specified page or dashboard
        // Add verified parameter to help with auth context on dashboard
        const dashboardUrl = next.includes('?') 
          ? `${next}&verified=true` 
          : `${next}?verified=true`
        return NextResponse.redirect(dashboardUrl)
      } else {
        console.error('Token verification failed:', error)
        
        // Handle specific error cases
        if (error?.code === 'otp_expired' || error?.message?.includes('invalid or has expired')) {
          // Token expired/used - check if user is already authenticated
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          
          if (currentUser && currentUser.email_confirmed_at) {
            return NextResponse.redirect(getLocalizedUrl('/dashboard', locale))
          } else {
            return NextResponse.redirect(getLocalizedUrl('/auth/signin?error=expired_link&message=Please request a new verification email', locale))
          }
        }
        
        return NextResponse.redirect(getLocalizedUrl('/auth/signin?error=verification_failed&message=' + encodeURIComponent(error?.message || 'Unknown error'), locale))
      }
    }
    
    // Missing parameters
    console.error('Missing verification parameters:', { token_hash: !!token_hash, type })
    return NextResponse.redirect(getLocalizedUrl('/auth/signin?error=invalid_verification_link', locale))
    
  } catch (error) {
    console.error('Auth confirm error:', error)
    // For redirect errors, just return the prepared response
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      return response
    }
    return NextResponse.redirect(getLocalizedUrl('/auth/signin?error=verification_error', locale))
  }
}
