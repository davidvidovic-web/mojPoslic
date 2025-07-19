import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Check if username exists (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
      select: { id: true }
    })

    return NextResponse.json({ exists: !!existingUser })
  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json(
      { error: 'Failed to check username' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
