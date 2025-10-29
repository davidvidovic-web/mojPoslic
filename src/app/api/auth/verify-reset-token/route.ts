import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, type } = await request.json()
    
    if (!token || type !== 'recovery') {
      return NextResponse.json(
        { error: 'Invalid token or type' },
        { status: 400 }
      )
    }

    console.log('Verifying reset token server-side...', {
      hasToken: !!token,
      type,
      timestamp: new Date().toISOString()
    })

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    try {
      // Try to decode and verify the JWT token manually first
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        return NextResponse.json(
          { error: 'Invalid token format', valid: false },
          { status: 400 }
        )
      }

      // Decode the payload (base64url decode)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64url').toString())
      console.log('Token payload:', {
        exp: payload.exp,
        iat: payload.iat,
        sub: payload.sub,
        email: payload.email,
        currentTime: Math.floor(Date.now() / 1000)
      })

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token is expired')
        return NextResponse.json(
          { error: 'Token expired', valid: false },
          { status: 400 }
        )
      }

      // For password reset tokens, we can verify by getting the user from the payload
      // and then checking if they exist in the database
      if (!payload.sub || !payload.email) {
        console.error('Token missing required fields')
        return NextResponse.json(
          { error: 'Invalid token format', valid: false },
          { status: 400 }
        )
      }

      // Verify the user exists using admin API
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(payload.sub)
      
      if (error || !data.user) {
        console.error('User verification failed:', error)
        return NextResponse.json(
          { error: 'Invalid or expired token', valid: false },
          { status: 400 }
        )
      }

      // Double-check email matches
      if (data.user.email !== payload.email) {
        console.error('Email mismatch in token')
        return NextResponse.json(
          { error: 'Invalid token', valid: false },
          { status: 400 }
        )
      }

      console.log('Token verified successfully:', {
        userId: data.user.id,
        email: data.user.email
      })

      return NextResponse.json({
        valid: true,
        user: {
          id: data.user.id,
          email: data.user.email
        },
        tokenInfo: {
          expiresAt: payload.exp,
          issuedAt: payload.iat,
          timeUntilExpiry: payload.exp ? payload.exp - currentTime : null
        }
      })

    } catch (verifyError) {
      console.error('Token verification error:', verifyError)
      return NextResponse.json(
        { error: 'Token verification failed', valid: false },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Reset token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}