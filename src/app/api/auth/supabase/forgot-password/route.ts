import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Debug environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Environment check:', {
      hasSupabaseUrl,
      hasSupabaseKey,
      nodeEnv: process.env.NODE_ENV
    })

    const supabase = await createServerSupabaseClient()
    
    // Get the origin from the request headers for proper redirect URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`
    })
    
    // Add detailed debugging information
    console.log('Password reset attempt:', {
      email,
      redirectTo: `${origin}/auth/reset-password`,
      hasError: !!error,
      errorMessage: error?.message,
      timestamp: new Date().toISOString()
    })

    if (error) {
      console.error('Supabase resetPasswordForEmail error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Password reset email sent successfully'
    })

  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
