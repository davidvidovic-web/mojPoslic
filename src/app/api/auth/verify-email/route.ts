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

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      )
    }

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
      // Try to delete expired token (ignore errors if table has constraints)
      try {
        await prisma.verificationToken.delete({
          where: { token: code }
        })        } catch {
          // Could not delete expired verification token (this is OK)
      }
      
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

    // Update user as verified (but don't mark profile as completed yet)
    // Profile will be completed after role selection
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerified: true,
        // Don't set profileSetupCompleted here - will be set after role selection
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        profileSetupCompleted: true
      }
    })
    
    // Try to delete the verification token (ignore errors if table has constraints)
    try {
      await prisma.verificationToken.delete({
        where: { token: code }
      })      } catch {
        // Could not delete verification token (this is OK)
      // Continue - the token will expire naturally
    }

    return NextResponse.json({
      message: 'Email verified successfully!',
      user: updatedUser,
      shouldRedirectToRoleSelection: !updatedUser.role || !updatedUser.profileSetupCompleted
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
