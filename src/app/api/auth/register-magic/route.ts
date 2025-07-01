import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    // Basic validation
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // If user exists but hasn't completed profile setup, allow them to continue
      if (!existingUser.profileSetupCompleted) {
        // Update their name if it's different
        if (existingUser.name !== name) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { name },
          })
        }

        // Create verification token using NextAuth's EmailProvider
        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token: crypto.randomUUID(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        })

        return NextResponse.json(
          { message: 'Magic link sent successfully' },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create a new user without a password
    await prisma.user.create({
      data: {
        email,
        name,
        profileSetupCompleted: false,
      },
    })

    // Create verification token for the magic link
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: crypto.randomUUID(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    return NextResponse.json(
      { message: 'Magic link registration initiated' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error during magic link registration:', error)
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
