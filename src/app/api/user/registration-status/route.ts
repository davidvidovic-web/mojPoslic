import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Registration status check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
      isAuthSessionMissing: authError?.message === 'Auth session missing!'
    })

    // If it's specifically an "Auth session missing" error, handle it gracefully
    if (authError?.message === 'Auth session missing!' || !user) {
      console.log('No valid auth session - user needs to sign in')
      return NextResponse.json({ 
        error: 'No authentication session',
        needsSignIn: true
      }, { status: 401 })
    }

    if (authError) {
      console.error('Auth error in registration status:', authError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }

    const prisma = new PrismaClient()

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        role: true,
        profileSetupCompleted: true,
        emailVerified: true
      }
    })

    await prisma.$disconnect()

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
    const needsProfile = dbUser.role && !dbUser.profileSetupCompleted
    const isComplete = dbUser.role && dbUser.profileSetupCompleted && (dbUser.emailVerified || !!user.email_confirmed_at)

    return NextResponse.json({
      needsRole,
      needsProfile,
      isComplete,
      userState: {
        role: dbUser.role,
        profileSetupCompleted: dbUser.profileSetupCompleted,
        emailVerified: dbUser.emailVerified || !!user.email_confirmed_at
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
