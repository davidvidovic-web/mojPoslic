import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { SignJWT } from 'jose'

// Create a temporary transfer token for cross-domain authentication
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { targetLanguage, redirectPath } = await request.json()

    // Validate language
    if (!targetLanguage || !['en', 'bs'].includes(targetLanguage)) {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      )
    }

    // Create a temporary transfer token that's valid for 60 seconds
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    const transferToken = await new SignJWT({
      userId: session.user.id,
      email: session.user.email,
      targetLanguage,
      exp: Math.floor(Date.now() / 1000) + 60 // 60 seconds expiry
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('60s')
      .sign(secret)

    // Determine target domain
    const currentUrl = new URL(request.url)
    
    let targetDomain: string
    if (targetLanguage === 'en') {
      if (process.env.NODE_ENV === 'development') {
        targetDomain = currentUrl.hostname.startsWith('en.') 
          ? currentUrl.hostname 
          : `en.localhost:${currentUrl.port || '3000'}`
      } else {
        targetDomain = 'en.mojposlic.com'
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        targetDomain = `localhost:${currentUrl.port || '3000'}`
      } else {
        targetDomain = 'mojposlic.com'
      }
    }

    const targetUrl = `${currentUrl.protocol}//${targetDomain}/api/auth/transfer?token=${transferToken}&redirect=${encodeURIComponent(redirectPath || '/')}`

    return NextResponse.json({
      success: true,
      redirectUrl: targetUrl,
      transferToken
    })

  } catch (error) {
    console.error('Error creating transfer token:', error)
    return NextResponse.json(
      { error: 'Failed to create transfer token' },
      { status: 500 }
    )
  }
}
