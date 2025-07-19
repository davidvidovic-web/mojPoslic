import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/email'
import { z } from 'zod'

const prisma = new PrismaClient()

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    // Check if user exists and isn't already verified
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'This email address is already verified' },
        { status: 400 }
      )
    }

    // Try to delete any existing verification tokens for this email (ignore errors if table has constraints)
    try {
      await prisma.verificationToken.deleteMany({
        where: { identifier: email }
      })
    } catch {
      // Could not delete existing verification tokens (this is OK)
      // Continue - new token will still be created
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires: verificationExpires,
      }
    })

    // Send verification email with localization
    const emailResult = await emailService.sendVerificationEmail(
      email, 
      verificationCode,
      user.name || undefined,
      'bs' // default to Bosnian
    )
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'A new verification code has been sent to your email.'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    
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
