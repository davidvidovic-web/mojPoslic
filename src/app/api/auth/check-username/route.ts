import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateUsernameFormat } from '@/lib/username-validation'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validate format first
    const formatValidation = validateUsernameFormat(username)
    if (!formatValidation.isValid) {
      return NextResponse.json(
        { 
          available: false, 
          error: formatValidation.error 
        },
        { status: 400 }
      )
    }

    // Check if username exists in database
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    const available = !existingUser

    return NextResponse.json({ available })
  } catch (error) {
    console.error('Username availability check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
