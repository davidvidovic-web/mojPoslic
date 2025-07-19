import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateUniqueUsernameFromEmail } from '@/lib/username-validation'
import { z } from 'zod'

const prisma = new PrismaClient()

// Type for pending registration from database
type PendingRegistrationRecord = {
  id: string
  email: string
  hashed_password: string
  verification_code: string
  expires: Date
  created_at: Date
}

const verifyEmailSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = verifyEmailSchema.parse(body)

    // Find the pending registration
    const pendingRegistrationResults = await prisma.$queryRaw`
      SELECT * FROM pending_registrations 
      WHERE verification_code = ${code} 
      AND expires > ${new Date()}
      LIMIT 1
    ` as PendingRegistrationRecord[]

    const pendingRegistration = pendingRegistrationResults[0]

    if (!pendingRegistration) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Check if user already exists (edge case)
    const existingUser = await prisma.user.findUnique({
      where: { email: pendingRegistration.email }
    })

    if (existingUser) {
      // Clean up pending registration
      await prisma.$queryRaw`
        DELETE FROM pending_registrations WHERE id = ${pendingRegistration.id}
      `
      
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate unique username from email
    const username = await generateUniqueUsernameFromEmail(pendingRegistration.email)

    // Create the actual user account now that email is verified
    const user = await prisma.user.create({
      data: {
        name: '', // Let user enter their own name during profile setup
        username,
        email: pendingRegistration.email,
        password: pendingRegistration.hashed_password,
        role: 'client',
        emailVerified: true, // Already verified
        profileSetupCompleted: false,
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
    
    // Clean up pending registration
    await prisma.$queryRaw`
      DELETE FROM pending_registrations WHERE id = ${pendingRegistration.id}
    `

    return NextResponse.json({
      message: 'Email verified successfully!',
      user: user,
      shouldRedirectToRoleSelection: !user.role || !user.profileSetupCompleted
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
