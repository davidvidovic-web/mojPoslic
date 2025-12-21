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
    // Support domain-based routing for both Bosnian and English sites
    let origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL
    
    // Handle domain-based routing
    if (!origin || origin.includes('localhost')) {
      // Default to Bosnian domain in development
      origin = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://mojposlic.com'
    } else if (origin.includes('en.mojposlic.com')) {
      // Preserve English domain for English users
      origin = 'https://en.mojposlic.com'
    } else {
      // Default to Bosnian domain for main site
      origin = 'https://mojposlic.com'
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
      captchaToken: undefined // Ensure no captcha issues
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
