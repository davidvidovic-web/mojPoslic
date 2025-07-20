import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateUniqueUsernameFromEmail } from '@/lib/username-validation'
import { z } from 'zod'

const prisma = new PrismaClient()

// Simple translation function for server-side API
function getErrorMessage(key: string, locale: string = 'en') {
  const messages = {
    en: {
      invalidCode: 'Invalid verification code',
      expiredCode: 'Verification code has expired',
      invalidOrExpiredCode: 'Invalid or expired verification code',
      userExists: 'User with this email already exists',
      emailVerified: 'Email verified successfully!',
      accountExists: 'Account already exists and is verified. Please sign in.',
      internalError: 'Internal server error'
    },
    bs: {
      invalidCode: 'Neispravan verifikacijski kod',
      expiredCode: 'Verifikacijski kod je istekao',
      invalidOrExpiredCode: 'Neispravan ili istekao verifikacijski kod',
      userExists: 'Korisnik sa ovim email-om već postoji',
      emailVerified: 'Email je uspješno verificiran!',
      accountExists: 'Račun već postoji i verificiran je. Molimo prijavite se.',
      internalError: 'Interna greška servera'
    }
  }
  return messages[locale as keyof typeof messages]?.[key as keyof typeof messages.en] || messages.en[key as keyof typeof messages.en]
}

// Get user's preferred language from request headers
function getLocaleFromRequest(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || ''
  return acceptLanguage.includes('bs') ? 'bs' : 'en'
}

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
  const locale = getLocaleFromRequest(request)
  
  try {
    const body = await request.json()
    const { code } = verifyEmailSchema.parse(body)

    // Find the pending registration with better debugging
    const currentTime = new Date()
    console.log('Verification attempt:', { code, currentTime })
    
    const pendingRegistrationResults = await prisma.$queryRaw`
      SELECT * FROM pending_registrations 
      WHERE verification_code = ${code}
      LIMIT 1
    ` as PendingRegistrationRecord[]

    console.log('Found pending registrations:', pendingRegistrationResults.length)

    const pendingRegistration = pendingRegistrationResults[0]

    if (!pendingRegistration) {
      console.log('No pending registration found for code:', code)
      return NextResponse.json(
        { error: getErrorMessage('invalidCode', locale) },
        { status: 400 }
      )
    }

    console.log('Found pending registration:', {
      id: pendingRegistration.id,
      email: pendingRegistration.email,
      verification_code: pendingRegistration.verification_code,
      expires: pendingRegistration.expires
    })

    // Check if the code has expired
    const isExpired = new Date(pendingRegistration.expires) < currentTime
    console.log('Expiration check:', { 
      expires: pendingRegistration.expires, 
      currentTime, 
      isExpired 
    })

    if (isExpired) {
      console.log('Verification code expired')
      return NextResponse.json(
        { error: getErrorMessage('expiredCode', locale) },
        { status: 400 }
      )
    }

    console.log('About to check for existing user with email:', pendingRegistration.email)

    // Check if user already exists (edge case)
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: pendingRegistration.email }
      })
      console.log('Existing user query completed successfully')
    } catch (existingUserError) {
      console.error('Error checking for existing user:', existingUserError)
      throw existingUserError
    }

    console.log('Existing user check:', { 
      email: pendingRegistration.email, 
      existingUser: existingUser ? {
        id: existingUser.id,
        email: existingUser.email,
        emailVerified: existingUser.emailVerified,
        role: existingUser.role
      } : null 
    })

    if (existingUser) {
      console.log('User already exists, cleaning up pending registration')
      // Clean up pending registration
      await prisma.$queryRaw`
        DELETE FROM pending_registrations WHERE id = ${pendingRegistration.id}
      `
      
      if (existingUser.emailVerified) {
        console.log('User already verified, redirecting to sign in')
        // User already exists and email is verified (likely OAuth signup)
        return NextResponse.json({
          message: getErrorMessage('accountExists', locale),
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
            emailVerified: existingUser.emailVerified,
            profileSetupCompleted: existingUser.profileSetupCompleted
          },
          shouldRedirectToSignIn: true
        })
      } else {
        console.log('User exists but not verified, updating user')
        // User exists but email not verified - verify it now
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            emailVerified: true,
            password: pendingRegistration.hashed_password // Update password from pending registration
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
        
        return NextResponse.json({
          message: getErrorMessage('emailVerified', locale),
          user: updatedUser,
          shouldRedirectToRoleSelection: !updatedUser.role || !updatedUser.profileSetupCompleted
        })
      }
    }

    console.log('No existing user found, creating new user')
    // Generate unique username from email
    const username = await generateUniqueUsernameFromEmail(pendingRegistration.email)

    console.log('Generated username:', username)
    console.log('About to create user with:', {
      email: pendingRegistration.email,
      username,
      emailVerified: true
    })

    // Create the actual user account now that email is verified
    try {
      const user = await prisma.user.create({
        data: {
          name: '', // Let user enter their own name during profile setup
          username,
          email: pendingRegistration.email,
          password: pendingRegistration.hashed_password,
          // No role set - user will choose it in role selection step
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
      
      console.log('User created successfully:', user.id)
      
      // Don't initialize connections here - wait until after role selection
      
      // Clean up pending registration
      await prisma.$queryRaw`
        DELETE FROM pending_registrations WHERE id = ${pendingRegistration.id}
      `

      return NextResponse.json({
        message: getErrorMessage('emailVerified', locale),
        user: user,
        shouldRedirectToRoleSelection: !user.role || !user.profileSetupCompleted
      })
    } catch (createError: unknown) {
      console.error('Error creating user:', createError)
      
      // If it's a unique constraint error on email, it means another user was created between our check and creation
      if (createError && typeof createError === 'object' && 'code' in createError && 
          createError.code === 'P2002' && 'meta' in createError &&
          createError.meta && typeof createError.meta === 'object' && 'target' in createError.meta &&
          Array.isArray(createError.meta.target) && createError.meta.target.includes('email')) {
        console.log('Race condition detected - user was created by another request')
        
        // Try to find the user again and return appropriate response
        const raceConditionUser = await prisma.user.findUnique({
          where: { email: pendingRegistration.email }
        })
        
        if (raceConditionUser) {
          // Clean up pending registration
          await prisma.$queryRaw`
            DELETE FROM pending_registrations WHERE id = ${pendingRegistration.id}
          `
          
          return NextResponse.json({
            message: getErrorMessage('emailVerified', locale),
            user: {
              id: raceConditionUser.id,
              email: raceConditionUser.email,
              name: raceConditionUser.name,
              role: raceConditionUser.role,
              emailVerified: raceConditionUser.emailVerified,
              profileSetupCompleted: raceConditionUser.profileSetupCompleted
            },
            shouldRedirectToRoleSelection: !raceConditionUser.role || !raceConditionUser.profileSetupCompleted
          })
        }
      }
      
      // Re-throw the error if we can't handle it
      throw createError
    }

  } catch (error) {
    console.error('Email verification error:', error)
    const locale = getLocaleFromRequest(request)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: getErrorMessage('internalError', locale) },
      { status: 500 }
    )
  }
}
