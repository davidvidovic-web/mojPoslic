import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function PUT(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { language } = await request.json()

    // Validate language
    if (!language || !['en', 'bs'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "en" or "bs"' },
        { status: 400 }
      )
    }

    // Update user's language preference
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredLanguage: language },
      select: {
        id: true,
        preferredLanguage: true,
      }
    })

    return NextResponse.json({
      success: true,
      preferredLanguage: updatedUser.preferredLanguage
    })

  } catch (error) {
    console.error('Error updating language preference:', error)
    return NextResponse.json(
      { error: 'Failed to update language preference' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
