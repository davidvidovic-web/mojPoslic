import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  
  try {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? `/${locale}/dashboard`

    console.log('Auth confirm called with:', { 
      locale: locale,
      token_hash: token_hash?.substring(0, 10) + '...', 
      type,
      next,
      fullUrl: request.url 
    })

    if (token_hash && type) {
      const supabase = await createServerSupabaseClient()
      
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (!error && data.user) {
        console.log('User verified successfully:', data.user.email)
        
        // Check user profile setup status
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('profile_setup_completed, role')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          redirect(next)
        }

        // Handle profile setup flow
        if (userProfile && !userProfile.profile_setup_completed) {
          if (!userProfile.role) {
            console.log('Redirecting to role selection')
            redirect(`/${locale}/role-selection`)
          } else {
            console.log('Redirecting to complete profile')
            redirect(`/${locale}/profile-setup`)
          }
        }

        // Profile is complete, redirect to specified page or dashboard
        console.log('Redirecting to:', next)
        redirect(next)
      } else {
        console.error('Token verification failed:', error)
        redirect(`/${locale}/auth/signin?error=verification_failed&message=` + encodeURIComponent(error?.message || 'Unknown error'))
      }
    }

    // Missing parameters
    console.error('Missing verification parameters:', { token_hash: !!token_hash, type })
    redirect(`/${locale}/auth/signin?error=invalid_verification_link`)
    
  } catch (error) {
    console.error('Auth confirm error:', error)
    redirect(`/${locale}/auth/signin?error=verification_error`)
  }
}
