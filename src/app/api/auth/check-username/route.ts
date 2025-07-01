import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateUsernameFormat } from '@/lib/username-validation'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ name: user.name })
  } catch (error) {
    console.error('Error checking username:', error)
    return NextResponse.json(
      { error: 'Failed to check username' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

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
