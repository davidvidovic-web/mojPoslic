import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const checkUsernameSchema = z.object({
  username: z.string().min(1, 'Username is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = checkUsernameSchema.parse(body)

    // Check if username exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    return NextResponse.json({
      available: !existingUser
    })

  } catch (error) {
    console.error('Check username error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
