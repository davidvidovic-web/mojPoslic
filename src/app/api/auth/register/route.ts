import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { generateUniqueUsernameFromEmail } from '@/lib/username-validation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate unique username from email
    const username = await generateUniqueUsernameFromEmail(email)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes (shorter for codes)

    // Create user with email verification
    const user = await prisma.user.create({
      data: {
        name: '', // Let user enter their own name during profile setup
        username,
        email,
        password: hashedPassword,
        role: 'client',
        profileSetupCompleted: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      }
    })

    // Create verification token
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
      // Don't fail registration if email fails, but log it
    }

    // For localhost development, log the verification code
    if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development') {
      // Verification code available in development via response message
    }

    return NextResponse.json({
      message: process.env.NODE_ENV === 'development' 
        ? `Account created successfully. Your verification code is: ${verificationCode}` 
        : 'Account created successfully. Please check your email for your verification code.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      ...(process.env.NODE_ENV === 'development' && { verificationCode }),
      redirectTo: `/auth/verify-email?email=${encodeURIComponent(email)}`
    })

  } catch (error) {
    console.error('Registration error:', error)
    
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
