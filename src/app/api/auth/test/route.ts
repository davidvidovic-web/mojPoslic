import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Auth Test Endpoint ===')
    
    // Test both authentication methods
    let user = null
    let method = 'none'

    // Test Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const supabaseWithToken = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          cookies: {
            get: () => undefined,
            set: () => {},
            remove: () => {}
          }
        }
      )
      
      const { data: tokenUser, error: tokenError } = await supabaseWithToken.auth.getUser()
      if (!tokenError && tokenUser) {
        user = tokenUser
        method = 'header'
        console.log('Auth via header successful, user ID:', user.id)
      } else {
        console.log('Auth via header failed:', tokenError?.message)
      }
    }

    // Test cookies if header auth didn't work
    if (!user) {
      console.log('Trying cookie-based auth...')
      const supabase = await createServerSupabaseClient()
      const { data: cookieData, error: cookieError } = await supabase.auth.getUser()
      
      if (!cookieError && cookieData?.user) {
        user = cookieData.user
        method = 'cookies'
        console.log('Auth via cookies successful, user ID:', user.id)
      } else {
        console.log('Auth via cookies failed:', cookieError?.message)
      }
    }

    return NextResponse.json({
      authenticated: !!user,
      method,
      userId: user?.id || null,
      email: user?.email || null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { error: 'Test failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}