import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/email'
import { z } from 'zod'

const prisma = new PrismaClient()

// Simple translation function for server-side API
function getErrorMessage(key: string, locale: string = 'en') {
  const messages = {
    en: {
      noAccount: 'No account found with this email address',
      alreadyVerified: 'This email address is already verified',
      newCodeSent: 'A new verification code has been sent to your email',
      sendFailed: 'Failed to send verification email. Please try again.',
      internalError: 'Internal server error'
    },
    bs: {
      noAccount: 'Nije pronađen račun sa ovim email-om',
      alreadyVerified: 'Ovaj email je već verificiran',
      newCodeSent: 'Novi verifikacijski kod je poslan na vaš email',
      sendFailed: 'Slanje verifikacijskog email-a nije uspjelo. Molimo pokušajte ponovo.',
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

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  const locale = getLocaleFromRequest(request)
  
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    // First check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: getErrorMessage('alreadyVerified', locale) },
        { status: 400 }
      )
    }

    // Check if there's a pending registration for this email
    const pendingRegistration = await prisma.$queryRaw`
      SELECT * FROM pending_registrations 
      WHERE email = ${email}
      LIMIT 1
    ` as Array<{
      id: string
      email: string
      hashed_password: string
      verification_code: string
      expires: Date
      created_at: Date
    }>

    if (pendingRegistration.length === 0 && !existingUser) {
      return NextResponse.json(
        { error: getErrorMessage('noAccount', locale) },
        { status: 404 }
      )
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    if (pendingRegistration.length > 0) {
      // Update existing pending registration with new code
      await prisma.$queryRaw`
        UPDATE pending_registrations 
        SET verification_code = ${verificationCode}, expires = ${verificationExpires}
        WHERE email = ${email}
      `
    } else if (existingUser && !existingUser.emailVerified) {
      // For unverified existing users, we need to create a pending registration
      // This shouldn't normally happen but could occur in edge cases
      return NextResponse.json(
        { error: getErrorMessage('internalError', locale) },
        { status: 500 }
      )
    }

    // Send verification email with proper localization
    const emailResult = await emailService.sendVerificationEmail(
      email, 
      verificationCode,
      undefined, // Name will be set during profile setup
      locale as 'en' | 'bs'
    )
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json(
        { error: getErrorMessage('sendFailed', locale) },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: getErrorMessage('newCodeSent', locale)
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
      { error: getErrorMessage('internalError', locale) },
      { status: 500 }
    )
  }
}
