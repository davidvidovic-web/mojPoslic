import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { z } from 'zod'

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

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

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

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(email, verificationCode)
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    // For localhost development, log the verification code
    if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development') {
      console.log('\n=================================')
      console.log('📧 RESENT VERIFICATION CODE FOR DEVELOPMENT')
      console.log('=================================')
      console.log(`Email: ${email}`)
      console.log(`Verification Code: ${verificationCode}`)
      console.log('=================================\n')
    }

    return NextResponse.json({
      message: process.env.NODE_ENV === 'development' 
        ? `A new verification code has been sent: ${verificationCode}` 
        : 'A new verification code has been sent to your email.',
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
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
