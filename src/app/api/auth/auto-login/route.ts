import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, verificationToken } = await request.json()

    if (!email || !verificationToken) {
      return NextResponse.json(
        { error: 'Email and verification token are required' },
        { status: 400 }
      )
    }

    // Use NextAuth signIn with a special flag for post-verification login
    const result = await signIn('credentials', {
      email,
      password: `__VERIFIED_AUTO_LOGIN__${verificationToken}`, // Special password pattern
      redirect: false
    })

    if (result?.error) {
      return NextResponse.json(
        { error: 'Auto-login failed' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Auto-login successful'
    })
  } catch (error) {
    console.error('Auto-login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
