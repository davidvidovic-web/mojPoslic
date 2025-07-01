import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient, UserRole } from '@prisma/client'
import { validatePassword } from '@/lib/password-validation'
import { validateUsernameFormat, generateUsernameSuggestions } from '@/lib/username-validation'

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
    const { email, password, name, username: providedUsername } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate username if not provided
    let username = providedUsername
    if (!username) {
      const suggestions = generateUsernameSuggestions(name, email)
      
      // Try to find an available username from suggestions
      for (const suggestion of suggestions) {
        const existingUser = await prisma.user.findUnique({
          where: { username: suggestion }
        })
        
        if (!existingUser) {
          username = suggestion
          break
        }
      }
      
      // If no suggestion worked, generate a unique one with timestamp
      if (!username) {
        const baseName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        const timestamp = Date.now().toString().slice(-6)
        let candidateUsername = `${baseName}${timestamp}`
        
        // Make sure it's valid format
        if (candidateUsername.length < 3) {
          candidateUsername = `user${timestamp}`
        }
        
        // Double-check it's unique
        const existingUser = await prisma.user.findUnique({
          where: { username: candidateUsername }
        })
        
        if (!existingUser) {
          username = candidateUsername
        } else {
          // Last resort: add random suffix
          username = `user${Date.now().toString()}`
        }
      }
    }

    // Username format validation
    const usernameValidation = validateUsernameFormat(username)
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        { error: usernameValidation.error },
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

    // Check if user already exists (email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword,
        role: 'tasker' as UserRole, // Default role, will be updated in profile setup
        profileSetupCompleted: false
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
