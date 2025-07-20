import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

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
    const existingPending = await prisma.pendingRegistration.findUnique({
      where: { email }
    })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    if (existingPending) {
      // Update existing pending registration
      await prisma.pendingRegistration.update({
        where: { email },
        data: {
          hashedPassword,
          verificationCode,
          expires: verificationExpires
        }
      })
    } else {
      // Create new pending registration
      await prisma.pendingRegistration.create({
        data: {
          email,
          hashedPassword,
          verificationCode,
          expires: verificationExpires
        }
      })
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

    // Prepare response object
    const response: {
      message: string
      redirectTo: string
      developmentMode?: boolean
      verificationCode?: string
    } = {
      message: 'Verification code sent. Please check your email.',
      redirectTo: `/auth/verify-email?email=${encodeURIComponent(email)}`
    }

    // In development mode, include the verification code in the response
    if (emailResult.developmentMode && emailResult.verificationCode) {
      response.developmentMode = true
      response.verificationCode = emailResult.verificationCode
      response.message = `Development mode: Verification code is ${emailResult.verificationCode}. Email sending is disabled.`
    }

    return NextResponse.json(response)

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
