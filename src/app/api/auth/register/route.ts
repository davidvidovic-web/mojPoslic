import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

// Simple CUID generator function
function generateCuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

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

    // Check if there's already a pending registration
    const existingPending = await prisma.$queryRaw`
      SELECT * FROM pending_registrations WHERE email = ${email} LIMIT 1
    ` as Array<{ id: string; email: string; hashed_password: string; verification_code: string; expires: Date; created_at: Date }>

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    if (existingPending && existingPending.length > 0) {
      // Update existing pending registration
      await prisma.$queryRaw`
        UPDATE pending_registrations 
        SET hashed_password = ${hashedPassword}, 
            verification_code = ${verificationCode},
            expires = ${verificationExpires}
        WHERE email = ${email}
      `
    } else {
      // Create new pending registration
      await prisma.$queryRaw`
        INSERT INTO pending_registrations (id, email, hashed_password, verification_code, expires, created_at)
        VALUES (${generateCuid()}, ${email}, ${hashedPassword}, ${verificationCode}, ${verificationExpires}, ${new Date()})
      `
    }

    // Send verification email with localization
    const emailResult = await emailService.sendVerificationEmail(
      email, 
      verificationCode, 
      undefined, // name will be set during profile setup
      'bs' // default to Bosnian
    )
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json({
        error: 'Account created successfully, but there was an issue sending the verification email. Please try resending it.',
        redirectTo: `/auth/verify-email?email=${encodeURIComponent(email)}`,
        emailError: true
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Verification code sent. Please check your email.',
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
