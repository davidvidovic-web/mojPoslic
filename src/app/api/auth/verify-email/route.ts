import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = verifyEmailSchema.parse(body)

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: code }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token: code }
      })
      
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Find the user and verify their email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user as verified and delete the token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { 
          emailVerified: true,
          profileSetupCompleted: true 
        }
      }),
      prisma.verificationToken.delete({
        where: { token: code }
      })
    ])

    return NextResponse.json({
      message: 'Email verified successfully!'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
