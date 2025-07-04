import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { attempts: number; lastAttempt: number }>()

// Rate limiting config
const RATE_LIMIT = {
  maxAttempts: 3, // Max 3 password change attempts
  windowMs: 15 * 60 * 1000, // 15 minutes window
  blockDurationMs: 30 * 60 * 1000, // 30 minutes block after limit exceeded
}

function checkRateLimit(email: string): { allowed: boolean; remainingAttempts?: number; resetTime?: number } {
  const now = Date.now()
  const userLimit = rateLimitMap.get(email)

  if (!userLimit) {
    // First attempt
    rateLimitMap.set(email, { attempts: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 }
  }

  // Check if the window has expired
  if (now - userLimit.lastAttempt > RATE_LIMIT.windowMs) {
    // Reset the window
    rateLimitMap.set(email, { attempts: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 }
  }

  // Check if user is blocked
  if (userLimit.attempts >= RATE_LIMIT.maxAttempts) {
    const blockEndTime = userLimit.lastAttempt + RATE_LIMIT.blockDurationMs
    if (now < blockEndTime) {
      return { 
        allowed: false, 
        resetTime: Math.ceil((blockEndTime - now) / 1000 / 60) // minutes remaining
      }
    } else {
      // Block period has expired, reset
      rateLimitMap.set(email, { attempts: 1, lastAttempt: now })
      return { allowed: true, remainingAttempts: RATE_LIMIT.maxAttempts - 1 }
    }
  }

  // Increment attempts
  userLimit.attempts += 1
  userLimit.lastAttempt = now
  rateLimitMap.set(email, userLimit)

  return { 
    allowed: true, 
    remainingAttempts: RATE_LIMIT.maxAttempts - userLimit.attempts 
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(session.user.email)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ 
        error: `Too many password change attempts. Please try again in ${rateLimitResult.resetTime} minutes.`,
        rateLimited: true,
        resetTime: rateLimitResult.resetTime
      }, { status: 429 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Current password and new password are required' 
      }, { status: 400 })
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'New password must be at least 8 characters long' 
      }, { status: 400 })
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json({ 
        error: 'New password must contain at least one uppercase letter, one lowercase letter, and one number' 
      }, { status: 400 })
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has a password (for OAuth users)
    if (!user.password) {
      return NextResponse.json({ 
        error: 'Password change not available for social login accounts' 
      }, { status: 400 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        error: 'Current password is incorrect',
        remainingAttempts: rateLimitResult.remainingAttempts
      }, { status: 400 })
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json({ 
        error: 'New password must be different from current password' 
      }, { status: 400 })
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    // Clear rate limit on successful password change
    rateLimitMap.delete(session.user.email)

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
