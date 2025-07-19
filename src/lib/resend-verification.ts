import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/email'

export async function resendVerificationEmail(email: string): Promise<{
  success: boolean
  error?: string
  messageId?: string
}> {
  const prisma = new PrismaClient()

  try {
    // Check if user exists and needs verification
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        preferredLanguage: true,
      }
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    if (user.emailVerified) {
      return {
        success: false,
        error: 'Email already verified'
      }
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires: verificationExpires,
      }
    })

    // Send verification email with user's name and preferred language
    const userLocale = (user.preferredLanguage === 'en' || user.preferredLanguage === 'bs') 
      ? user.preferredLanguage 
      : 'bs' // Default to Bosnian if not set or invalid
      
    const emailResult = await emailService.sendVerificationEmail(
      email,
      verificationCode,
      user.name || undefined,
      userLocale
    )

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return {
        success: false,
        error: 'Failed to send verification email'
      }
    }

    return {
      success: true,
      messageId: emailResult.messageId
    }

  } catch (error) {
    console.error('Error in resendVerificationEmail:', error)
    return {
      success: false,
      error: 'Internal server error'
    }
  } finally {
    await prisma.$disconnect()
  }
}
