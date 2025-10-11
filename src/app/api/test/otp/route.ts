import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    
    if (action === 'send_otp') {
      // Send OTP code
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false // Don't create new users, only existing ones
        }
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: 'OTP sent successfully',
        debug: {
          email,
          messageId: data?.messageId || 'N/A'
        }
      })
    } 
    
    if (action === 'verify_otp') {
      const { token } = await request.json()
      
      if (!token) {
        return NextResponse.json(
          { error: 'Token is required for verification' },
          { status: 400 }
        )
      }

      // Verify OTP code
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: 'OTP verified successfully',
        user: data.user,
        session: !!data.session
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "send_otp" or "verify_otp"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('OTP test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}