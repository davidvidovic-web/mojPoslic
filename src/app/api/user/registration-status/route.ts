import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // If it's specifically an "Auth session missing" error, handle it gracefully
    if (authError?.message === 'Auth session missing!' || !user) {
      return NextResponse.json({ 
        error: 'No authentication session',
        needsSignIn: true
      }, { status: 401 })
    }

    if (authError) {
      console.error('Auth error in registration status:', authError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }

    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role, profile_setup_completed, email_verified')
      .eq('id', user.id)
      .single()

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!dbUser) {
      // User doesn't exist in database yet, they need to complete registration
      return NextResponse.json({
        needsRole: true,
        needsProfile: true,
        isComplete: false,
        userState: {
          role: null,
          profileSetupCompleted: false,
          emailVerified: !!user.email_confirmed_at
        }
      })
    }

    // Determine what the user needs to complete
    const needsRole = !dbUser.role
    const needsProfile = dbUser.role && !dbUser.profile_setup_completed
    const isComplete = dbUser.role && dbUser.profile_setup_completed && (dbUser.email_verified || !!user.email_confirmed_at)

    return NextResponse.json({
      needsRole,
      needsProfile,
      isComplete,
      userState: {
        role: dbUser.role,
        profileSetupCompleted: dbUser.profile_setup_completed,
        emailVerified: dbUser.email_verified || !!user.email_confirmed_at
      }
    })

  } catch (error) {
    console.error('Registration status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
