import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to set a password' },
        { status: 401 }
      )
    }

    const { password } = await request.json()

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the user's password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        emailVerified: new Date(), // Mark email as verified
      },
    })

    return NextResponse.json(
      { message: 'Password set successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error setting password:', error)
    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
