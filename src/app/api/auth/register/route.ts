import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { validatePassword } from '@/lib/password-validation'

const prisma = new PrismaClient()

/**
 * User Registration API
 * 
 * Features:
 * - Strong password validation using the same system as password change
 * - Server-side validation with detailed error messages
 * - Personal information detection (prevents using name/email in password)
 * - Common password detection
 * - Sequential/repeated character detection
 * - Password strength scoring and requirement validation
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'employee' } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Password strength validation
    const passwordValidation = validatePassword(password, {
      name,
      email
    })

    if (!passwordValidation.isValid) {
      const errorRequirements = passwordValidation.requirements.filter(req => !req.met && req.severity === 'error')
      const errorMessages = errorRequirements.map(req => req.label)
      
      return NextResponse.json(
        { 
          error: 'Password does not meet security requirements',
          requirements: errorMessages,
          passwordStrength: passwordValidation
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as 'admin' | 'employer' | 'employee',
      }
    })

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
