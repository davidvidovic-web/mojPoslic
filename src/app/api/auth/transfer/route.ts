import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const redirectPath = searchParams.get('redirect') || '/'

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Verify the transfer token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    
    try {
      const { payload } = await jwtVerify(token, secret)
      
      // Validate user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })

      if (!user) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      // TODO: Update user's language preference when migration is applied
      // await prisma.user.update({
      //   where: { id: user.id },
      //   data: { preferredLanguage: payload.targetLanguage as string }
      // })

      // Create a response that will redirect to the target page
      const targetUrl = new URL(redirectPath, request.url)
      targetUrl.searchParams.set('transferred', 'true')
      const response = NextResponse.redirect(targetUrl)
      
      // Set a flag cookie that tells NextAuth to create a new session
      // This works with NextAuth's session strategy
      response.cookies.set('auth-transfer', JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLanguage: payload.targetLanguage
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 300, // 5 minutes
        path: '/'
      })

      return response

    } catch (jwtError) {
      console.error('Invalid transfer token:', jwtError)
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

  } catch (error) {
    console.error('Transfer authentication error:', error)
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}
