import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's privacy settings
    const privacySettings = await prisma.userPrivacySettings.findUnique({
      where: { userId: user.id }
    })

    // Return default settings if none exist
    if (!privacySettings) {
      return NextResponse.json({
        profileVisibility: 'public',
        showSkills: true,
        showExperience: true,
        showContactInfo: false,
        showLocation: true,
        applicationPrivacy: 'open',
        allowDirectMessages: true,
        showOnlineStatus: true,
        dataSharing: false,
        analyticsOptOut: false,
      })
    }

    return NextResponse.json(privacySettings)
  } catch (error) {
    console.error('Failed to fetch privacy settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const privacyData = await request.json()

    // Validate privacy data
    const validVisibilityOptions = ['public', 'verified_only', 'private']
    const validApplicationPrivacyOptions = ['open', 'selective', 'private']

    if (!validVisibilityOptions.includes(privacyData.profileVisibility)) {
      return NextResponse.json(
        { error: 'Invalid profile visibility option' },
        { status: 400 }
      )
    }

    if (!validApplicationPrivacyOptions.includes(privacyData.applicationPrivacy)) {
      return NextResponse.json(
        { error: 'Invalid application privacy option' },
        { status: 400 }
      )
    }

    // Update or create privacy settings
    const updatedSettings = await prisma.userPrivacySettings.upsert({
      where: { userId: user.id },
      update: {
        profileVisibility: privacyData.profileVisibility,
        showSkills: privacyData.showSkills,
        showExperience: privacyData.showExperience,
        showContactInfo: privacyData.showContactInfo,
        showLocation: privacyData.showLocation,
        applicationPrivacy: privacyData.applicationPrivacy,
        allowDirectMessages: privacyData.allowDirectMessages,
        showOnlineStatus: privacyData.showOnlineStatus,
        dataSharing: privacyData.dataSharing,
        analyticsOptOut: privacyData.analyticsOptOut,
      },
      create: {
        userId: user.id,
        profileVisibility: privacyData.profileVisibility,
        showSkills: privacyData.showSkills,
        showExperience: privacyData.showExperience,
        showContactInfo: privacyData.showContactInfo,
        showLocation: privacyData.showLocation,
        applicationPrivacy: privacyData.applicationPrivacy,
        allowDirectMessages: privacyData.allowDirectMessages,
        showOnlineStatus: privacyData.showOnlineStatus,
        dataSharing: privacyData.dataSharing,
        analyticsOptOut: privacyData.analyticsOptOut,
      }
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Failed to update privacy settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
